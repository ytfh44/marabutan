import { template, defaultFilters, TemplateEngine } from '../template';
import { createElement, Fragment } from '../vdom/createElement';

/**
 * Template System Examples for Marabutan Framework
 */

/**
 * Basic template with interpolation
 */
export function basicTemplateExample() {
  const user = {
    name: 'John Doe',
    age: 30,
    city: 'New York'
  };

  const templateString = `
    <div class="user-profile">
      <h2>{{ user.name }}</h2>
      <p>Age: {{ user.age }}</p>
      <p>City: {{ user.city | uppercase }}</p>
    </div>
  `;

  return template(templateString, { user }, { filters: defaultFilters });
}

/**
 * Template with conditionals and loops
 */
export function advancedTemplateExample() {
  const data = {
    users: [
      { name: 'Alice', active: true, role: 'admin' },
      { name: 'Bob', active: false, role: 'user' },
      { name: 'Charlie', active: true, role: 'moderator' }
    ],
    title: 'User Management'
  };

  const templateString = `
    <div class="user-management">
      <h1>{{ title | uppercase }}</h1>

      <div class="user-stats">
        <p>Total users: {{ users | length }}</p>
        <p>Active users: {{ users | filter:active | length }}</p>
      </div>

      <ul class="user-list">
        <li class="user-item" *for="user in users">
          <span class="user-name">{{ user.name | capitalize }}</span>
          <span class="user-role">{{ user.role }}</span>
          <span class="user-status {{ user.active ? 'active' : 'inactive' }}">
            {{ user.active ? 'Active' : 'Inactive' }}
          </span>
        </li>
      </ul>
    </div>
  `;

  // Add custom filter for this example
  const filters = {
    ...defaultFilters,
    filter: (items: any[], condition: string) => {
      if (condition === 'active') {
        return items.filter(item => item.active);
      }
      return items;
    }
  };

  return template(templateString, data, { filters });
}

/**
 * Template engine class usage
 */
export function templateEngineExample() {
  const engine = new TemplateEngine({
    context: {
      title: 'Product List',
      products: [
        { name: 'Laptop', price: 999, inStock: true },
        { name: 'Mouse', price: 25, inStock: false },
        { name: 'Keyboard', price: 75, inStock: true }
      ]
    },
    filters: {
      ...defaultFilters,
      currency: (value: number) => `$${value.toFixed(2)}`,
      availability: (inStock: boolean) => inStock ? 'In Stock' : 'Out of Stock'
    }
  });

  const templateString = `
    <div class="product-catalog">
      <h1>{{ title }}</h1>
      <div class="products">
        <div class="product-card" *for="product in products">
          <h3>{{ product.name }}</h3>
          <p class="price">{{ product.price | currency }}</p>
          <p class="stock {{ product.inStock ? 'available' : 'unavailable' }}">
            {{ product.inStock | availability }}
          </p>
          <button {{ product.inStock ? '' : 'disabled' }}>
            {{ product.inStock ? 'Add to Cart' : 'Out of Stock' }}
          </button>
        </div>
      </div>
    </div>
  `;

  return engine.render(templateString);
}

/**
 * Mixed template and JSX example
 */
export function mixedExample() {
  const data = {
    title: 'Dashboard',
    stats: {
      users: 1234,
      orders: 567,
      revenue: 89012
    }
  };

  // Use template for data interpolation
  const statsTemplate = template(`
    <div class="stats-grid">
      <div class="stat-card">
        <h3>{{ stats.users | number }}</h3>
        <p>Total Users</p>
      </div>
      <div class="stat-card">
        <h3>{{ stats.orders | number }}</h3>
        <p>Total Orders</p>
      </div>
      <div class="stat-card">
        <h3>{{ stats.revenue | number }}</h3>
        <p>Revenue</p>
      </div>
    </div>
  `, data);

  // Use JSX for complex interactions
  const jsxPart = {
    type: 'div',
    props: { className: 'dashboard' },
    children: [
      {
        type: 'h1',
        props: {},
        children: [data.title]
      },
      {
        type: 'div',
        props: { className: 'controls' },
        children: [
          {
            type: 'button',
            props: { onClick: () => console.log('Refresh clicked') },
            children: ['Refresh Data']
          },
          {
            type: 'button',
            props: { onClick: () => console.log('Export clicked') },
            children: ['Export Report']
          }
        ]
      },
      {
        type: 'div',
        props: { className: 'content' },
        children: [statsTemplate]
      }
    ]
  };

  return jsxPart;
}
