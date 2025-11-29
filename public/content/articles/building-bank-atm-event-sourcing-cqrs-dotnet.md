# Building a Bank ATM System with Event Sourcing and CQRS in .NET 9

Every transaction in a bank account tells a story. A deposit here, a withdrawal there, maybe an account deactivation—each one matters. Traditional databases update rows in place, overwriting history. But what if you need to know exactly what happened at 3:47 PM last Tuesday? Or reconstruct an account's state from any point in time?

This is where **Event Sourcing** shines.

In this article, I'll walk you through a production-ready banking system built with Event Sourcing, CQRS, and Domain-Driven Design in .NET 9. We'll cover real code, real patterns, and real trade-offs—everything you need to implement this architecture in your own projects.

---

## Why Event Sourcing for Financial Systems?

Traditional CRUD systems have a fundamental problem: they only store the current state. When you update a bank balance from £1,000 to £1,250, the £1,000 is gone forever.

**Event Sourcing flips this model.** Instead of storing state, you store the events that led to that state:

```
AccountCreated { balance: 1000 }
MoneyDeposited { amount: 500 }
CashWithdrawn { amount: 250 }
```

The current balance (£1,250) is derived by replaying these events. This gives you:

- **Complete audit trail** — Every change is recorded with timestamp and context
- **Temporal queries** — Reconstruct state at any point in time
- **Debug superpowers** — Replay events to understand exactly what happened
- **Regulatory compliance** — Financial regulators love immutable audit logs

---

## Architecture Overview

The ScratchBank ATM system follows Clean Architecture with four distinct layers:

```
┌─────────────────────────────────────────────────────────┐
│                      API Layer                          │
│              (Controllers, HTTP Endpoints)              │
├─────────────────────────────────────────────────────────┤
│                  Application Layer                      │
│         (Commands, Queries, Handlers, DTOs)             │
├─────────────────────────────────────────────────────────┤
│                    Domain Layer                         │
│    (Aggregates, Events, Value Objects, Exceptions)      │
├─────────────────────────────────────────────────────────┤
│                Infrastructure Layer                     │
│  (Event Store, Projections, Messaging, Repositories)    │
└─────────────────────────────────────────────────────────┘
```

Each layer has a specific responsibility, and dependencies flow inward—infrastructure depends on domain, never the reverse.

---

## The Domain Layer: Where Business Logic Lives

### The BankAccount Aggregate

An aggregate is a cluster of domain objects treated as a single unit. The `BankAccount` aggregate encapsulates all banking business rules:

```csharp
public class BankAccount : AggregateRoot
{
    public AccountNumber AccountNumber { get; private set; }
    public string OwnerName { get; private set; }
    public Money Balance { get; private set; }
    public bool IsActive { get; private set; }

    public static BankAccount Create(Guid id, AccountNumber accountNumber, 
        string ownerName, decimal initialBalance = 0)
    {
        var account = new BankAccount { Id = id };

        account.AddEvent(new BankAccountCreatedEvent(
            id,
            accountNumber.Value,
            ownerName,
            initialBalance));

        return account;
    }

    public void DepositMoney(Money amount)
    {
        EnsureActiveAccount();

        if (amount.Amount <= 0)
            throw new DepositAmountMustBePositiveException(amount.Amount);

        AddEvent(new MoneyDepositedEvent(
            Id,
            amount.Amount,
            amount.Currency,
            Balance.Amount + amount.Amount));
    }

    public void WithdrawCash(Money amount)
    {
        EnsureActiveAccount();

        if (amount.Amount <= 0)
            throw new WithdrawalAmountMustBePositiveException(amount.Amount);

        if (Balance.Amount < amount.Amount)
            throw new InsufficientFundsException(Id, amount.Amount, Balance.Amount);

        AddEvent(new CashWithdrawnEvent(
            Id,
            amount.Amount,
            amount.Currency,
            Balance.Amount - amount.Amount));
    }
}
```

Notice how state changes happen through events. The `DepositMoney` method doesn't directly modify `Balance`—it creates a `MoneyDepositedEvent`. This is the core principle of Event Sourcing.

### Value Objects: Enforcing Invariants

Value Objects encapsulate validation rules and ensure data integrity:

```csharp
public record Money
{
    public decimal Amount { get; }
    public string Currency { get; }

    private Money(decimal amount, string currency = "GBP")
    {
        if (string.IsNullOrWhiteSpace(currency))
            throw new InvalidCurrencyException(currency);

        Amount = decimal.Round(amount, 2);
        Currency = currency;
    }

    public static Money Create(decimal amount, string currency = "GBP") 
        => new Money(amount, currency);

    public static Money Zero => new Money(0);
}
```

