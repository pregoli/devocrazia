# Rich Domain Modelling: Escaping the Anaemic Model Trap

Most enterprise codebases share a dirty secret: their domain models are little more than data containers with getters and setters. Business logic scatters across services, controllers, and utility classes. Validation lives everywhere and nowhere. The objects that should represent the heart of your business are hollow shells—**anaemic models**.

This isn't just an aesthetic problem. Anaemic models create maintenance nightmares, breed bugs, and make it nearly impossible to reason about business rules. When behaviour lives separately from the data it operates on, you lose the core benefit of object-oriented design: **encapsulation**.

In this article, I'll show you how to build **Rich Domain Models**—objects that combine data and behaviour, enforce their own invariants, and make invalid states unrepresentable. We'll explore value objects, entities, aggregates, and domain services through practical C# examples that you can apply immediately.

---

## The Anaemic Model Anti-Pattern

Consider a typical e-commerce Order in most codebases:

```csharp
// ❌ Anaemic Model — a glorified data structure
public class Order
{
    public Guid Id { get; set; }
    public string CustomerEmail { get; set; }
    public string Status { get; set; }
    public decimal TotalAmount { get; set; }
    public List<OrderLine> Lines { get; set; }
    public DateTime? ShippedAt { get; set; }
}
```

Looks harmless, right? But where does the business logic live?

```csharp
// ❌ Logic scattered across service classes
public class OrderService
{
    public void Ship(Order order)
    {
        if (order.Status != "Paid")
            throw new InvalidOperationException("Cannot ship unpaid order");
        
        if (!order.Lines.Any())
            throw new InvalidOperationException("Cannot ship empty order");
        
        order.Status = "Shipped";
        order.ShippedAt = DateTime.UtcNow;
    }
    
    public void AddLine(Order order, string product, int quantity, decimal price)
    {
        if (order.Status != "Draft")
            throw new InvalidOperationException("Cannot modify non-draft order");
        
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be positive");
        
        order.Lines.Add(new OrderLine { Product = product, Quantity = quantity, Price = price });
        order.TotalAmount = order.Lines.Sum(l => l.Quantity * l.Price);
    }
}
```

**Problems with this approach:**

- **Exposed internals** — Anyone can set `Status = "Banana"` or `TotalAmount = -500`
- **Scattered validation** — Business rules duplicated across multiple services
- **Primitive obsession** — `CustomerEmail` is just a string, `Status` is magic strings
- **No encapsulation** — The model can't protect its own integrity
- **Testing complexity** — Must test services in isolation from the models they manipulate

---

## The Rich Model Alternative

A rich domain model **owns its behaviour**. It validates inputs, enforces invariants, and makes illegal states impossible to represent:

![Rich vs Anaemic Model](/images/articles/rich-domain-model/comparison.svg)

```csharp
// ✅ Rich Domain Model — behaviour lives with data
public class Order
{
    private readonly List<OrderLine> _lines = new();
    
    public OrderId Id { get; }
    public Email CustomerEmail { get; }
    public OrderStatus Status { get; private set; }
    public Money TotalAmount { get; private set; }
    public IReadOnlyList<OrderLine> Lines => _lines.AsReadOnly();
    public DateTime? ShippedAt { get; private set; }
    
    private Order(OrderId id, Email customerEmail)
    {
        Id = id ?? throw new ArgumentNullException(nameof(id));
        CustomerEmail = customerEmail ?? throw new ArgumentNullException(nameof(customerEmail));
        Status = OrderStatus.Draft;
        TotalAmount = Money.Zero(Currency.GBP);
    }
    
    public static Order Create(Email customerEmail)
    {
        var order = new Order(OrderId.New(), customerEmail);
        order.AddDomainEvent(new OrderCreatedEvent(order.Id, customerEmail));
        return order;
    }
    
    public void AddLine(Product product, Quantity quantity, Money unitPrice)
    {
        EnsureDraft();
        
        var line = new OrderLine(product, quantity, unitPrice);
        _lines.Add(line);
        
        RecalculateTotal();
    }
    
    public void Ship()
    {
        if (Status != OrderStatus.Paid)
            throw new DomainException("Cannot ship an unpaid order");
        
        if (!_lines.Any())
            throw new DomainException("Cannot ship an empty order");
        
        Status = OrderStatus.Shipped;
        ShippedAt = DateTime.UtcNow;
        
        AddDomainEvent(new OrderShippedEvent(Id, ShippedAt.Value));
    }
    
    private void EnsureDraft()
    {
        if (Status != OrderStatus.Draft)
            throw new DomainException("Cannot modify a non-draft order");
    }
    
    private void RecalculateTotal()
    {
        TotalAmount = _lines.Aggregate(
            Money.Zero(Currency.GBP),
            (total, line) => total.Add(line.LineTotal));
    }
    
    // Domain event support (shown later)
    private readonly List<IDomainEvent> _domainEvents = new();
    protected void AddDomainEvent(IDomainEvent e) => _domainEvents.Add(e);
}
```

