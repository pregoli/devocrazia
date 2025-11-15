# Introduction to Modern CSS Layouts

CSS has evolved significantly over the years, and today we have powerful tools like **Flexbox** and **CSS Grid** that make creating responsive layouts easier than ever before.

## The Power of Flexbox

Flexbox is a one-dimensional layout method for arranging items in rows or columns. Items flex (expand) to fill additional space or shrink to fit into smaller spaces.

### Basic Flexbox Example

```css
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}
```

This simple code creates a flexible container where items are evenly distributed with space between them.

## CSS Grid: The Game Changer

CSS Grid is a two-dimensional layout system that allows you to create complex layouts with ease. It gives you precise control over both rows and columns.

```css
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}
```

> **Pro tip**: Use `auto-fit` or `auto-fill` with `minmax()` to create truly responsive grids without media queries.

## Combining Both Approaches

The real power comes from combining Flexbox and Grid. Use Grid for the overall page layout, and Flexbox for component-level layouts.

### Real-World Example

Here's a practical example of a card layout:

```html
<div class="card-grid">
  <div class="card">
    <div class="card-header">
      <h3>Card Title</h3>
    </div>
    <div class="card-body">
      <p>Card content goes here</p>
    </div>
  </div>
</div>
```

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.card {
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

## Key Takeaways

- **Flexbox** is perfect for one-dimensional layouts (rows or columns)
- **Grid** excels at two-dimensional layouts (rows and columns)
- Combine both for maximum flexibility
- Modern CSS eliminates the need for complex float-based layouts

## Conclusion

Mastering Flexbox and CSS Grid will significantly improve your ability to create responsive, maintainable layouts. Start small, experiment, and gradually incorporate these tools into your projects.
