# Server-Sent Events in .NET 10: Real-Time Order Processing with Clean Architecture

SignalR is overkill for 80% of real-time use cases.

That's a bold claim. But after years of reaching for SignalR by default—debugging WebSocket upgrades through corporate proxies, managing hub connection state, watching simple dashboards balloon into complex bidirectional messaging systems—I've come to a conclusion:

**If your data flows one direction (server → client), you're overengineering.**

Server-Sent Events does one thing: push updates from server to browser. It does it over plain HTTP. The browser reconnects automatically. Events replay on reconnection. No WebSocket handshake. No SignalR hub ceremony. No npm packages.

.NET ignored SSE for years. Then **.NET 10 dropped `TypedResults.ServerSentEvents`** and suddenly the simplest solution became the easiest to implement.

This isn't a tutorial. It's an opinionated guide to when SSE is the right choice, when it will fail you, and how to implement it properly with Clean Architecture and Domain-Driven Design.

---

## See It in Action

<video controls width="100%" style="border-radius: 8px; margin: 1rem 0;">
  <source src="/videos/articles/sse-order-processing/demo.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

*Real-time order tracking: the browser UI updates instantly as we trigger state transitions via HTTP requests.*

---

## The Decision Framework

Before we write any code, let's be precise about when SSE is the right tool.

**Use SSE when:**
- Data flows server → client (dashboards, notifications, order tracking, live feeds)
- You need automatic reconnection with event replay
- Your infrastructure is standard HTTP (load balancers, CDNs, proxies)
- You want the browser to handle reconnection logic (it does, natively)

**Use WebSockets when:**
- You need true bidirectional communication (chat, collaborative editing)
- You're sending binary data at high frequency (gaming, video)
- Sub-millisecond latency matters more than simplicity

**Use SignalR when:**
- You need both patterns and want one abstraction
- Your team is already invested in the SignalR ecosystem
- You need automatic transport fallback (WebSockets → SSE → Long Polling)

**The cost of choosing wrong:**

I've seen teams use WebSockets for a monitoring dashboard. Six months later, they'd written 2,000 lines of reconnection logic, heartbeat management, and state synchronization. The browser's native `EventSource` does all of that in zero lines of application code.

I've also seen teams use SSE for a collaborative whiteboard. They ended up polling for user cursor positions because SSE can't send data upstream. WebSockets would have been the obvious choice.

**The rule is simple:** if you're not sending data from client to server through the same connection, SSE is almost certainly the right choice.

---

## Where SSE Will Fail You

Let's be honest about the limitations. SSE breaks down in specific scenarios:

**1. Binary data**

SSE is text-only. If you're streaming video frames, audio chunks, or binary sensor data, you'll need to Base64 encode everything. The overhead kills performance. Use WebSockets.

**2. High-frequency updates (>100/second)**

SSE creates HTTP overhead per connection. At extreme frequencies, this matters. For a stock ticker updating 10 times per second? Fine. For a multiplayer game sending 60 position updates per second? WebSockets.

**3. Client-to-server communication**

SSE is one-way. If you need the same connection for bidirectional messaging, SSE forces you into a split architecture: SSE for downstream, REST/WebSocket for upstream. Sometimes that's fine. Sometimes it's needless complexity.

**4. HTTP/1.1 connection limits**

Browsers limit HTTP/1.1 connections per domain (typically 6). If a user opens multiple tabs to your dashboard, they'll exhaust the connection pool. HTTP/2 multiplexing solves this, but not all infrastructure supports it.

**5. Corporate proxy hell**

Some aggressive proxies buffer SSE responses or kill idle connections despite keep-alive headers. You'll need heartbeats (covered below), and even then, some environments are hostile. Test in your target deployment environment early.

---

## The .NET 10 Primitive

Here's what SSE implementation looked like before .NET 10:

```csharp
// ❌ Pre-.NET 10 — manual and error-prone
app.MapGet("/stream", async (HttpContext context, CancellationToken ct) =>
{
    context.Response.ContentType = "text/event-stream";
    context.Response.Headers.CacheControl = "no-cache";
    context.Response.Headers.Connection = "keep-alive";
    
    await foreach (var evt in GetEventsAsync(ct))
    {
        var json = JsonSerializer.Serialize(evt);
        await context.Response.WriteAsync($"id: {evt.Id}\n");
        await context.Response.WriteAsync($"event: {evt.Type}\n");
        await context.Response.WriteAsync($"data: {json}\n\n");
        await context.Response.Body.FlushAsync(ct);
    }
});
```

Manual content types. Manual newline formatting. Manual flushing. No type safety.

Here's .NET 10:

```csharp
// ✅ .NET 10 — the framework handles everything
app.MapGet("/stream", (CancellationToken ct) =>
    TypedResults.ServerSentEvents(GenerateEvents(ct)));

async IAsyncEnumerable<SseItem<EventDto>> GenerateEvents(
    [EnumeratorCancellation] CancellationToken ct)
{
    await foreach (var evt in GetEventsAsync(ct))
    {
        yield return new SseItem<EventDto>(evt, eventType: evt.Type)
        {
            EventId = evt.Id.ToString()
        };
    }
}
```

The `SseItem<T>` struct maps directly to SSE protocol fields:

| Property | SSE Field | Purpose |
|----------|-----------|---------|
| `Data` (constructor) | `data:` | The payload—serialized to JSON automatically |
| `EventType` (constructor) | `event:` | Lets clients filter with `addEventListener` |
| `EventId` | `id:` | Enables reconnection via `Last-Event-ID` |
| `ReconnectionInterval` | `retry:` | Hint for client retry timing |

---

## The Demo: Order Processing with Clean Architecture

To demonstrate SSE properly, I built an Order Processing system. Not a toy counter. A real domain with state machines, business rules, and event-driven architecture.

If you've read my [Rich Domain Modelling](/articles/rich-domain-modelling-escape-anaemic-models) article, this builds on those patterns. If you've worked through my [Saga Pattern](/articles/mastering-saga-pattern-distributed-transactions-dotnet) guide, you'll recognize the event-driven approach. SSE becomes the final mile—getting domain events to the browser in real-time.

![SSE Architecture Overview](/images/articles/sse-order-processing/architecture.svg)
*Browser clients connect via EventSource, server uses TypedResults.ServerSentEvents, Event Hub handles fan-out with bounded channels*

### Project Structure

```
src/OrderProcessing.Api/
├── Domain/                     # Core business logic
│   ├── Aggregates/Order.cs     # Order aggregate root
│   ├── Events/DomainEvents.cs  # OrderSubmitted, OrderPaid, etc.
│   └── ValueObjects/           # OrderId, Money, Address
│
├── Application/                # Use cases
│   ├── Commands/               # SubmitOrderCommand
│   └── Handlers/               # Command handlers
│
├── Infrastructure/             # External concerns
│   └── Sse/OrderEventHub.cs    # SSE subscription manager
│
└── Presentation/               # HTTP layer
    └── Endpoints/              # Minimal API endpoints
```

---

## The Domain Layer

The `Order` aggregate enforces state transitions and raises domain events. This is [Rich Domain Modelling](/articles/rich-domain-modelling-escape-anaemic-models) in practice:

```csharp
public sealed class Order
{
    private readonly List<DomainEvent> _domainEvents = [];
    
    public OrderId Id { get; }
    public OrderStatus Status { get; private set; }
    public IReadOnlyList<DomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    public void MarkPaid(Money amountPaid, string paymentReference)
    {
        EnsureCanTransitionTo(OrderStatus.Paid);
        
        if (amountPaid.Amount != TotalAmount.Amount)
            throw new OrderDomainException("Payment amount mismatch");
        
        PaymentReference = paymentReference;
        Status = OrderStatus.Paid;
        
        RaiseDomainEvent(new OrderPaidEvent(Id, amountPaid, paymentReference));
    }

    private void EnsureCanTransitionTo(OrderStatus targetStatus)
    {
        var isValid = (Status, targetStatus) switch
        {
            (OrderStatus.Submitted, OrderStatus.Validated) => true,
            (OrderStatus.Validated, OrderStatus.Paid) => true,
            (OrderStatus.Paid, OrderStatus.Shipped) => true,
            (OrderStatus.Shipped, OrderStatus.Invoiced) => true,
            (OrderStatus.Invoiced, OrderStatus.Completed) => true,
            _ => false
        };

        if (!isValid)
            throw new InvalidOrderStateTransitionException(Status, targetStatus);
    }
}
```

The state machine pattern here prevents invalid transitions at the domain level. The UI can't show a "Ship" button until the order is paid—not because of UI logic, but because the domain enforces it.

### Domain Events

Each event carries its resulting status. This matters for the SSE layer—we don't reconstruct status from event types, we include it explicitly:

```csharp
public abstract record DomainEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTime OccurredAt { get; } = DateTime.UtcNow;
    public abstract OrderId OrderId { get; init; }
    public abstract string EventType { get; }
    public abstract OrderStatus Status { get; }
}

public sealed record OrderPaidEvent(
    OrderId OrderId,
    Money AmountPaid,
    string PaymentReference) : DomainEvent
{
    public override string EventType => "OrderPaid";
    public override OrderStatus Status => OrderStatus.Paid;
}
```

---

## The SSE Endpoint

Here's where domain events become browser events:

```csharp
public static class OrderStreamEndpoints
{
    public static void MapOrderStreamEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/orders/{orderId:guid}/stream", StreamOrderEvents)
            .WithName("StreamOrderEvents")
            .Produces(StatusCodes.Status200OK, contentType: "text/event-stream");
    }

    private static IResult StreamOrderEvents(
        Guid orderId,
        OrderEventHub eventHub,
        HttpContext httpContext,
        CancellationToken ct)
    {
        if (orderId == Guid.Empty)
            return Results.NotFound();

        var orderIdValue = OrderId.From(orderId);
        var lastEventId = httpContext.Request.Headers["Last-Event-ID"].FirstOrDefault();

        return TypedResults.ServerSentEvents(
            GenerateSseItems(eventHub, orderIdValue, lastEventId, ct));
    }

    private static async IAsyncEnumerable<SseItem<OrderEventPayload>> GenerateSseItems(
        OrderEventHub eventHub,
        OrderId orderId,
        string? lastEventId,
        [EnumeratorCancellation] CancellationToken ct)
    {
        await foreach (var (sequence, payload) in eventHub.SubscribeAsync(orderId, lastEventId, ct))
        {
            yield return new SseItem<OrderEventPayload>(
                payload,
                eventType: payload.EventType)
            {
                EventId = sequence.ToString(CultureInfo.InvariantCulture),
                ReconnectionInterval = TimeSpan.FromSeconds(3)
            };
        }
    }
}
```

The `Last-Event-ID` header is SSE's killer feature. When the browser reconnects (and it will—networks are unreliable), it sends the last event ID it received. The server replays everything since. Zero client-side reconnection logic.

---

## The Event Hub: Backpressure Matters

The `OrderEventHub` manages subscriptions using `System.Threading.Channels`. This is where you can destroy your server if you're not careful.

