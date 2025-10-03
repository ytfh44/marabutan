# Template System API Documentation

## Overview

The Template System provides string-based templating with interpolation, control structures, and filters for building dynamic HTML content. It integrates seamlessly with the Virtual DOM system and supports both simple interpolation and advanced template features.

## Core Types

### TemplateContext

```typescript
interface TemplateContext {
  [key: string]: any;
}
```

Context object containing data available to templates during rendering.

### TemplateOptions

```typescript
interface TemplateOptions {
  context?: TemplateContext;
  components?: Record<string, Function>;
  filters?: Record<string, Function>;
}
```

Configuration options for template rendering.

### TemplateEngine

```typescript
class TemplateEngine {
  constructor(options?: TemplateOptions);
  render(template: string): VNode | VNode[];
  updateContext(newContext: TemplateContext): void;
}
```

Main template engine class for advanced template rendering and context management.

## Core Functions

### template

Renders a template string with the provided context and options.

```typescript
function template(
  templateString: string,
  context?: TemplateContext,
  options?: Omit<TemplateOptions, 'context'>
): VNode | VNode[]
```

**Parameters:**
- `templateString`: Template string with interpolation and directives
- `context`: Data context for template variables (optional)
- `options`: Template options excluding context (optional)

**Returns:** A Virtual DOM node or array of nodes

**Example:**
```typescript
import { template, defaultFilters } from './template';

const user = {
  name: 'John Doe',
  age: 30,
  items: ['apple', 'banana', 'cherry']
};

// Simple interpolation
const result = template(`
  <div class="user">
    <h2>{{ user.name }}</h2>
    <p>Age: {{ user.age }}</p>
    <p>Items: {{ user.items | length }}</p>
  </div>
`, { user }, { filters: defaultFilters });
```

## TemplateEngine Class

### Constructor

Creates a new template engine instance.

```typescript
constructor(options: TemplateOptions = {})
```

**Parameters:**
- `options`: Template configuration options

**Example:**
```typescript
const engine = new TemplateEngine({
  context: { user: { name: 'John' } },
  filters: { uppercase: (str) => str.toUpperCase() }
});
```

### render()

Renders a template string with the current context and configuration.

```typescript
render(template: string): VNode | VNode[]
```

**Parameters:**
- `template`: Template string to render

**Returns:** Virtual DOM node(s)

**Example:**
```typescript
const engine = new TemplateEngine({
  context: { message: 'Hello World' }
});

const result = engine.render('<h1>{{ message }}</h1>');
```

### updateContext()

Updates the template context for subsequent renders.

```typescript
updateContext(newContext: TemplateContext): void
```

**Parameters:**
- `newContext`: New context object to merge with existing context

**Example:**
```typescript
const engine = new TemplateEngine({
  context: { count: 0 }
});

engine.updateContext({ count: 1 });
// Now renders with updated context
```

## Template Syntax

### Interpolation

Use double curly braces `{{ }}` for variable interpolation:

```typescript
const template = '<h1>{{ title }}</h1>';
const result = template(template, { title: 'Hello World' });
```

### Filters

Apply filters to variables using the pipe `|` operator:

```typescript
const template = '<p>{{ name | uppercase }}</p>';
const result = template(template, { name: 'john' }, { filters: defaultFilters });
// Result: <p>JOHN</p>
```

Chain multiple filters:

```typescript
const template = '<p>{{ name | capitalize | length }}</p>';
// Applies capitalize first, then length
```

## Default Filters

The framework provides several built-in filters:

### Text Filters

#### uppercase
Converts string to uppercase.

```typescript
{{ value | uppercase }}
```

#### lowercase
Converts string to lowercase.

```typescript
{{ value | lowercase }}
```

#### capitalize
Capitalizes the first letter of each word.

```typescript
{{ value | capitalize }}
```

### Array Filters

#### length
Returns the length of an array or string.

```typescript
{{ items | length }}
{{ text | length }}
```

#### join
Joins array elements with a separator.

```typescript
{{ items | join }}
{{ items | join:', ' }}
```

### Number Filters

#### number
Formats a number with specified decimal places.

```typescript
{{ price | number }}
{{ price | number:2 }}
```

### Date Filters

#### date
Formats a date object.

```typescript
{{ createdAt | date }}
{{ createdAt | date:'YYYY-MM-DD' }}
```

## Template Directives

### @if Directive

Conditional rendering based on expression evaluation.

```typescript
<div class="container">
  <h1>{{ title }}</h1>
  @if condition
    <p>{{ message }}</p>
  @endif
</div>
```