The `Money` value object guarantees that:
- Currency is always valid
- Amounts are always rounded to 2 decimal places
- All money operations are type-safe

### Domain Events: The Source of Truth

Domain events capture business occurrences as immutable records:

```csharp
public abstract record DomainEvent
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public DateTime Timestamp { get; init; } = DateTime.UtcNow;
    public int Version { get; init; }
}

public record MoneyDepositedEvent(
    Guid AccountId,
    decimal Amount,
    string Currency,
    decimal NewBalance) : DomainEvent;

public record CashWithdrawnEvent(
    Guid AccountId,
    decimal Amount,
    string Currency,
    decimal NewBalance) : DomainEvent;
```

Each event is:
- **Immutable** — Once created, it never changes
- **Versioned** — Enables optimistic concurrency control
- **Timestamped** — Full temporal ordering

---

## The Event Store: Persisting Events

The Event Store is the heart of Event Sourcing. It provides append-only persistence for domain events:

```csharp
public class EfEventStore : IEventStore
{
    public async Task AppendAsync<T>(StreamId streamId, T aggregate, 
        IReadOnlyCollection<DomainEvent> uncommittedEvents)
        where T : AggregateRoot
    {
        try
        {
            foreach (var uncommittedEvent in uncommittedEvents)
            {
                var eventEntity = EventEntity.Create(
                    id: uncommittedEvent.Id,
                    streamId: streamId,
                    eventType: uncommittedEvent.GetType().Name,
                    version: uncommittedEvent.Version,
                    eventData: JsonSerializer.Serialize(uncommittedEvent, 
                        uncommittedEvent.GetType(), _jsonOptions),
                    occurredAtUtc: uncommittedEvent.Timestamp
                );

                await _dbContext.Events.AddAsync(eventEntity);
            }

            await _dbContext.SaveChangesAsync();
            aggregate.ClearUncommittedEvents();
        }
        catch (DbUpdateException ex) when (IsConcurrencyConflict(ex))
        {
            throw new ConcurrencyException(streamId.AggregateId, ex);
        }
    }
}
```

### Optimistic Concurrency Control

A unique constraint on `(AggregateType, AggregateId, Version)` prevents conflicting writes:

```sql
CREATE UNIQUE INDEX IX_Events_Stream_Version
ON Events (AggregateType, AggregateId, Version);
```

If two processes try to append version 5 simultaneously, one succeeds and one gets a concurrency exception. This is exactly what you want in a financial system.

---

## Rehydrating Aggregates: Replaying Events

To load an aggregate, we replay all its events:

```csharp
public abstract class AggregateRoot
{
    private readonly List<DomainEvent> _uncommittedEvents = [];
    public int Version { get; protected set; } = -1;

    public static T ReplayEvents<T>(IEnumerable<DomainEvent> events) 
        where T : AggregateRoot
    {
        var aggregate = (T)Activator.CreateInstance(typeof(T), nonPublic: true)!;
        
        foreach (var @event in events)
        {
            aggregate.ApplyEvent(@event);
        }
        
        aggregate.ClearUncommittedEvents();
        return aggregate;
    }

    public void ApplyEvent(DomainEvent @event)
    {
        Version = @event.Version;
        ((dynamic)this).Apply((dynamic)@event);
    }
}
```

Each event type has a corresponding `Apply` method in the aggregate:

```csharp
protected internal void Apply(MoneyDepositedEvent @event)
{
    Balance = Money.Create(@event.NewBalance, @event.Currency);
    LastTransactionDate = @event.Timestamp;
}

protected internal void Apply(CashWithdrawnEvent @event)
{
    Balance = Money.Create(@event.NewBalance, @event.Currency);
    LastTransactionDate = @event.Timestamp;
}
```

---

## CQRS: Separating Reads from Writes

CQRS (Command Query Responsibility Segregation) recognizes that read and write operations have fundamentally different requirements.

### Commands: Modifying State

Commands represent intentions to change state:

```csharp
public record DepositMoneyCommand(
    Guid AccountId,
    decimal Amount,
    string Currency) : FlagstoneAtmCommand;
```

Command handlers orchestrate the business operation:

```csharp
public class DepositMoneyCommandHandler : RequestHandlerAsync<DepositMoneyCommand>
{
    public override async Task<DepositMoneyCommand> HandleAsync(
        DepositMoneyCommand command,
        CancellationToken cancellationToken = default)
    {
        var account = await _repository.GetByIdAsync<BankAccount>(command.AccountId)
            ?? throw new AccountNotFoundException(command.AccountId);

        account.DepositMoney(Money.Create(command.Amount, command.Currency));

        await _repository.SaveAsync(account);

        return await base.HandleAsync(command, cancellationToken);
    }
}
```

### Queries: Reading State

The read side can be optimized independently. ScratchBank ATM supports **three query strategies**, each with different trade-offs:

| Strategy | Consistency | Performance | Use Case |
|----------|-------------|-------------|----------|
| **Projection** | Eventual | Fast | Dashboards, UIs |
| **EventReplay** | Immediate | Slow | Auditing, disputes |
| **Snapshot** | Immediate | Balanced | Financial reconciliation |

```csharp
public async Task<BankAccountDto?> GetAccountBalanceAsync(
    GetBankAccountQuery query,
    QueryStrategy queryStrategy = QueryStrategy.Projection) =>
    queryStrategy switch
    {
        QueryStrategy.EventReplay => await GetByEventReplayAsync(query.AccountId),
        QueryStrategy.Projection => await GetByProjectionAsync(query.AccountId),
        QueryStrategy.Snapshot => await GetBySnapshotAsync(query.AccountId),
        _ => throw new NotSupportedException()
    };
```

The API exposes this flexibility:

```http
GET /api/BankAccounts/{id}/balance?strategy=Projection
GET /api/BankAccounts/{id}/balance?strategy=EventReplay
GET /api/BankAccounts/{id}/balance?strategy=Snapshot
```

---

## Projections: Multiple Read Models from One Event Stream

One of Event Sourcing's superpowers is building multiple read models from the same events. ScratchBank ATM maintains two projections:

### 1. Balance Projection

A simple, fast lookup for current balance:

```csharp
public class BalanceTransactionCompletedProjectionHandler 
    : RequestHandlerAsync<AccountTransactionCompletedIntegrationEvent>
{
    public override async Task<AccountTransactionCompletedIntegrationEvent> HandleAsync(
        AccountTransactionCompletedIntegrationEvent @event,
        CancellationToken cancellationToken = default)
    {
        var projection = await _dbContext.BankAccountBalances
            .FirstOrDefaultAsync(p => p.AccountId == @event.AccountId);

        projection!.UpdateBalanceFromEvent(@event.NewBalance, @event.Version);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return await base.HandleAsync(@event, cancellationToken);
    }
}
```

### 2. Monthly Cash Flow Projection

An analytical view showing deposits and withdrawals by month:

```http
GET /api/BankAccounts/{id}/monthly-cashflow

Response:
[
  {
    "year": 2025,
    "month": 7,
    "totalDeposits": 750.00,
    "totalWithdrawals": 175.25,
    "netFlow": 574.75
  }
]
```

Same events, different views—no data duplication required.

---

## Snapshotting: Performance Optimization

Replaying thousands of events for every read is expensive. Snapshots solve this by periodically capturing aggregate state:

```csharp
public class SnapshotLoadingStrategy : IAggregateLoadingStrategy<BankAccount>
{
    public async Task<BankAccount?> LoadAsync(StreamId streamId)
    {
        // Try to get latest snapshot
        var (aggregate, fromVersion) = await TryRestoreFromSnapshotAsync(streamId.AggregateId);

        // Get only events AFTER the snapshot
        var partialStream = await _eventStore.GetPartialStreamAsync(streamId, fromVersion);

        if (aggregate == null)
        {
            // No snapshot - replay all events
            return AggregateRoot.ReplayEvents<BankAccount>(partialStream.Events);
        }

        // Apply only the recent events to the snapshot
        foreach (var @event in partialStream.Events)
        {
            aggregate.ApplyEvent(@event);
        }

        return aggregate;
    }
}
```

The snapshot policy determines when to create snapshots:

```csharp
public class ConfigurableSnapshotPolicy : ISnapshotPolicy
{
    public bool ShouldCreateSnapshot(AggregateRoot aggregate)
    {
        return aggregate.Version > 0 && 
               aggregate.Version % _configuration.SnapshotEveryNEvents == 0;
    }
}
```

With a policy of snapshotting every 50 events, an aggregate with 1,000 events only needs to replay 0-49 events instead of all 1,000.

---

## Integration Events: Eventual Consistency

Domain events trigger integration events published to Azure Service Bus:

```csharp
public async Task PublishFromDomainEventsAsync(IReadOnlyCollection<DomainEvent> domainEvents)
{
    foreach (var domainEvent in domainEvents)
    {
        var integrationEvent = _mapper.MapToIntegrationEvent(domainEvent);
        if (integrationEvent is not null)
        {
            await _producer.SendAsync(integrationEvent);
        }
    }
}
```

A background worker subscribes to these events and updates projections asynchronously:

```
Domain Event → Integration Event → Azure Service Bus → Worker → Projection Update
```

This decouples the write side (immediately consistent) from the read side (eventually consistent).

---

## The Complete Flow: Creating an Account

Let's trace through creating a bank account:

**1. HTTP Request:**
```http
POST /api/BankAccounts
{
  "accountNumber": "1234567890",
  "ownerName": "John Doe",
  "initialBalance": 1000.00
}
```

**2. Command Handler:**
```csharp
var account = BankAccount.Create(
    Guid.NewGuid(),
    AccountNumber.Create(command.AccountNumber),
    command.OwnerName,
    command.InitialBalance);

await _repository.SaveAsync(account);
```

**3. Event Created:**
```json
{
  "eventType": "BankAccountCreatedEvent",
  "accountId": "abc-123",
  "accountNumber": "1234567890",
  "ownerName": "John Doe",
  "initialBalance": 1000.00,
  "version": 0,
  "timestamp": "2025-07-20T10:30:00Z"
}
```

**4. Event Persisted to Event Store**

**5. Integration Event Published to Azure Service Bus**

**6. Worker Updates Projections**

**7. Query Returns Data:**
```http
GET /api/BankAccounts/abc-123/balance

{
  "accountId": "abc-123",
  "accountNumber": "1234567890",
  "ownerName": "John Doe",
  "balance": 1000.00,
  "isActive": true,
  "version": 0
}
```

---

## Testing It Yourself

Here's a complete test scenario you can run:

```http
### 1. Create Account
POST {{baseUrl}}/BankAccounts
Content-Type: application/json

{
  "accountNumber": "1234567890",
  "ownerName": "John Doe",
  "initialBalance": 1000.00
}

### 2. Deposit Money
POST {{baseUrl}}/BankAccounts/{{accountId}}/deposit
Content-Type: application/json

{
  "amount": 250.00,
  "currency": "GBP"
}

### 3. Withdraw Cash
POST {{baseUrl}}/BankAccounts/{{accountId}}/withdraw
Content-Type: application/json

{
  "amount": 100.00,
  "currency": "GBP"
}

### 4. Check Balance (should be 1150.00)
GET {{baseUrl}}/BankAccounts/{{accountId}}/balance

### 5. View Full Audit Log
GET {{baseUrl}}/BankAccounts/{{accountId}}/audit-logs

### 6. Try Overdraft (should fail)
POST {{baseUrl}}/BankAccounts/{{accountId}}/withdraw
Content-Type: application/json

{
  "amount": 5000.00,
  "currency": "GBP"
}
```

---

## Key Takeaways

**Event Sourcing gives you:**
- Complete audit trail for every state change
- Ability to reconstruct state at any point in time
- Natural fit for event-driven architectures
- Debugging superpowers

**CQRS gives you:**
- Independent optimization of reads and writes
- Multiple read models from the same data
- Flexibility in consistency guarantees

**The trade-offs:**
- More complex than CRUD
- Eventual consistency requires careful handling
- Event schema evolution needs planning

---

## When Should You Use This?

Event Sourcing is excellent for:
- **Financial systems** — Where audit trails are mandatory
- **Collaborative applications** — Where conflict resolution matters
- **Complex domains** — Where understanding "how we got here" is valuable
- **Event-driven architectures** — Where events are first-class citizens

It's overkill for:
- Simple CRUD applications
- High-throughput, low-latency systems (without careful optimization)
- Teams unfamiliar with the pattern

---

## Conclusion

Building a banking system with Event Sourcing forced me to think differently about state. Instead of "what is the balance?", I asked "what happened to reach this balance?" This shift in perspective opens up possibilities that traditional CRUD systems simply can't match.

The ScratchBank ATM project demonstrates that Event Sourcing in .NET 9 is not just academically interesting—it's production-ready. With Entity Framework Core for persistence, Paramore Brighter for messaging, and Azure Service Bus for integration, you have all the building blocks for a robust, auditable, scalable financial system.

**Your next step:** Clone the repository, run the tests, and see Event Sourcing in action. The code speaks louder than any article ever could.