```csharp
public sealed class OrderEventHub : IDisposable
{
    private readonly ConcurrentDictionary<OrderId, ConcurrentBag<Subscription>> _subscriptions = new();
    private readonly ConcurrentDictionary<OrderId, List<(int Sequence, OrderEventPayload Payload)>> _eventHistory = new();
    private int _globalSequence;

    public async IAsyncEnumerable<(int Sequence, OrderEventPayload Payload)> SubscribeAsync(
        OrderId orderId,
        string? lastEventId,
        [EnumeratorCancellation] CancellationToken ct)
    {
        var subscription = CreateSubscription(orderId, ct);

        try
        {
            foreach (var evt in GetEventsToReplay(orderId, lastEventId))
            {
                yield return evt;
            }

            await foreach (var evt in subscription.Channel.Reader.ReadAllAsync())
            {
                yield return evt;
            }
        }
        finally
        {
            RemoveSubscription(orderId, subscription);
        }
    }

    private Subscription CreateSubscription(OrderId orderId, CancellationToken ct)
    {
        var channel = Channel.CreateBounded<(int, OrderEventPayload)>(
            new BoundedChannelOptions(100)
            {
                FullMode = BoundedChannelFullMode.DropOldest,
                SingleReader = true
            });

        var subscription = new Subscription(Guid.NewGuid(), channel);
        AddSubscription(orderId, subscription);
        
        ct.Register(() => channel.Writer.TryComplete());

        return subscription;
    }
}
```

**Why bounded channels?**

![Backpressure Flow](/images/articles/sse-order-processing/backpressure.svg)
*Bounded channels protect the server from slow clients*

A client on a poor 3G connection can't consume events as fast as you produce them. With an unbounded channel, you're buffering indefinitely. Memory grows. Server crashes. Postmortem happens.

With `BoundedChannelFullMode.DropOldest`, old events get pushed out. The client misses some updates, but on reconnect, `Last-Event-ID` catches them up. The server stays healthy.

This is the same backpressure pattern you'd use in a [Saga orchestrator](/articles/mastering-saga-pattern-distributed-transactions-dotnet)—bounded queues, graceful degradation, recovery mechanisms.

---

## Automatic Reconnection

This is SSE's superpower. The browser handles reconnection automatically:

![SSE Reconnection Flow](/images/articles/sse-order-processing/reconnection.svg)
*The browser automatically reconnects and sends Last-Event-ID header for missed event replay*

1. Connection drops (network blip, proxy timeout, server restart)
2. Browser waits (default 3 seconds, or whatever `retry:` suggested)
3. Browser reconnects with `Last-Event-ID` header
4. Server replays missed events
5. Stream continues

**Zero client-side code.** Compare that to WebSocket reconnection logic—exponential backoff, state reconciliation, duplicate detection. I've written that code. I don't want to write it again.

---

## The Browser Client

The native `EventSource` API is refreshingly simple:

```javascript
const eventSource = new EventSource(`/api/orders/${orderId}/stream`);

eventSource.addEventListener('OrderValidated', (event) => {
    const data = JSON.parse(event.data);
    updateTimeline('Validated', data);
});

eventSource.addEventListener('OrderPaid', (event) => {
    const data = JSON.parse(event.data);
    updateTimeline('Paid', data);
});

eventSource.addEventListener('OrderCompleted', (event) => {
    const data = JSON.parse(event.data);
    markOrderComplete(data);
    eventSource.close();
});

eventSource.onerror = () => {
    if (eventSource.readyState === EventSource.CLOSED) {
        updateConnectionStatus('disconnected');
    } else {
        updateConnectionStatus('reconnecting');
    }
};
```

### Watching the Wire

Open DevTools → Network → find the SSE request → EventStream tab:

![Chrome DevTools EventStream Tab](/images/articles/sse-order-processing/devtools-eventstream.png)
*Chrome DevTools showing real SSE events with ID, Type, Data, and Time columns*

---

## HTTP Playground

The repository includes an HTTP file for VS Code, Rider, or Visual Studio:

```http
@baseUrl = http://localhost:5000
@orderId = {{submitOrder.response.body.orderId}}

### Submit a new order
# @name submitOrder
POST {{baseUrl}}/api/orders
Content-Type: application/json

{
  "customerName": "John Smith",
  "addressLine1": "123 High Street",
  "city": "London",
  "postCode": "SW1A 1AA",
  "country": "United Kingdom",
  "totalAmount": 149.99,
  "currency": "GBP"
}

### ============================================
### STATE TRANSITIONS (execute in order)
### ============================================

### 1. Validate order (Submitted → Validated)
PATCH {{baseUrl}}/api/orders/{{orderId}}
Content-Type: application/json

{ "status": "Validated" }

### 2. Pay order (Validated → Paid)
PATCH {{baseUrl}}/api/orders/{{orderId}}
Content-Type: application/json

{ "status": "Paid" }

### 3. Ship order (Paid → Shipped)
PATCH {{baseUrl}}/api/orders/{{orderId}}
Content-Type: application/json

{ "status": "Shipped" }

### 4. Invoice order (Shipped → Invoiced)
PATCH {{baseUrl}}/api/orders/{{orderId}}
Content-Type: application/json

{ "status": "Invoiced" }

### 5. Complete order (Invoiced → Completed)
PATCH {{baseUrl}}/api/orders/{{orderId}}
Content-Type: application/json

{ "status": "Completed" }
```

**Demo workflow:**

1. Open browser at `http://localhost:5000`
2. Submit an order → SSE connects, timeline shows "Submitted"
3. Execute each PATCH → watch the timeline update in real-time

---

## Production Checklist

Before deploying SSE to production:

**1. Heartbeats**

Proxies kill idle connections. AWS ALB: 60 seconds. Nginx: 60 seconds. Cloudflare: aggressive. Send a heartbeat event every 15-30 seconds:

```csharp
yield return new SseItem<HeartbeatPayload>(
    new HeartbeatPayload(), 
    eventType: "heartbeat");
```

**2. Event history limits**

Don't keep event history forever. Cap it by count or time. 1000 events or 1 hour—whatever fits your domain.

**3. Graceful shutdown**

On server shutdown, complete all channels gracefully. Clients will reconnect to another instance.

**4. Load balancer stickiness**

SSE connections are long-lived. If you're not using sticky sessions, ensure your event history is shared (Redis, database) so any server can replay events.

**5. Monitoring**

Track active SSE connections per server. Alert on unusual patterns—connection storms often indicate client-side bugs.

---

## The Pitfalls

Mistakes I made so you don't have to:

**Enum serialization** — `OrderStatus` serialized as `0`, `1`, `2`. JavaScript exploded.

```csharp
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});
```

**Locale-sensitive event IDs** — `sequence.ToString()` uses current culture. Some locales format numbers differently.

```csharp
EventId = sequence.ToString(CultureInfo.InvariantCulture)
```

**OperationCanceledException** — When clients disconnect, the cancellation token fires. You can't catch exceptions around `yield return`. Complete the channel gracefully instead:

```csharp
ct.Register(() => subscription.Channel.Writer.TryComplete());
```

---

## Where This Fits in Your Architecture

SSE isn't an isolated feature. It's the real-time layer of an event-driven architecture:

- **[Rich Domain Models](/articles/rich-domain-modelling-escape-anaemic-models)** raise domain events when state changes
- **[CQRS](/articles/building-bank-atm-event-sourcing-cqrs-dotnet)** separates the write path (commands) from read projections
- **[Saga orchestrators](/articles/mastering-saga-pattern-distributed-transactions-dotnet)** coordinate distributed workflows and emit progress events
- **SSE** delivers those events to the browser in real-time

The Order Processing demo connects all of these: the domain raises `OrderPaidEvent`, the infrastructure broadcasts it, the browser receives it via SSE, the UI updates. No polling. No manual refresh. The UI is eventually consistent with the domain—and "eventually" is measured in milliseconds.

---

## The Verdict

SSE is the right choice more often than most teams realize. The mental model is simpler. The browser handles reconnection. The infrastructure is standard HTTP.

.NET 10's `TypedResults.ServerSentEvents` removes the last excuse—implementation friction. Now you can choose SSE because it's the right tool, not avoid it because it's tedious.

**Use SSE when data flows one direction.** Use WebSockets when it doesn't. Use SignalR when you need both and want one abstraction.

The best architecture is the simplest one that solves the problem. For server-to-client push, that's usually SSE.
