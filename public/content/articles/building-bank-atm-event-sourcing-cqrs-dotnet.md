# Building a Bank ATM System with Event Sourcing and CQRS in .NET 9

Every bank transaction tells a story. A customer opens an account, deposits their first paycheck, withdraws cash for the weekend, maybe closes the account years later. Traditional databases store only the final chapter—the current balance. But what if you need to understand the entire journey? What if an auditor asks exactly what happened at 3:47 PM last Tuesday?

This is where **Event Sourcing** changes the game.

Instead of overwriting data with each change, Event Sourcing preserves every state transition as an immutable record. The current state becomes a natural consequence of replaying history—not something stored directly. For financial systems, this isn't just a nice-to-have; it's often a regulatory requirement.

In this article, I'll walk through a production-style banking system built with Event Sourcing, CQRS, and Domain-Driven Design in .NET 9. We'll examine real code, explore the architectural trade-offs, and see how these patterns work together to create a robust, auditable system.

---

## Why Event Sourcing Fits Financial Systems

Traditional CRUD operations have a fundamental limitation: they destroy history. When you update a bank balance from £1,000 to £1,250, the original value vanishes. You know *what* the balance is, but not *how* it got there.

**Event Sourcing inverts this model.** Rather than storing state, you store the sequence of events that produced it:

```
AccountCreated    → Initial balance: £1,000
MoneyDeposited    → +£500
CashWithdrawn     → -£250
```

The current balance (£1,250) emerges naturally by replaying these events. This approach delivers several powerful capabilities:

- **Complete audit trail** — Every change is preserved with full context and timestamp
- **Time travel** — Reconstruct the account state at any historical moment
- **Root cause analysis** — Debug production issues by replaying exact event sequences
- **Regulatory compliance** — Immutable logs satisfy financial audit requirements

---

## Architecture Overview

The system follows Clean Architecture principles, organised into four concentric layers where dependencies point inward. The Domain sits at the centre, completely isolated from external concerns.

![Clean Architecture](/images/articles/event-sourcing/architecture.svg)

This structure ensures that business logic remains framework-agnostic. You could swap Entity Framework for Dapper, or Azure Service Bus for RabbitMQ, without touching the domain layer.

---

## The Domain Layer: Pure Business Logic

### The BankAccount Aggregate

In Domain-Driven Design, an *aggregate* is a cluster of related objects treated as a transactional unit. The `BankAccount` aggregate encapsulates all banking rules—overdraft prevention, account status validation, and balance calculations:

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

Notice something important: methods like `DepositMoney` don't directly modify `Balance`. Instead, they record a `MoneyDepositedEvent`. The actual state change happens when the event is applied. This separation is fundamental to Event Sourcing—**commands produce events, and events produce state**.

### Value Objects: Self-Validating Data

Value Objects wrap primitive types with domain-specific validation, eliminating entire categories of bugs:

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

Once created, a `Money` instance is guaranteed valid—currency is never empty, amounts are always rounded to two decimal places. You cannot accidentally pass raw decimals around and hope someone validates them later.

### Domain Events: Immutable Facts

Domain events capture business occurrences as permanent records:

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

