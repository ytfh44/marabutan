import { createElement, Fragment } from './vdom/createElement';
import type { VNode } from './vdom/types';

/**
 * Template System for Marabutan Framework
 * Provides string-based templating with interpolation and control structures
 */

export interface TemplateContext {
  [key: string]: any;
}

export interface TemplateOptions {
  context?: TemplateContext;
  components?: Record<string, Function>;
  filters?: Record<string, Function>;
}

/**
 * Simple template engine with interpolation and basic control structures
 */
export class TemplateEngine {
  private context: TemplateContext;
  private components: Record<string, Function>;
  private filters: Record<string, Function>;

  constructor(options: TemplateOptions = {}) {
    this.context = options.context || {};
    this.components = options.components || {};
    this.filters = options.filters || {};
  }

  /**
   * Render a template string with the given context
   */
  render(template: string): VNode | VNode[] {
    return this.parseTemplate(template);
  }

  /**
   * Update context and re-render
   */
  updateContext(newContext: TemplateContext): void {
    this.context = { ...this.context, ...newContext };
  }

  /**
   * Parse template string into VNodes
   */
  private parseTemplate(template: string): VNode | VNode[] {
    // Handle different template syntaxes
    const fragments: VNode[] = [];
    let currentText = '';
    let i = 0;

    while (i < template.length) {
      const char = template[i];

      if (char === '{' && i + 1 < template.length && template[i + 1] === '{') {
        // Handle {{
        if (currentText) {
          fragments.push(createElement('', {}, currentText));
          currentText = '';
        }

        const endIndex = template.indexOf('}}', i + 2);
        if (endIndex !== -1) {
          const expression = template.slice(i + 2, endIndex).trim();
          const result = this.evaluateExpression(expression);
          if (result !== null && result !== undefined) {
            if (typeof result === 'string' || typeof result === 'number') {
              fragments.push(createElement('', {}, String(result)));
            } else if (Array.isArray(result)) {
              fragments.push(...result);
            } else if (result && typeof result === 'object' && 'type' in result) {
              fragments.push(result);
            }
          }
          i = endIndex + 2;
          continue;
        }
      } else if (char === '<' && i + 1 < template.length && template[i + 1] !== '/') {
        // Handle HTML-like tags
        if (currentText) {
          fragments.push(createElement('', {}, currentText));
          currentText = '';
        }

        const tagEnd = template.indexOf('>', i + 1);
        if (tagEnd !== -1) {
          const tagContent = template.slice(i + 1, tagEnd);
          const vnode = this.parseTag(tagContent);
          if (vnode) {
            fragments.push(vnode);
          }
          i = tagEnd + 1;
          continue;
        }
      } else if (char === '<' && i + 1 < template.length && template[i + 1] === '/') {
        // Handle closing tags - for now, just skip them
        const closeTagEnd = template.indexOf('>', i + 1);
        if (closeTagEnd !== -1) {
          i = closeTagEnd + 1;
          continue;
        }
      }

      currentText += char;
      i++;
    }

    // Add remaining text
    if (currentText) {
      fragments.push(createElement('', {}, currentText));
    }

    return fragments.length === 1 ? fragments[0] : createElement(Fragment, {}, fragments as any);
  }

  /**
   * Parse a tag into a VNode
   */
  private parseTag(tagContent: string): VNode | null {
    const parts = tagContent.split(/\s+/);
    if (parts.length === 0) return null;

    const tagName = parts[0];
    const attributes: Record<string, any> = {};

    // Parse attributes
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      if (part.includes('=')) {
        const [key, value] = part.split('=', 2);
        attributes[key] = value.replace(/"/g, '');
      } else {
        attributes[part] = true;
      }
    }

    // Handle special directives
    if (tagName.startsWith('@')) {
      return this.handleDirective(tagName.slice(1), attributes);
    }

    return createElement(tagName, attributes);
  }

  /**
   * Handle template directives
   */
  private handleDirective(directive: string, attributes: Record<string, any>): VNode | null {
    switch (directive) {
      case 'if':
        return this.handleIf(attributes);
      case 'for':
        return this.handleFor(attributes);
      default:
        return null;
    }
  }

  /**
   * Handle @if directive
   */
  private handleIf(attributes: Record<string, any>): VNode | null {
    const condition = attributes.condition;
    if (!condition) return null;

    const result = this.evaluateExpression(condition);
    if (result) {
      return createElement('', {}, attributes.children || '');
    }

    return null;
  }

  /**
   * Handle @for directive
   */
  private handleFor(attributes: Record<string, any>): VNode | null {
    const items = this.evaluateExpression(attributes.items || attributes.in);
    const itemName = attributes.item || 'item';
    const children = attributes.children;

    if (!Array.isArray(items) || !children) return null;

    return createElement(Fragment, {},
      items.map((item: any) => {
        const itemContext = { ...this.context, [itemName]: item };
        const engine = new TemplateEngine({
          context: itemContext,
          components: this.components,
          filters: this.filters
        });
        return engine.parseTemplate(children);
      }) as any
    );
  }

  /**
   * Evaluate a template expression
   */
  private evaluateExpression(expression: string): any {
    try {
      // Simple expression evaluation - in a real implementation,
      // you might want to use a more sophisticated parser
      const context = this.context;
      const filters = this.filters;

      // Handle filter syntax: value | filter1 | filter2
      const parts = expression.split('|').map(p => p.trim());
      let value = this.evaluateSimpleExpression(parts[0]);

      // Apply filters
      for (let i = 1; i < parts.length; i++) {
        const filterName = parts[i];
        if (filters[filterName]) {
          value = filters[filterName](value);
        }
      }

      return value;
    } catch (error) {
      console.error('Error evaluating template expression:', expression, error);
      return null;
    }
  }

  /**
   * Evaluate simple expressions (properties, basic operations)
   */
  private evaluateSimpleExpression(expression: string): any {
    const context = this.context;

    // Handle property access: user.name, items.length, etc.
    if (expression.includes('.')) {
      return expression.split('.').reduce((obj, key) => obj?.[key], context);
    }

    // Handle direct property access
    // Use Object.prototype.hasOwnProperty.call to avoid issues with Object.create(null)
    if (Object.prototype.hasOwnProperty.call(context, expression)) {
      return context[expression];
    }

    // Handle literals and basic operations
    if (expression === 'true') return true;
    if (expression === 'false') return false;
    if (expression === 'null') return null;
    if (expression === 'undefined') return undefined;

    // Try to parse as number
    if (/^\d+$/.test(expression)) {
      return parseInt(expression, 10);
    }

    // Handle string literals
    if (/^["'].*["']$/.test(expression)) {
      return expression.slice(1, -1);
    }

    return expression;
  }
}

/**
 * Template function for creating templates
 */
export function template(
  templateString: string,
  context?: TemplateContext,
  options?: Omit<TemplateOptions, 'context'>
): VNode | VNode[] {
  const engine = new TemplateEngine({ context, ...options });
  return engine.render(templateString);
}

/**
 * Common template filters
 */
export const defaultFilters = {
  uppercase: (value: string) => String(value).toUpperCase(),
  lowercase: (value: string) => String(value).toLowerCase(),
  capitalize: (value: string) => {
    const str = String(value);
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },
  length: (value: any[]) => value?.length || 0,
  join: (value: any[], separator = ', ') => value?.join(separator) || '',
  date: (value: string | Date, format = 'YYYY-MM-DD') => {
    const date = new Date(value);
    // Simple date formatting - in a real implementation you'd use a library like date-fns
    return date.toLocaleDateString();
  },
  number: (value: any, decimals = 0) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num.toFixed(decimals);
  }
};