**Key improvements:**

- **Private constructor + factory method** — Controlled creation via `Order.Create()`
- **Private setters** — State changes only through controlled methods
- **Value objects** — `Email`, `Money`, `Quantity`, `OrderId` enforce their own rules
- **Strongly-typed status** — `OrderStatus` enum, not magic strings
- **Invariant enforcement** — `EnsureDraft()` called before any modification
- **Encapsulated collection** — `Lines` exposed as read-only
- **Domain events** — `OrderCreatedEvent` raised at creation, `OrderShippedEvent` on shipping

---

## Building Blocks: Value Objects

Value objects are the foundation of rich models. They represent concepts defined entirely by their attributes—two value objects with the same values are interchangeable.

![Value Object Characteristics](/images/articles/rich-domain-model/value-objects.svg)

### The ValueObject Base Class

First, let's define the foundation that all value objects inherit from:

```csharp
public abstract class ValueObject
{
    protected abstract IEnumerable<object> GetEqualityComponents();
    
    public override bool Equals(object? obj)
    {
        if (obj is null || obj.GetType() != GetType())
            return false;
        
        var other = (ValueObject)obj;
        return GetEqualityComponents().SequenceEqual(other.GetEqualityComponents());
    }
    
    public override int GetHashCode()
    {
        return GetEqualityComponents()
            .Select(x => x?.GetHashCode() ?? 0)
            .Aggregate((x, y) => x ^ y);
    }
    
    public static bool operator ==(ValueObject? left, ValueObject? right)
    {
        if (left is null && right is null) return true;
        if (left is null || right is null) return false;
        return left.Equals(right);
    }
    
    public static bool operator !=(ValueObject? left, ValueObject? right) => !(left == right);
}
```

This base class provides structural equality—two value objects are equal if all their components match.

### Email Value Object

```csharp
public sealed class Email : ValueObject
{
    public string Value { get; }
    
    private Email(string value) => Value = value;
    
    public static Email Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new DomainException("Email cannot be empty");
        
        if (!value.Contains('@') || !value.Contains('.'))
            throw new DomainException("Invalid email format");
        
        if (value.Length > 255)
            throw new DomainException("Email too long");
        
        return new Email(value.ToLowerInvariant().Trim());
    }
    
    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }
    
    public override string ToString() => Value;
    
    // Implicit conversion for convenience
    public static implicit operator string(Email email) => email.Value;
}
```

**Why this matters:**

- **Validation at creation** — Invalid emails cannot exist in your system
- **Normalisation** — Always lowercase, always trimmed
- **Immutability** — Once created, cannot be changed
- **Self-documenting** — Method signatures using `Email` are clearer than `string`

### Money Value Object

Money is notoriously tricky—mixing currencies, precision errors, and arithmetic bugs are common. A `Money` value object solves all of these:

```csharp
public enum Currency
{
    GBP,
    USD,
    EUR
}

public static class CurrencyExtensions
{
    public static string Symbol(this Currency currency) => currency switch
    {
        Currency.GBP => "£",
        Currency.USD => "$",
        Currency.EUR => "€",
        _ => currency.ToString()
    };
}

public sealed class Money : ValueObject
{
    public decimal Amount { get; }
    public Currency Currency { get; }
    
    private Money(decimal amount, Currency currency)
    {
        Amount = decimal.Round(amount, 2, MidpointRounding.ToEven);
        Currency = currency;
    }
    
    public static Money Create(decimal amount, Currency currency)
    {
        if (amount < 0)
            throw new DomainException("Money amount cannot be negative");
        
        return new Money(amount, currency);
    }
    
    public static Money Zero(Currency currency) => new(0, currency);
    
    public Money Add(Money other)
    {
        EnsureSameCurrency(other);
        return new Money(Amount + other.Amount, Currency);
    }
    
    public Money Subtract(Money other)
    {
        EnsureSameCurrency(other);
        
        if (other.Amount > Amount)
            throw new DomainException("Insufficient funds");
        
        return new Money(Amount - other.Amount, Currency);
    }
    
    public Money Multiply(decimal factor)
    {
        if (factor < 0)
            throw new DomainException("Factor cannot be negative");
        
        return new Money(Amount * factor, Currency);
    }
    
    public Money Divide(decimal divisor)
    {
        if (divisor == 0)
            throw new DomainException("Cannot divide by zero");
        
        if (divisor < 0)
            throw new DomainException("Divisor cannot be negative");
        
        return new Money(Amount / divisor, Currency);
    }
    
    public Money Percentage(decimal percent)
    {
        return new Money(Amount * percent / 100, Currency);
    }
    
    private void EnsureSameCurrency(Money other)
    {
        if (Currency != other.Currency)
            throw new DomainException($"Cannot combine {Currency} with {other.Currency}");
    }
    
    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Amount;
        yield return Currency;
    }
    
    public override string ToString() => $"{Currency.Symbol()}{Amount:N2}";
}
```

**Currency mixing is now impossible** at compile time. You simply cannot add GBP to USD—the type system prevents it.

---

## Entities and Identity

Unlike value objects, entities have identity that persists across time. Two orders with identical contents are still different orders if they have different IDs.

![Entity Identity](/images/articles/rich-domain-model/entity-identity.svg)

### Strongly-Typed IDs

Avoid primitive obsession for identifiers:

```csharp
// ❌ Primitive obsession — easy to mix up parameters
public void ProcessOrder(Guid orderId, Guid customerId, Guid productId) { }

// Easy to call incorrectly:
ProcessOrder(customerId, productId, orderId); // Compiles fine! Bug!
```

**Strongly-typed IDs prevent this.** There's debate about using `record struct` vs `record class`:

| Approach | Pros | Cons |
|----------|------|------|
| `record struct` | Stack allocated, no GC pressure | Serialisation quirks, EF Core complexity |
| `record class` | Better ORM support, nullable | Heap allocated |

For most applications, `record class` is safer:

```csharp
public sealed record OrderId
{
    public Guid Value { get; }
    
    private OrderId(Guid value) => Value = value;
    
    public static OrderId New() => new(Guid.NewGuid());
    public static OrderId From(Guid value)
    {
        if (value == Guid.Empty)
            throw new DomainException("OrderId cannot be empty");
        return new(value);
    }
    
    public override string ToString() => Value.ToString();
}

public sealed record CustomerId
{
    public Guid Value { get; }
    
    private CustomerId(Guid value) => Value = value;
    
    public static CustomerId New() => new(Guid.NewGuid());
    public static CustomerId From(Guid value)
    {
        if (value == Guid.Empty)
            throw new DomainException("CustomerId cannot be empty");
        return new(value);
    }
}

// ✅ Type-safe — cannot mix up parameters
public void ProcessOrder(OrderId orderId, CustomerId customerId, ProductId productId) { }

// This won't compile:
ProcessOrder(customerId, productId, orderId); // Compiler error!
```

**Note:** If you're using `record struct` for performance-critical scenarios, be aware of JSON serialisation behaviour and EF Core value converter requirements.

### Entity Base Class

Before defining entities, we need supporting infrastructure:

```csharp
// Marker interface for domain events
public interface IDomainEvent
{
    DateTime OccurredAt { get; }
}

// Base domain event with timestamp
public abstract record DomainEvent : IDomainEvent
{
    public DateTime OccurredAt { get; } = DateTime.UtcNow;
}

// Domain-specific exception
public class DomainException : Exception
{
    public DomainException(string message) : base(message) { }
}

// Marker interface for aggregate roots
public interface IAggregateRoot { }
```

Now the entity base class:

```csharp
public abstract class Entity<TId> where TId : notnull
{
    private readonly List<IDomainEvent> _domainEvents = new();
    
    public TId Id { get; protected init; }
    public IReadOnlyList<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();
    
    protected Entity(TId id)
    {
        if (id is null) throw new ArgumentNullException(nameof(id));
        Id = id;
    }
    
    protected void AddDomainEvent(IDomainEvent domainEvent)
    {
        _domainEvents.Add(domainEvent);
    }
    
    public void ClearDomainEvents() => _domainEvents.Clear();
    
    public override bool Equals(object? obj)
    {
        if (obj is not Entity<TId> other) return false;
        if (ReferenceEquals(this, other)) return true;
        if (GetType() != other.GetType()) return false;
        return Id.Equals(other.Id);
    }
    
    public override int GetHashCode() => Id.GetHashCode();
    
    public static bool operator ==(Entity<TId>? left, Entity<TId>? right) 
        => Equals(left, right);
    
    public static bool operator !=(Entity<TId>? left, Entity<TId>? right) 
        => !Equals(left, right);
}
```

**The `where TId : notnull` constraint** ensures the generic type parameter cannot be a nullable type, preventing `Entity<string?>` or `Entity<int?>` declarations.

---

## Aggregates: Consistency Boundaries

An aggregate is a cluster of entities and value objects treated as a single unit for data changes. The **aggregate root** is the entry point—external code should only reference and modify the aggregate through its root.

![Aggregate Boundary](/images/articles/rich-domain-model/aggregate.svg)

### Order Aggregate Example

First, let's define the supporting value objects:

```csharp
public sealed class Quantity : ValueObject
{
    public int Value { get; }
    
    private Quantity(int value) => Value = value;
    
    public static Quantity Create(int value)
    {
        if (value <= 0)
            throw new DomainException("Quantity must be positive");
        
        return new Quantity(value);
    }
    
    public Quantity Add(Quantity other) => new(Value + other.Value);
    
    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }
}

public sealed class Address : ValueObject
{
    public string Street { get; }
    public string City { get; }
    public string PostCode { get; }
    public string Country { get; }
    
    private Address(string street, string city, string postCode, string country)
    {
        Street = street;
        City = city;
        PostCode = postCode;
        Country = country;
    }
    
    public static Address Create(string street, string city, string postCode, string country)
    {
        if (string.IsNullOrWhiteSpace(street))
            throw new DomainException("Street is required");
        if (string.IsNullOrWhiteSpace(city))
            throw new DomainException("City is required");
        if (string.IsNullOrWhiteSpace(postCode))
            throw new DomainException("Post code is required");
        if (string.IsNullOrWhiteSpace(country))
            throw new DomainException("Country is required");
        
        return new Address(street.Trim(), city.Trim(), postCode.Trim().ToUpper(), country.Trim());
    }
    
    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Street;
        yield return City;
        yield return PostCode;
        yield return Country;
    }
}

// Domain events for the Order aggregate
public sealed record OrderCreatedEvent(OrderId OrderId, Email CustomerEmail) : DomainEvent;
public sealed record OrderSubmittedEvent(OrderId OrderId, Money Total, int LineCount) : DomainEvent;
public sealed record OrderPaidEvent(OrderId OrderId, string PaymentReference) : DomainEvent;
public sealed record OrderShippedEvent(OrderId OrderId, string TrackingNumber, DateTime ShippedAt) : DomainEvent;
public sealed record OrderCancelledEvent(OrderId OrderId, string Reason) : DomainEvent;
```

Now the aggregate itself:

```csharp
public class Order : Entity<OrderId>, IAggregateRoot
{
    private readonly List<OrderLine> _lines = new();
    
    public Email CustomerEmail { get; }
    public OrderStatus Status { get; private set; }
    public Money TotalAmount { get; private set; }
    public Address ShippingAddress { get; private set; }
    public IReadOnlyList<OrderLine> Lines => _lines.AsReadOnly();
    
    private Order(OrderId id, Email customerEmail, Address shippingAddress) 
        : base(id)
    {
        CustomerEmail = customerEmail;
        ShippingAddress = shippingAddress;
        Status = OrderStatus.Draft;
        TotalAmount = Money.Zero(Currency.GBP);
    }
    
    public static Order Create(Email customerEmail, Address shippingAddress)
    {
        if (customerEmail is null) throw new ArgumentNullException(nameof(customerEmail));
        if (shippingAddress is null) throw new ArgumentNullException(nameof(shippingAddress));
        
        var order = new Order(OrderId.New(), customerEmail, shippingAddress);
        order.AddDomainEvent(new OrderCreatedEvent(order.Id, customerEmail));
        return order;
    }
    
    public void AddLine(ProductId productId, string productName, Quantity quantity, Money unitPrice)
    {
        EnsureCanModify();
        
        // Check if product already exists
        var existingLine = _lines.FirstOrDefault(l => l.ProductId == productId);
        if (existingLine != null)
        {
            existingLine.IncreaseQuantity(quantity);
        }
        else
        {
            _lines.Add(new OrderLine(productId, productName, quantity, unitPrice));
        }
        
        RecalculateTotal();
    }
    
    public void RemoveLine(ProductId productId)
    {
        EnsureCanModify();
        
        var line = _lines.FirstOrDefault(l => l.ProductId == productId)
            ?? throw new DomainException($"Product {productId} not found in order");
        
        _lines.Remove(line);
        RecalculateTotal();
    }
    
    public void Submit()
    {
        EnsureCanModify();
        
        if (!_lines.Any())
            throw new DomainException("Cannot submit an empty order");
        
        if (TotalAmount.Amount < 1)
            throw new DomainException("Order total must be at least £1");
        
        Status = OrderStatus.Submitted;
        
        AddDomainEvent(new OrderSubmittedEvent(Id, TotalAmount, Lines.Count));
    }
    
    public void MarkAsPaid(string paymentReference)
    {
        if (string.IsNullOrWhiteSpace(paymentReference))
            throw new DomainException("Payment reference is required");
        
        if (Status != OrderStatus.Submitted)
            throw new DomainException("Only submitted orders can be marked as paid");
        
        Status = OrderStatus.Paid;
        
        AddDomainEvent(new OrderPaidEvent(Id, paymentReference));
    }
    
    public void Ship(string trackingNumber)
    {
        if (string.IsNullOrWhiteSpace(trackingNumber))
            throw new DomainException("Tracking number is required");
        
        if (Status != OrderStatus.Paid)
            throw new DomainException("Only paid orders can be shipped");
        
        Status = OrderStatus.Shipped;
        
        AddDomainEvent(new OrderShippedEvent(Id, trackingNumber, DateTime.UtcNow));
    }
    
    public void Cancel(string reason)
    {
        if (string.IsNullOrWhiteSpace(reason))
            throw new DomainException("Cancellation reason is required");
        
        if (Status == OrderStatus.Shipped)
            throw new DomainException("Cannot cancel a shipped order");
        
        Status = OrderStatus.Cancelled;
        
        AddDomainEvent(new OrderCancelledEvent(Id, reason));
    }
    
    private void EnsureCanModify()
    {
        if (Status != OrderStatus.Draft)
            throw new DomainException($"Cannot modify order in {Status} status");
    }
    
    private void RecalculateTotal()
    {
        TotalAmount = _lines.Aggregate(
            Money.Zero(Currency.GBP),
            (total, line) => total.Add(line.LineTotal));
    }
}

public enum OrderStatus
{
    Draft,
    Submitted,
    Paid,
    Shipped,
    Cancelled
}
```

### OrderLine as Entity within Aggregate

First, the ID types:

```csharp
public sealed record OrderLineId
{
    public Guid Value { get; }
    
    private OrderLineId(Guid value) => Value = value;
    
    public static OrderLineId New() => new(Guid.NewGuid());
    public static OrderLineId From(Guid value) => new(value);
}

public sealed record ProductId
{
    public Guid Value { get; }
    
    private ProductId(Guid value) => Value = value;
    
    public static ProductId New() => new(Guid.NewGuid());
    public static ProductId From(Guid value)
    {
        if (value == Guid.Empty)
            throw new DomainException("ProductId cannot be empty");
        return new(value);
    }
}
```

Now the OrderLine entity:

```csharp
public class OrderLine : Entity<OrderLineId>
{
    public ProductId ProductId { get; }
    public string ProductName { get; }
    public Quantity Quantity { get; private set; }
    public Money UnitPrice { get; }
    public Money LineTotal => UnitPrice.Multiply(Quantity.Value);
    
    internal OrderLine(ProductId productId, string productName, Quantity quantity, Money unitPrice)
        : base(OrderLineId.New())
    {
        ProductId = productId ?? throw new ArgumentNullException(nameof(productId));
        ProductName = !string.IsNullOrWhiteSpace(productName) 
            ? productName 
            : throw new DomainException("Product name is required");
        Quantity = quantity ?? throw new ArgumentNullException(nameof(quantity));
        UnitPrice = unitPrice ?? throw new ArgumentNullException(nameof(unitPrice));
    }
    
    internal void IncreaseQuantity(Quantity additionalQuantity)
    {
        Quantity = Quantity.Add(additionalQuantity);
    }
}
```