**Example:**
```typescript
const template = `
<div>
  <h1>Status</h1>
  @if isLoggedIn
    <p>Welcome back, {{ user.name }}!</p>
  @endif
  @if !isLoggedIn
    <p>Please log in to continue.</p>
  @endif
</div>
`;

const result = template(template, {
  isLoggedIn: true,
  user: { name: 'John' }
});
```

### @for Directive

Iterates over arrays or objects.

```typescript
<ul>
  @for item in items
    <li>{{ item.name }}</li>
  @endfor
</ul>
```

**Example:**
```typescript
const template = `
<div class="product-list">
  <h2>Products</h2>
  <ul>
    @for product in products
      <li class="product">
        <h3>{{ product.name }}</h3>
        <p>Price: ${{ product.price | number:2 }}</p>
      </li>
    @endfor
  </ul>
</div>
`;

const result = template(template, {
  products: [
    { name: 'Laptop', price: 999.99 },
    { name: 'Mouse', price: 29.99 }
  ]
}, { filters: defaultFilters });
```

## Advanced Usage Examples

### Template with Components

```typescript
import { template } from './template';
import { createElement } from './vdom/createElement';

const componentTemplate = template(`
  <div class="dashboard">
    <h1>{{ title }}</h1>
    <div class="stats">
      @for stat in stats
        <div class="stat">
          <span class="label">{{ stat.label }}:</span>
          <span class="value">{{ stat.value }}</span>
        </div>
      @endfor
    </div>
  </div>
`, {
  title: 'Dashboard',
  stats: [
    { label: 'Users', value: 1234 },
    { label: 'Revenue', value: 56789 }
  ]
});

// Use in JSX
const App = () => (
  <div className="app">
    <h1>My App</h1>
    {componentTemplate}
  </div>
);
```

### Dynamic Templates with TemplateEngine

```typescript
import { TemplateEngine, defaultFilters } from './template';

class DynamicRenderer {
  private engine: TemplateEngine;

  constructor() {
    this.engine = new TemplateEngine({
      filters: defaultFilters
    });
  }

  renderUserCard(user: any) {
    this.engine.updateContext({ user });
    return this.engine.render(`
      <div class="user-card">
        <img src="{{ user.avatar }}" alt="Avatar" />
        <h3>{{ user.name | capitalize }}</h3>
        <p>{{ user.bio }}</p>
        <div class="stats">
          <span>Posts: {{ user.posts | length }}</span>
          <span>Followers: {{ user.followers | number }}</span>
        </div>
      </div>
    `);
  }

  renderPostList(posts: any[]) {
    this.engine.updateContext({ posts });
    return this.engine.render(`
      <div class="posts">
        <h2>Recent Posts</h2>
        @for post in posts
          <article class="post">
            <h3>{{ post.title }}</h3>
            <p>{{ post.content | truncate:100 }}</p>
            <small>By {{ post.author }} on {{ post.date | date }}</small>
          </article>
        @endfor
      </div>
    `);
  }
}
```

### Custom Filters

```typescript
import { template, defaultFilters } from './template';

const customFilters = {
  ...defaultFilters,
  currency: (value: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(value);
  },
  truncate: (value: string, length: number) => {
    if (value.length <= length) return value;
    return value.substring(0, length) + '...';
  },
  json: (value: any) => JSON.stringify(value, null, 2)
};

const data = {
  product: {
    name: 'Premium Laptop',
    price: 1299.99,
    specs: { ram: '16GB', storage: '512GB SSD' }
  },
  description: 'This is a very long description that should be truncated for display.'
};

const result = template(`
  <div class="product">
    <h2>{{ product.name }}</h2>
    <p class="price">{{ product.price | currency }}</p>
    <p class="description">{{ description | truncate:50 }}</p>
    <pre>{{ product.specs | json }}</pre>
  </div>
`, data, { filters: customFilters });
```

## Expression Evaluation

The template system supports various expression types:

### Property Access

```typescript
{{ user.name }}
{{ user.profile.settings.theme }}
```

### Array Access

```typescript
{{ items[0] }}
{{ users[userIndex].name }}
```

### Basic Operations

```typescript
{{ count + 1 }}
{{ price * 1.1 }}
{{ items.length > 0 ? 'Has items' : 'Empty' }}
```

### Literals

```typescript
{{ "Hello World" }}
{{ 42 }}
{{ true }}
{{ null }}
```

## Error Handling