Each event is immutable (using C# records), versioned for concurrency control, and timestamped for temporal ordering. Once persisted, events never change—they represent facts about what happened.

---

## The Event Store: An Append-Only Ledger

The Event Store is the heart of this architecture. Unlike traditional databases where records are updated in place, the Event Store only permits appending new events. Nothing is ever modified or deleted.

![Append-Only Event Store](/images/articles/event-sourcing/append-only.svg)

Each write operation adds a new event to the stream with an incrementing version number. This append-only constraint is what makes the audit trail trustworthy—if events could be modified, you'd lose the guarantee that history is accurate.

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

### Handling Concurrent Writes

A unique constraint on `(AggregateType, AggregateId, Version)` prevents conflicting updates:

```sql
CREATE UNIQUE INDEX IX_Events_Stream_Version
ON Events (AggregateType, AggregateId, Version);
```

Imagine two ATMs processing withdrawals for the same account simultaneously. Both load version 5, both try to append version 6. The database constraint ensures only one succeeds—the other receives a concurrency exception and must retry with fresh data. For financial operations, this optimistic concurrency control is essential.

---

## Rehydrating Aggregates: Replaying History

Loading an aggregate means replaying its event stream from the beginning. Each event transforms the aggregate's state incrementally until you arrive at the present:

![Event Replay](/images/articles/event-sourcing/events-replay.svg)

The formula is straightforward: read events in chronological order, apply each one, and the final state emerges naturally.

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

Each event type has a corresponding `Apply` method that updates the aggregate's internal state:

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

## CQRS: Optimising Reads and Writes Independently

CQRS (Command Query Responsibility Segregation) recognises that read and write operations have different requirements. Writes need strong consistency and business rule enforcement. Reads need speed and flexibility.

![CQRS Overview](/images/articles/event-sourcing/cqrs-pattern.svg)

By separating these concerns, you can optimise each side independently.

### Commands: Expressing Intent

Commands represent a user's intention to change system state:

```csharp
public record DepositMoneyCommand(
    Guid AccountId,
    decimal Amount,
    string Currency) : FlagstoneAtmCommand;
```

Command handlers coordinate the operation—loading the aggregate, invoking domain logic, and persisting results:

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

### Queries: Flexible Read Strategies

The read side offers three strategies, each with different trade-offs:

| Strategy | Consistency | Performance | Best For |
|----------|-------------|-------------|----------|
| **Projection** | Eventual | Fastest | Dashboards, listings |
| **EventReplay** | Immediate | Slowest | Audit, debugging |
| **Snapshot** | Immediate | Balanced | General queries |

![Three Query Strategies](/images/articles/event-sourcing/query-strategies.svg)

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

The API exposes this flexibility directly:

```http
GET /api/BankAccounts/{id}/balance?strategy=Projection
GET /api/BankAccounts/{id}/balance?strategy=EventReplay
GET /api/BankAccounts/{id}/balance?strategy=Snapshot
```

---

## Projections: Multiple Views from One Source

One of Event Sourcing's most powerful features is building multiple read-optimised views from the same event stream. As events flow into the store, they're published to a message bus where projection handlers update specialised read tables.

![Projections](/images/articles/event-sourcing/projection.svg)

Different consumers build different views—a Balance projection for instant lookups, a Monthly Cash Flow projection for financial reports—all from the same underlying events.

### Balance Projection

A denormalised table optimised for fast balance queries:

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

### Monthly Cash Flow Projection

An analytical view aggregating transactions by month:

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

Same events, different perspectives—no data duplication required.

---

## Snapshotting: Taming Long Event Streams

Replaying hundreds or thousands of events for every read becomes expensive. Snapshots solve this by periodically capturing aggregate state, allowing the system to resume from a checkpoint rather than the beginning.

![Snapshotting](/images/articles/event-sourcing/snapshotting.svg)

Instead of replaying all events, load the most recent snapshot and replay only subsequent events.

```csharp
public class SnapshotLoadingStrategy : IAggregateLoadingStrategy<BankAccount>
{
    public async Task<BankAccount?> LoadAsync(StreamId streamId)
    {
        // Attempt to restore from snapshot
        var (aggregate, fromVersion) = await TryRestoreFromSnapshotAsync(streamId.AggregateId);

        // Fetch only events AFTER the snapshot version
        var partialStream = await _eventStore.GetPartialStreamAsync(streamId, fromVersion);

        if (aggregate == null)
        {
            // No snapshot available—replay everything
            return AggregateRoot.ReplayEvents<BankAccount>(partialStream.Events);
        }

        // Apply only recent events to the restored snapshot
        foreach (var @event in partialStream.Events)
        {
            aggregate.ApplyEvent(@event);
        }

        return aggregate;
    }
}
```

A configurable policy determines when to create snapshots:

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

With snapshots every 5 events, an account with 1,000 events only needs to replay at most 4 events instead of the full history. For long-lived aggregates, this dramatically improves load times.

---

## Integration Events: Connecting Systems

Domain events trigger integration events published to Azure Service Bus, enabling downstream systems to react asynchronously:

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

The flow looks like this:

```
Domain Event → Integration Event → Azure Service Bus → Worker → Projection Update
```

This decouples the write side (immediately consistent) from the read side (eventually consistent), allowing each to scale and evolve independently.

---

## End-to-End: Creating an Account

Let's trace through the complete flow when a customer opens an account:

**1. HTTP Request arrives:**
```http
POST /api/BankAccounts
{
  "accountNumber": "1234567890",
  "ownerName": "John Doe",
  "initialBalance": 1000.00
}
```

**2. Command handler creates the aggregate:**
```csharp
var account = BankAccount.Create(
    Guid.NewGuid(),
    AccountNumber.Create(command.AccountNumber),
    command.OwnerName,
    command.InitialBalance);

await _repository.SaveAsync(account);
```

**3. Domain event is generated:**
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

**4. Event persisted to the Event Store**

**5. Integration event published to Azure Service Bus**

**6. Background worker updates projections**

**7. Query returns the data:**
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

## Try It Yourself

Here's a complete test scenario to explore the system:

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

### 4. Check Balance (expect £1,150.00)
GET {{baseUrl}}/BankAccounts/{{accountId}}/balance

### 5. View Complete Audit Trail
GET {{baseUrl}}/BankAccounts/{{accountId}}/audit-logs

### 6. Attempt Overdraft (expect failure)
POST {{baseUrl}}/BankAccounts/{{accountId}}/withdraw
Content-Type: application/json

{
  "amount": 5000.00,
  "currency": "GBP"
}
```

---

## Key Takeaways

**Event Sourcing provides:**
- Complete, immutable audit trail of every state change
- Ability to reconstruct system state at any point in history
- Natural fit for event-driven architectures and microservices
- Powerful debugging through event replay

**CQRS enables:**
- Independent scaling and optimisation of reads and writes
- Multiple read models from the same underlying data
- Flexibility in consistency guarantees per use case

**The trade-offs to consider:**
- Higher complexity than traditional CRUD
- Eventual consistency requires thoughtful handling
- Event schema evolution demands careful planning
- Team familiarity affects adoption success

---

## When to Use This Architecture

Event Sourcing excels in domains where:
- **Audit requirements are strict** — Financial services, healthcare, legal systems
- **History matters** — Understanding "how we got here" is valuable
- **Events are natural** — The domain already thinks in terms of things that happened
- **Collaboration is complex** — Multiple actors may conflict and need resolution

It's likely overkill when:
- Simple CRUD operations suffice
- Ultra-low latency is critical without optimisation budget
- The team lacks Event Sourcing experience and timeline is tight

---

## Conclusion

Building this banking system with Event Sourcing fundamentally changed how I think about state management. Rather than asking "what is the balance?", I learned to ask "what events led to this balance?" This shift opens possibilities that traditional CRUD systems simply cannot match.

The ScratchBank ATM project demonstrates that Event Sourcing in .NET 9 is practical and production-ready. With Entity Framework Core handling persistence, Paramore Brighter orchestrating commands, and Azure Service Bus enabling integration, you have everything needed for a robust, auditable financial system.

**Next steps:** Clone the repository, run the tests, and watch Event Sourcing in action. The code will teach you more than any article ever could.
