# Understanding JSON vs TOON for LLM Workflows

As AI systems and Large Language Models (LLMs) become core parts of modern applications, developers are rethinking how data is structured and sent to models. While **JSON** has been the standard for decades, a new format called **TOON (Token-Oriented Object Notation)** is emerging—with a focus on efficiency and reduced token usage.

In this article, you'll learn what TOON is, when to use it, and how to convert your own JSON data step by step.

---

## What Is JSON?

JSON (JavaScript Object Notation) is a widely adopted, human-readable format used across APIs, configuration files, and system-to-system communication.

**Why JSON is commonly used:**

- **Readable** — Easy for humans to understand
- **Universal** — Supported by almost every programming language
- **Structured** — Great for nested and complex data
- **Standardised** — Perfect for APIs and web services

Here's a typical JSON example:

```json
{
  "users": [
    { "id": 1, "name": "Alice", "role": "Admin" },
    { "id": 2, "name": "Bob", "role": "Editor" }
  ]
}
```

---

## What Is TOON?

TOON (Token-Oriented Object Notation) is a modern data format designed specifically for LLM consumption. It's not meant to replace JSON everywhere—only when you feed structured data into AI models.

**Why use TOON:**

- **Token Efficiency** — Removes repeated field names
- **Compact Format** — Ideal for large lists of uniform objects
- **Designed for LLMs** — Built for scenarios where tokens = cost
- **Faster Processing** — Less noise for the model to parse

Here's the same data in TOON format:

```text
users: items[2]{id,name,role}:
  1,Alice,Admin
  2,Bob,Editor
```

Notice how the field names (`id`, `name`, `role`) appear only once in the header, not repeated for every object.

---

## When JSON Falls Short

When working with LLMs, JSON becomes inefficient:

- **Repeated keys waste tokens** — Every object repeats the same field names
- **Deeply nested structures increase model load** — More tokens to parse
- **Large arrays lead to exponential token costs** — 1000 objects = 1000× the key names
- **Tokens directly affect cost and performance** — More tokens = higher API bills

> **Important**: JSON remains the best choice for APIs, system communication, and configuration files. TOON is specifically for LLM input optimization.

---

## Try It Yourself: Step-by-Step Tutorial

Let's convert a real JSON example to TOON using [toonifyit.com](https://toonifyit.com).

### Step 1: Prepare Your JSON

Copy this sample JSON representing a list of users:

```json
{
  "users": [
    { "id": 1, "name": "Alice", "role": "Admin" },
    { "id": 2, "name": "Bob", "role": "Editor" }
  ]
}
```

### Step 2: Open the Converter

Go to [toonifyit.com](https://toonifyit.com) in your browser.

### Step 3: Paste Your JSON

Paste the JSON into the **JSON Input** panel on the left side.

### Step 4: Configure Options (Optional)

You can customize the output:

- **Delimiter** — Choose between comma (`,`), space, or tab
- **Indentation** — Set 2 spaces, 4 spaces, or tabs
- **Show length markers** — Include array length in the output

### Step 5: View the TOON Output

The converter automatically generates the TOON output on the right:

```text
users: items[2]{id,name,role}:
  1,Alice,Admin
  2,Bob,Editor
```

Here's what the converter looks like in action:

![ToonifyIt Converter Interface](/images/articles/toonifyit-converter.png)

### Step 6: Check Token Savings

At the bottom of the converter, you'll see the token comparison:

- **JSON:** 30 tokens
- **TOON:** 17 tokens
- **Saved:** 43%

That's a **43% reduction** in tokens for this small example. With larger datasets, the savings grow even more.

---

## Real-World Example: Transaction Data

Imagine you're sending hundreds of transactions to an LLM to analyse spending patterns.

### JSON Version (68 tokens)

```json
[
  { "date": "2024-01-10", "merchant": "Tesco", "amount": 52.30 },
  { "date": "2024-01-11", "merchant": "Amazon", "amount": 14.99 },
  { "date": "2024-01-12", "merchant": "Starbucks", "amount": 4.50 }
]
```

### TOON Version (35 tokens)

```text
transactions[3]{date,merchant,amount}:
  "2024-01-10",Tesco,52.30
  "2024-01-11",Amazon,14.99
  "2024-01-12",Starbucks,4.50
```

**Result:** ~49% fewer tokens. Scale this to 1,000 transactions, and you're saving thousands of tokens per request.

---

## When to Use TOON

✅ **Use TOON for:**

- Feeding product catalogs to LLM-powered search engines
- Analysing logs with AI agents
- Summarising large tabular datasets
- Passing state in multi-step LLM workflows
- Any scenario where you control the LLM input format

---

## When to Avoid TOON

❌ **Don't use TOON for:**

- Deeply nested data structures
- Objects with varying fields (heterogeneous)
- Third-party API communication
- Human-readable configuration files
- Any system that expects JSON

---

## Best Practices

1. **Use JSON for systems** — APIs, configuration, and external communication
2. **Use TOON for LLMs** — Agents, AI pipelines, and model inputs
3. **Validate structure first** — Ensure your data is uniform before converting
4. **Benchmark token counts** — Measure savings on your actual datasets
5. **Keep both formats** — Store JSON, convert to TOON only when sending to LLMs

---

## Conversion Tools

Several tools can convert JSON to TOON:

- **ToonifyIt** — [toonifyit.com](https://toonifyit.com)
- **Scalevise Converter** — [scalevise.com/json-toon-converter](https://scalevise.com/json-toon-converter)
- **SpeedCoder** — [speedcoder.net/tools/converter/json-to-toon](https://www.speedcoder.net/tools/converter/json-to-toon)

For automation, TOON libraries exist for Python, TypeScript, and other languages.

---

## Conclusion

JSON will continue to power the modern web—but TOON introduces a more efficient way to feed structured data into LLMs.

**Your next step:** Try converting your own JSON at [toonifyit.com](https://toonifyit.com) and measure the token difference. The savings might surprise you.