Template errors are handled gracefully with fallback rendering:

```typescript
const template = '<div>{{ undefined.property }}</div>';
const result = template(template, {});
// Renders: <div></div> (empty content for failed expressions)
```

For debugging, check the console for template evaluation errors:

```typescript
const engine = new TemplateEngine({
  context: { data: null }
});

try {
  const result = engine.render('<div>{{ data.nonexistent }}</div>');
} catch (error) {
  console.error('Template error:', error);
}
```

## Performance Considerations

### Template Compilation

- Templates are parsed on-demand, consider caching for frequently used templates
- Use TemplateEngine instance for repeated renders with different contexts

### Filter Performance

- Built-in filters are optimized for performance
- Custom filters should avoid expensive operations
- Consider memoization for complex filter logic

### Context Size

- Large context objects can impact performance
- Only include necessary data in template context
- Use computed properties in context preparation

## Best Practices

### 1. Keep Templates Readable

```typescript
// Good - well-formatted and readable
const template = `
<div class="user-profile">
  <h1>{{ user.name }}</h1>
  <p class="bio">{{ user.bio }}</p>
  <div class="stats">
    <span>Posts: {{ user.posts | length }}</span>
  </div>
</div>
`;

// Avoid - cramped and hard to read
const template = '<div class="user-profile"><h1>{{user.name}}</h1><p class="bio">{{user.bio}}</p><div class="stats"><span>Posts: {{user.posts|length}}</span></div></div>';
```

### 2. Use Meaningful Variable Names

```typescript
// Good
{{ user.firstName }} {{ user.lastName }}
{{ product.displayPrice | currency }}

// Avoid
{{ u.fn }} {{ u.ln }}
{{ p.dp | curr }}
```

### 3. Leverage Filters for Presentation Logic

```typescript
// Good - presentation logic in filters
{{ user.createdAt | date:'MM/DD/YYYY' }}
{{ product.price | currency:'EUR' }}

// Avoid - complex logic in templates
{{ user.createdAt.getMonth() + 1 + '/' + user.createdAt.getDate() + '/' + user.createdAt.getFullYear() }}
```

### 4. Structure Complex Templates

```typescript
// Break complex templates into smaller parts
const headerTemplate = template('<header><h1>{{ title }}</h1></header>', { title });
const contentTemplate = template('<main>{{ content }}</main>', { content });
const footerTemplate = template('<footer>{{ copyright }}</footer>', { copyright });

// Combine in JSX or another template
const fullPage = (
  <div className="page">
    {headerTemplate}
    {contentTemplate}
    {footerTemplate}
  </div>
);
```

### 5. Validate Context Data

```typescript
// Good - validate context before rendering
const userTemplate = (user: User | null) => {
  if (!user) {
    return template('<div>No user data available</div>');
  }

  return template('<div>Welcome {{ user.name }}!</div>', { user });
};

// Avoid - templates fail silently on missing data
const badTemplate = template('<div>Welcome {{ user.name }}!</div>', { user: null });
```

## Integration with Other Systems

### With Virtual DOM

Templates automatically generate Virtual DOM nodes:

```typescript
import { template } from './template';
import { diff, patch } from './vdom';

const oldTemplate = template('<div>{{ count }}</div>', { count: 0 });
const newTemplate = template('<div>{{ count }}</div>', { count: 1 });

const patches = diff(oldTemplate, newTemplate);
patch(document.body, patches);
```

### With Components

Use templates within component render functions:

```typescript
import { createComponent } from './components/core';
import { template } from './template';

const ListComponent = createComponent({
  initialState: { items: [] },
  view: (state) => {
    const listTemplate = template(`
      <ul>
        @for item in items
          <li>{{ item.text }}</li>
        @endfor
      </ul>
    `, { items: state.items });

    return createElement('div', { className: 'list-container' },
      createElement('h2', {}, 'My List'),
      listTemplate
    );
  }
});
```

### With MVI Architecture

Templates work seamlessly with MVI view functions:

```typescript
const app = {
  initialState: { message: 'Hello', items: [] },
  view: (state) => {
    // Use templates for complex HTML structures
    const content = template(`
      <div class="content">
        <h1>{{ message }}</h1>
        @if items.length > 0
          <ul>
            @for item in items
              <li>{{ item }}</li>
            @endfor
          </ul>
        @endif
      </div>
    `, state);

    return content;
  }
  // ... rest of MVI app
};
```

This template system provides a flexible, performant way to generate dynamic HTML content while maintaining clean separation between presentation and logic.
