# Mastering the Saga Pattern for Distributed Transactions in .NET 10

When a customer clicks "Place Order" on an e-commerce site, a cascade of operations must succeed together: reserve inventory, charge the credit card, arrange shipping. In a monolithic application, wrapping these in a database transaction guarantees all-or-nothing behaviour. But in a microservices architecture, each operation lives in a different service with its own database. Traditional transactions don't span network boundaries.

This is where the **Saga Pattern** becomes essential.

Instead of trying to force distributed transactions (which are brittle and don't scale), sagas decompose a long-running process into a sequence of local transactions, each publishing events that trigger the next step. If any step fails, compensating transactions undo the work of previous steps—automatically and reliably.

In this article, I'll walk through a production-style implementation of the Saga Pattern using .NET 10, MassTransit, RabbitMQ, and SQL Server. We'll examine the architecture, explore real code, and see how orchestration, compensation, and the Outbox pattern work together to create bulletproof distributed workflows.

---

## The Problem: Distributed Transactions Don't Scale

Consider a typical order flow across microservices:

```
Order Service → Stock Service → Payment Service → Shipping Service
```

In a monolith, you'd wrap this in a single transaction:

```csharp
// ❌ This approach breaks down in microservices
using var transaction = connection.BeginTransaction();
try
{
    stockService.Reserve(items);
    paymentService.Charge(card);
    shippingService.Arrange(address);
    transaction.Commit();
}
catch
{
    transaction.Rollback();
}
```

The moment these services are separated by network boundaries, this pattern fails. Two-phase commit (2PC) protocols exist but introduce blocking, reduce availability, and create single points of failure. Most distributed systems avoid them entirely.

**The Saga Pattern offers a better approach.** Rather than locking resources across services, sagas execute each step independently and define compensating actions to undo work if something fails downstream.

---

## Saga Architecture Overview

The demo implements an e-commerce order flow with three domain services coordinated by a central orchestrator:

![Saga Architecture](/images/articles/saga-pattern/architecture.svg)

Each service owns its data and communicates exclusively through messages. The Saga Orchestrator maintains the workflow state and directs traffic based on success or failure events.

**Key Components:**

- **API** — Accepts order requests, initiates saga instances
- **Orchestrator** — The state machine coordinating the multi-step workflow
- **Stock Service** — Reserves and releases inventory
- **Payment Service** — Processes and refunds payments
- **Shipping Service** — Arranges delivery

---

## The Saga State Machine

At the heart of this architecture sits a MassTransit state machine that models the order lifecycle:

![Saga State Flow](/images/articles/saga-pattern/state-machine.svg)

The state machine is declarative—you define states, events, and transitions, and MassTransit handles the mechanics of persistence, correlation, and message routing.

```csharp
public class OrderStateMachine : MassTransitStateMachine<OrderState>
{
    public OrderStateMachine()
    {
        InstanceState(x => x.CurrentState);

        Event(() => OrderSubmitted, x => x.CorrelateById(c => c.Message.OrderId));
        Event(() => StockReserved, x => x.CorrelateById(c => c.Message.OrderId));
        Event(() => StockReservationFailed, x => x.CorrelateById(c => c.Message.OrderId));
        Event(() => PaymentCompleted, x => x.CorrelateById(c => c.Message.OrderId));
        Event(() => PaymentFailed, x => x.CorrelateById(c => c.Message.OrderId));
        Event(() => ShippingArranged, x => x.CorrelateById(c => c.Message.OrderId));

        Initially(
            When(OrderSubmitted)
                .Then(context => InitializeOrder(context))
                .TransitionTo(ReservingStock)
                .Publish(context => new ReserveStock(
                    context.Saga.OrderId,
                    context.Saga.ProductName,
                    context.Saga.Quantity)));

        During(ReservingStock,
            When(StockReserved)
                .TransitionTo(ProcessingPayment)
                .Publish(context => new ProcessPayment(
                    context.Saga.OrderId,
                    context.Saga.TotalAmount)),
            When(StockReservationFailed)
                .TransitionTo(Failed)
                .Then(context => context.Saga.FailureReason = "Stock unavailable"));

        During(ProcessingPayment,
            When(PaymentCompleted)
                .TransitionTo(ArrangingShipping)
                .Publish(context => new ArrangeShipping(
                    context.Saga.OrderId,
                    context.Saga.CustomerEmail)),
            When(PaymentFailed)
                .TransitionTo(Compensating)
                .Publish(context => new ReleaseStock(
                    context.Saga.OrderId,
                    context.Saga.ProductName,
                    context.Saga.Quantity)));

        During(ArrangingShipping,
            When(ShippingArranged)
                .TransitionTo(Completed)
                .Then(context => context.Saga.CompletedAt = DateTime.UtcNow));

        During(Compensating,
            When(StockReleased)
                .TransitionTo(Failed)
                .Then(context => context.Saga.FailureReason = "Payment failed, stock released"));
    }
}
```

Notice the explicit modelling of the `Compensating` state. When payment fails, the saga doesn't simply stop—it actively reverses the stock reservation before transitioning to `Failed`. This ensures the system never ends up in an inconsistent state.

---

## Compensation: The Safety Net

Compensation is what makes sagas reliable. Each step that modifies state must have a corresponding action that reverses it:

![Compensation Flow](/images/articles/saga-pattern/compensation.svg)

| Step | Forward Action | Compensating Action |
|------|---------------|---------------------|
| Stock | `ReserveStock` | `ReleaseStock` |
| Payment | `ProcessPayment` | `RefundPayment` |
| Shipping | `ArrangeShipping` | `CancelShipping` |

In the demo, if payment fails after stock has been reserved, the orchestrator publishes a `ReleaseStock` command. The Stock Service consumes this message and restores the inventory:

```csharp
public class ReleaseStockConsumer : IConsumer<ReleaseStock>
{
    private readonly ILogger<ReleaseStockConsumer> _logger;

    public async Task Consume(ConsumeContext<ReleaseStock> context)
    {
        _logger.LogWarning(
            "📦 COMPENSATION: Releasing stock for Order {OrderId} - {Quantity}x {Product}",
            context.Message.OrderId,
            context.Message.Quantity,
            context.Message.ProductName);

        // Simulate compensation processing
        await Task.Delay(500);

        await context.Publish(new StockReleased(
            context.Message.OrderId,
            context.Message.ProductName,
            context.Message.Quantity));
    }
}
```

The saga waits for `StockReleased` confirmation before transitioning to `Failed`. This guarantees that compensation actually completed rather than assuming it will.

---

## The Outbox Pattern: Reliable Message Delivery

What happens if your service crashes between writing to the database and publishing a message? Without precautions, you end up with inconsistent state—the local transaction committed, but downstream services never received the notification.

The **Outbox Pattern** solves this by storing outgoing messages in the same database transaction as the business data:

![Outbox Pattern](/images/articles/saga-pattern/outbox.svg)

MassTransit's Entity Framework Core integration makes this straightforward:

```csharp
services.AddMassTransit(x =>
{
    x.AddEntityFrameworkOutbox<SagaDbContext>(o =>
    {
        o.UseSqlServer();
        o.UseBusOutbox();
        
        // Messages delivered after local transaction commits
        o.QueryDelay = TimeSpan.FromSeconds(1);
    });

    x.AddSagaStateMachine<OrderStateMachine, OrderState>()
        .EntityFrameworkRepository(r =>
        {
            r.ConcurrencyMode = ConcurrencyMode.Optimistic;
            r.ExistingDbContext<SagaDbContext>();
            r.UsePostgres(); // or UseSqlServer()
        });
});
```

With the Outbox enabled, messages are written to an outbox table within the same transaction as the saga state update. A background process then delivers these messages to RabbitMQ. If the message broker is temporarily unavailable, messages accumulate in the outbox and are delivered once connectivity resumes.

This guarantees **exactly-once processing semantics**—the holy grail of distributed systems.

---

## Clean Architecture: Layered Design

The demo follows Clean Architecture principles, keeping domain logic isolated from infrastructure concerns:

```
src/
├── SagaDemo.Domain/            ← Pure domain: entities, enums, exceptions
├── SagaDemo.Application/       ← Use cases: DTOs, interfaces, services
├── SagaDemo.Contracts/         ← Shared messages: commands, events
├── SagaDemo.Infrastructure/    ← Implementation: saga, EF Core, RabbitMQ
├── SagaDemo.Api/              ← HTTP entry point
├── SagaDemo.Workers/          ← Saga orchestrator host
├── SagaDemo.StockService/     ← Stock domain service
├── SagaDemo.PaymentService/   ← Payment domain service
└── SagaDemo.ShippingService/  ← Shipping domain service
```

**Why this structure matters:**

- **Domain** has zero dependencies—pure C# with business rules
- **Contracts** are shared across services but contain only message definitions
- **Infrastructure** implements the abstractions defined in Application
- Each **service** can be deployed, scaled, and evolved independently

---

## Running the Demo

The entire system runs with a single Docker Compose command:

```bash
# Clone the repository
git clone https://github.com/pregoli/SagaDemo.git
cd SagaDemo

# Start all services
docker compose up --build
```

After approximately 60-90 seconds, you'll have:

| Service | URL |
|---------|-----|
| API | http://localhost:5000 |
| Swagger UI | http://localhost:5000/swagger |
| RabbitMQ Management | http://localhost:15672 (guest/guest) |

---

## Testing the Happy Path

Open `SagaDemo.http` in VS Code or Rider and execute these requests:

```http
### 1. Create an Order
POST http://localhost:5000/api/orders
Content-Type: application/json

{
  "customerEmail": "john@example.com",
  "productName": "Mechanical Keyboard",
  "quantity": 1,
  "totalAmount": 149.99
}
```

Watch the console output to see the saga progress through each state:

```
📦 STOCK: Reserving 1x Mechanical Keyboard for Order abc-123
✅ STOCK: Reserved successfully

💳 PAYMENT: Processing £149.99 for Order abc-123
✅ PAYMENT: Completed successfully

🚚 SHIPPING: Arranging delivery for Order abc-123
✅ SHIPPING: Arranged successfully

🎉 SAGA COMPLETED: Order abc-123 fulfilled
```

Query the saga state to confirm completion:

```http
### 2. Check Order Status
GET http://localhost:5000/api/orders/{{orderId}}
```

Response:

```json
{
  "orderId": "abc-123",
  "currentState": "Completed",
  "productName": "Mechanical Keyboard",
  "quantity": 1,
  "totalAmount": 149.99,
  "completedAt": "2025-12-23T14:30:00Z"
}
```

---

## Testing the Failure Path

The demo simulates random failures to demonstrate compensation. For deterministic testing, use these special values:

```http
### Force Stock Failure
POST http://localhost:5000/api/orders
Content-Type: application/json

{
  "customerEmail": "test@example.com",
  "productName": "OUT_OF_STOCK",
  "quantity": 1,
  "totalAmount": 99.99
}
```

```http
### Force Payment Failure (triggers compensation)
POST http://localhost:5000/api/orders
Content-Type: application/json

{
  "customerEmail": "test@example.com",
  "productName": "Normal Product",
  "quantity": 1,
  "totalAmount": 999999.99
}
```

The payment failure scenario is particularly interesting. Watch the logs:

```
📦 STOCK: Reserving 1x Normal Product for Order def-456
✅ STOCK: Reserved successfully

💳 PAYMENT: Processing £999,999.99 for Order def-456
❌ PAYMENT FAILED: Amount exceeds limit

📦 COMPENSATION: Releasing stock for Order def-456
✅ STOCK: Released successfully

❌ SAGA FAILED: Order def-456 - Payment failed, stock released
```

The system automatically undid the stock reservation when payment failed. No manual intervention required.

---

## Observing the Message Flow

Open RabbitMQ Management at http://localhost:15672 to watch messages flow through the system:

**Queues you'll see:**

- `order-submitted` — Initial order commands
- `reserve-stock` / `stock-reserved` — Stock service communication
- `process-payment` / `payment-completed` — Payment service communication
- `arrange-shipping` / `shipping-arranged` — Shipping service communication
- `release-stock` / `stock-released` — Compensation messages

Each exchange follows a consistent pattern: commands go to specific service queues, events are published to topic exchanges for interested subscribers.

---

## Key Takeaways

**The Saga Pattern provides:**

- Reliable distributed transactions without 2PC
- Explicit failure handling through compensation
- Clear visibility into workflow state
- Independent scaling of services
- Resilience to partial failures

**MassTransit simplifies:**

- State machine definition with a fluent API
- Message correlation across services
- Outbox pattern for reliable delivery
- Saga state persistence with optimistic concurrency

**The trade-offs to consider:**

- Eventual consistency requires UI/UX consideration
- Compensation logic adds complexity
- Debugging distributed flows is harder than monoliths
- Requires message broker infrastructure

---

## When to Use Sagas

The Saga Pattern excels when:

- **Multiple services must coordinate** — Each service owns its data
- **Operations are naturally sequential** — Step A must complete before step B
- **Rollback is meaningful** — Compensation can logically undo previous steps
- **Availability trumps consistency** — Brief inconsistency is acceptable

Consider alternatives when:

- All data lives in one database—use regular transactions
- Operations are truly independent—use simple event-driven patterns
- Strict consistency is required—consider synchronous orchestration
- The team is unfamiliar with messaging—start simpler

---

## Conclusion

Building reliable distributed systems is hard. The Saga Pattern doesn't eliminate that complexity—it gives you a structured way to manage it. By modelling workflows as state machines, defining explicit compensation, and leveraging the Outbox pattern for reliable messaging, you can create microservices that handle failures gracefully and maintain consistency across boundaries.

The SagaDemo project demonstrates that these patterns are practical with modern .NET tooling. MassTransit handles the heavy lifting of message routing, state persistence, and delivery guarantees. Docker Compose makes running the entire system trivial.

**Next steps:** Clone the repository, run the demo, and experiment with different failure scenarios. Break things intentionally. Watch how the saga compensates. The best way to understand distributed systems is to observe them fail—and recover.
