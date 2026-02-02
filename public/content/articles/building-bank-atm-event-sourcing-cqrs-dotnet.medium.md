Every bank transaction tells a story. A customer opens an account, deposits their first paycheck, withdraws cash for the weekend, maybe closes the account years later. Traditional databases store only the final chapter—the current balance. But what if you need to understand the entire journey? What if an auditor asks exactly what happened at 3:47 PM last Tuesday?

This is where Event Sourcing changes the game.

Instead of overwriting data with each change, Event Sourcing preserves every state transition as an immutable record. The current state becomes a natural consequence of replaying history—not something stored directly. For financial systems, this isn't just elegant architecture; it's often a regulatory requirement.

I've built a [complete banking system on GitHub](https://github.com/pregoli/ScratchBankATM) demonstrating these patterns. This article focuses on the reasoning — why Event Sourcing works, and when it's worth the complexity.

### Why Traditional CRUD Falls Short

Traditional CRUD operations have a fundamental limitation: they destroy history. When you update a bank balance from £1,000 to £1,250, the original value vanishes. You know *what* the balance is, but not *how* it got there.

Event Sourcing inverts this model. Rather than storing state, you store the sequence of events that produced it:

```
AccountCreated    → Initial balance: £1,000
MoneyDeposited    → +£500
CashWithdrawn     → -£250
Current balance   → £1,250 (derived by replay)
```

The current balance emerges naturally by replaying these events. This approach delivers powerful capabilities:

- **Complete audit trail** — Every change preserved with full context and timestamp
- **Time travel** — Reconstruct the account state at any historical moment
- **Root cause analysis** — Debug production issues by replaying exact event sequences
- **Regulatory compliance** — Immutable logs satisfy financial audit requirements

### The Architecture

The system follows Clean Architecture principles, organised into four concentric layers where dependencies point inward. The Domain sits at the centre, completely isolated from infrastructure concerns.

![Clean Architecture](architecture.png)

This structure ensures that business logic remains framework-agnostic. You could swap Entity Framework for Dapper, or Azure Service Bus for RabbitMQ, without touching the domain layer.

### The Domain: Where Behaviour Lives

The `BankAccount` aggregate encapsulates all banking rules—overdraft prevention, account status validation, and balance calculations. Notice something important: methods don't directly modify state. They record events.

```csharp
public class BankAccount : AggregateRoot
{
    public Money Balance { get; private set; }
    public bool IsActive { get; private set; }

    public void DepositMoney(Money amount)
    {
        EnsureActiveAccount();

        if (amount.Amount <= 0)
            throw new DepositAmountMustBePositiveException(amount.Amount);

        AddEvent(new MoneyDepositedEvent(
            Id, amount.Amount, amount.Currency,
            Balance.Amount + amount.Amount));
    }

    public void WithdrawCash(Money amount)
    {
        EnsureActiveAccount();

        if (Balance.Amount < amount.Amount)
            throw new InsufficientFundsException(Id, amount.Amount, Balance.Amount);

        AddEvent(new CashWithdrawnEvent(
            Id, amount.Amount, amount.Currency,
            Balance.Amount - amount.Amount));
    }
}
```

**Commands produce events. Events produce state.** This separation is fundamental—the business decision to allow a withdrawal is distinct from the state change that results.

### The Event Store: An Append-Only Ledger

The Event Store is the heart of this architecture. Unlike traditional databases where records are updated in place, the Event Store only permits appending new events. Nothing is ever modified or deleted.

![Append-Only Event Store](append-only.png)

Each write operation adds a new event to the stream with an incrementing version number. This append-only constraint is what makes the audit trail trustworthy—if events could be modified, you'd lose the guarantee that history is accurate.

A unique constraint on `(AggregateType, AggregateId, Version)` prevents conflicting updates. Imagine two ATMs processing withdrawals for the same account simultaneously. Both load version 5, both try to append version 6. The database constraint ensures only one succeeds—the other receives a concurrency exception and must retry with fresh data.