**Notice the `internal` modifier** on `OrderLine` methods. Only the `Order` aggregate can modify its lines—external code cannot tamper with order contents directly.

---

## Domain Services: When Behaviour Doesn't Fit

Sometimes operations don't naturally belong to any single entity. **Domain services** handle these cross-cutting behaviours:

```csharp
public interface IPricingService
{
    Money CalculateDiscount(Order order, Customer customer);
}

public class PricingService : IPricingService
{
    public Money CalculateDiscount(Order order, Customer customer)
    {
        var discount = Money.Zero(order.TotalAmount.Currency);
        
        // Loyal customer discount: 10%
        if (customer.TotalPurchases.Amount > 1000)
        {
            discount = discount.Add(order.TotalAmount.Percentage(10));
        }
        
        // Bulk order discount: 5%
        if (order.Lines.Sum(l => l.Quantity.Value) > 10)
        {
            discount = discount.Add(order.TotalAmount.Percentage(5));
        }
        
        return discount;
    }
}
```

**Domain services should be:**

- Stateless
- Named after domain concepts (not technical patterns)
- Used when behaviour involves multiple aggregates

---

## The Specification Pattern

Complex business rules can be encapsulated in specifications—composable, reusable predicates:

```csharp
public abstract class Specification<T>
{
    public abstract bool IsSatisfiedBy(T entity);
    
    public Specification<T> And(Specification<T> other) 
        => new AndSpecification<T>(this, other);
    
    public Specification<T> Or(Specification<T> other) 
        => new OrSpecification<T>(this, other);
    
    public Specification<T> Not() 
        => new NotSpecification<T>(this);
}

// Example specifications
public class OrderReadyToShipSpecification : Specification<Order>
{
    public override bool IsSatisfiedBy(Order order) 
        => order.Status == OrderStatus.Paid && order.Lines.Any();
}

public class HighValueOrderSpecification : Specification<Order>
{
    private readonly Money _threshold;
    
    public HighValueOrderSpecification(Money threshold) => _threshold = threshold;
    
    public override bool IsSatisfiedBy(Order order) 
        => order.TotalAmount.Amount >= _threshold.Amount;
}

// Usage
var readyToShip = new OrderReadyToShipSpecification();
var highValue = new HighValueOrderSpecification(Money.Create(500, Currency.GBP));
var priorityShipments = readyToShip.And(highValue);

var priorityOrders = orders.Where(o => priorityShipments.IsSatisfiedBy(o));
```

---

## Persistence: Keeping the Domain Clean

Your domain model shouldn't know about databases. Use the **Repository pattern** to abstract persistence:

```csharp
public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(OrderId id, CancellationToken ct = default);
    Task<IReadOnlyList<Order>> GetByCustomerAsync(CustomerId customerId, CancellationToken ct = default);
    Task AddAsync(Order order, CancellationToken ct = default);
    Task UpdateAsync(Order order, CancellationToken ct = default);
}
```

The repository interface lives in your Domain or Application layer. Implementations using EF Core, Dapper, Marten, or any other persistence technology belong in Infrastructure.

```csharp
// Application layer — uses the abstraction
public class SubmitOrderHandler
{
    private readonly IOrderRepository _orders;
    
    public SubmitOrderHandler(IOrderRepository orders) => _orders = orders;
    
    public async Task HandleAsync(SubmitOrderCommand command, CancellationToken ct)
    {
        var order = await _orders.GetByIdAsync(command.OrderId, ct)
            ?? throw new DomainException("Order not found");
        
        order.Submit();
        
        await _orders.UpdateAsync(order, ct);
    }
}
```

**Key principle:** The domain doesn't care how data is stored. Whether you're using SQL Server, PostgreSQL, MongoDB, or event sourcing—the domain code remains unchanged.

> **Note:** Mapping value objects, strongly-typed IDs, and owned collections to your ORM requires specific configuration. EF Core, for example, needs value converters and owned type mappings. I'll cover persistence patterns in a dedicated article.

---

## Testing Rich Domain Models

Rich models are a joy to test—no mocking required, just create objects and verify behaviour:

```csharp
public class OrderTests
{
    [Fact]
    public void AddLine_ToDraftOrder_IncreasesTotal()
    {
        // Arrange
        var order = CreateDraftOrder();
        var unitPrice = Money.Create(25.00m, Currency.GBP);
        
        // Act
        order.AddLine(ProductId.New(), "Widget", Quantity.Create(3), unitPrice);
        
        // Assert
        order.TotalAmount.Amount.Should().Be(75.00m);
        order.Lines.Should().HaveCount(1);
    }
    
    [Fact]
    public void AddLine_ToSubmittedOrder_ThrowsDomainException()
    {
        // Arrange
        var order = CreateSubmittedOrder();
        
        // Act
        var act = () => order.AddLine(
            ProductId.New(), 
            "Widget", 
            Quantity.Create(1), 
            Money.Create(10, Currency.GBP));
        
        // Assert
        act.Should().Throw<DomainException>()
            .WithMessage("Cannot modify order in Submitted status");
    }
    
    [Fact]
    public void Ship_UnpaidOrder_ThrowsDomainException()
    {
        // Arrange
        var order = CreateSubmittedOrder();
        
        // Act
        var act = () => order.Ship("TRK123456");
        
        // Assert
        act.Should().Throw<DomainException>()
            .WithMessage("Only paid orders can be shipped");
    }
    
    [Fact]
    public void Submit_RaisesOrderSubmittedEvent()
    {
        // Arrange
        var order = CreateDraftOrderWithLines();
        order.ClearDomainEvents(); // Clear the OrderCreatedEvent
        
        // Act
        order.Submit();
        
        // Assert
        order.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<OrderSubmittedEvent>();
    }
    
    [Fact]
    public void Cancel_ShippedOrder_ThrowsDomainException()
    {
        // Arrange
        var order = CreateShippedOrder();
        
        // Act
        var act = () => order.Cancel("Customer changed mind");
        
        // Assert
        act.Should().Throw<DomainException>()
            .WithMessage("Cannot cancel a shipped order");
    }
    
    private static Order CreateDraftOrder() 
        => Order.Create(Email.Create("test@example.com"), CreateAddress());
    
    private static Order CreateDraftOrderWithLines()
    {
        var order = CreateDraftOrder();
        order.AddLine(ProductId.New(), "Test Product", Quantity.Create(1), Money.Create(50, Currency.GBP));
        return order;
    }
    
    private static Order CreateSubmittedOrder()
    {
        var order = CreateDraftOrderWithLines();
        order.Submit();
        return order;
    }
    
    private static Order CreateShippedOrder()
    {
        var order = CreateSubmittedOrder();
        order.MarkAsPaid("PAY-123");
        order.Ship("TRK-456");
        return order;
    }
    
    private static Address CreateAddress() 
        => Address.Create("123 Test St", "London", "SW1A 1AA", "UK");
}
```

**Note:** No mocks, no setup complexity, no infrastructure. Pure domain logic testing.

---

## Key Takeaways

**Rich Domain Models provide:**

- **Encapsulation** — Objects protect their own invariants
- **Discoverability** — Behaviour lives where you expect it
- **Type safety** — Value objects prevent primitive obsession bugs
- **Testability** — Domain logic tests without infrastructure
- **Maintainability** — Changes isolated to relevant aggregates

**When to use rich models:**

- Complex business rules that evolve over time
- Domains with clear invariants and state transitions
- Teams with strong OOP understanding
- Systems where correctness matters more than rapid prototyping

**When anaemic models might suffice:**

- Simple CRUD applications
- Throw-away prototypes
- Teams unfamiliar with DDD concepts
- Extremely performance-sensitive hot paths

---

## Conclusion

Escaping the anaemic model trap requires a mindset shift. Instead of thinking about data and operations separately, think about objects that **own their behaviour**. Value objects enforce rules at the point of creation. Entities maintain identity and raise events. Aggregates define consistency boundaries.

The code becomes more expressive, safer, and easier to maintain. Business rules live in one place—the domain—rather than scattered across services, controllers, and utilities. Invalid states become unrepresentable.

Start small. Identify one entity in your codebase that's really just a data bag. Extract a value object. Add a behaviour method. Move validation inside. Watch your domain come alive.

**The best code reads like the business speaks.** Rich domain models make that possible.