### Rehydrating State: Replaying History

Loading an aggregate means replaying its event stream from the beginning. Each event transforms the aggregate's state incrementally until you arrive at the present:

![Event Replay](events-replay.png)

The formula is straightforward: read events in chronological order, apply each one, and the final state emerges naturally. Each event type has a corresponding `Apply` method:

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

### CQRS: Optimising Reads and Writes Independently

CQRS (Command Query Responsibility Segregation) recognises that read and write operations have fundamentally different requirements. Writes need strong consistency and business rule enforcement. Reads need speed and flexibility.

![CQRS Pattern](cqrs-pattern.png)

By separating these concerns, you can optimise each side independently. The write side enforces all business rules through the aggregate. The read side can use multiple strategies depending on the use case.

### Three Query Strategies

The read side offers three distinct approaches, each with different trade-offs:

![Query Strategies](query-strategies.png)

**Projections** — Pre-computed, denormalised views updated asynchronously. Eventually consistent but fastest. Perfect for dashboards and listings.

**Event Replay** — Reconstruct state by replaying all events. Immediately consistent but slowest. Essential for auditing and debugging.

**Snapshots** — Periodic checkpoints combined with recent events. Balanced approach for general queries.

The API can expose this flexibility directly:

```http
GET /api/BankAccounts/{id}/balance?strategy=Projection
GET /api/BankAccounts/{id}/balance?strategy=EventReplay
GET /api/BankAccounts/{id}/balance?strategy=Snapshot
```

Different queries choose different strategies. A real-time dashboard uses projections. An audit report replays events for accuracy. A general account lookup uses snapshots for balance.

### Projections: Multiple Views from One Source

One of Event Sourcing's most powerful features is building multiple read-optimised views from the same event stream. As events flow into the store, they're published to a message bus where projection handlers update specialised read tables.

![Projections](projection.png)

Different consumers build different views—a Balance projection for instant lookups, a Monthly Cash Flow projection for financial reports—all from the same underlying events. Same data, different perspectives, no duplication of source truth.

### Snapshotting: Taming Long Event Streams

Replaying hundreds or thousands of events for every read becomes expensive. Snapshots solve this by periodically capturing aggregate state, allowing the system to resume from a checkpoint rather than the beginning.

![Snapshotting](snapshotting.png)

Instead of replaying all events, load the most recent snapshot and replay only subsequent events. With snapshots every 50 events, an account with 1,000 events only needs to replay at most 49 events instead of the full history.

### The Trade-offs You'll Face

Event Sourcing isn't free:

- **Higher complexity** — More moving parts than traditional CRUD
- **Eventual consistency** — Projections lag behind writes; this requires careful handling
- **Event schema evolution** — Changing event structures requires migration strategies
- **Team learning curve** — The mental model takes time to internalise

It excels when:
- **Audit requirements are strict** — Financial services, healthcare, legal systems
- **History matters** — Understanding "how we got here" is valuable
- **Events are natural** — The domain already thinks in terms of things that happened

It's likely overkill when simple CRUD operations suffice or the team lacks time to learn the patterns properly.

### The Production Reality

After shipping Event Sourcing to production, the debugging experience transforms. When something goes wrong, you don't guess—you replay the exact sequence of events that led to the problem. Customer disputes become traceable. Compliance audits become straightforward.

Building this system fundamentally changed how I think about state management. Rather than asking "what is the balance?", I learned to ask "what events led to this balance?" This shift opens possibilities that traditional CRUD systems simply cannot match.

**The strongest argument for Event Sourcing isn't the architecture diagram—it's the conversation it forces.** When you model events explicitly, you're forced to understand what actually happens in your domain. That clarity pays dividends far beyond the technical implementation.

---

*I explore these patterns in depth on [Devocrazia](https://devocrazia.com/articles/building-bank-atm-event-sourcing-cqrs-dotnet). The full solution is available on [GitHub](https://github.com/pregoli/ScratchBankATM).*
