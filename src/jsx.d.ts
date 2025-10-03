/**
 * JSX Type Definitions for Marabutan Framework
 * Provides TypeScript JSX support for the custom JSX runtime
 */

import type { VNode } from './vdom/types';
import type { ContextValue, ContextProviderProps, ContextConsumerProps } from './context';

/**
 * Function Component type
 * A function that accepts props and returns a VNode
 */
export type FunctionComponent<P = {}> = (props: P) => VNode | null;

/**
 * Component type - can be a function or a class
 */
export type ComponentType<P = {}> = FunctionComponent<P>;

declare global {
  namespace JSX {
    /**
     * Fragment component for grouping children
     */
    interface Fragment {
      children?: any;
      key?: string | number;
    }

  /**
   * HTML attribute types for common elements
   */
  interface HTMLAttributes {
      // Standard HTML attributes
      className?: string;
      id?: string;
      style?: Partial<CSSStyleDeclaration> | string;
      title?: string;
      
      // Event handlers
      onClick?: (event: MouseEvent) => void;
      onInput?: (event: InputEvent) => void;
      onChange?: (event: Event) => void;
      onSubmit?: (event: SubmitEvent) => void;
      onFocus?: (event: FocusEvent) => void;
      onBlur?: (event: FocusEvent) => void;
      onKeyDown?: (event: KeyboardEvent) => void;
      onKeyUp?: (event: KeyboardEvent) => void;
      onKeyPress?: (event: KeyboardEvent) => void;
      onMouseDown?: (event: MouseEvent) => void;
      onMouseUp?: (event: MouseEvent) => void;
      onMouseEnter?: (event: MouseEvent) => void;
      onMouseLeave?: (event: MouseEvent) => void;
      onMouseMove?: (event: MouseEvent) => void;
      
      // Data attributes
      [key: `data-${string}`]: string | number | boolean;
      
      // Aria attributes
      [key: `aria-${string}`]: string | number | boolean;
    }

    interface InputAttributes extends HTMLAttributes {
      type?: 'text' | 'number' | 'email' | 'password' | 'checkbox' | 'radio' | 'submit' | 'button' | 'file' | 'hidden' | 'date' | 'time' | 'datetime-local' | 'month' | 'week' | 'tel' | 'url' | 'search' | 'color' | 'range';
      value?: string | number;
      checked?: boolean;
      placeholder?: string;
      disabled?: boolean;
      required?: boolean;
      readonly?: boolean;
      name?: string;
      min?: number | string;
      max?: number | string;
      step?: number | string;
      pattern?: string;
      autocomplete?: string;
    }

    interface ButtonAttributes extends HTMLAttributes {
      type?: 'button' | 'submit' | 'reset';
      disabled?: boolean;
      name?: string;
      value?: string;
    }

    interface LinkAttributes extends HTMLAttributes {
      href?: string;
      target?: '_blank' | '_self' | '_parent' | '_top';
      rel?: string;
      download?: string;
    }

    interface ImageAttributes extends HTMLAttributes {
      src?: string;
      alt?: string;
      width?: number | string;
      height?: number | string;
      loading?: 'lazy' | 'eager';
    }

    interface FormAttributes extends HTMLAttributes {
      action?: string;
      method?: 'get' | 'post';
      enctype?: string;
      target?: string;
    }

    interface TextAreaAttributes extends HTMLAttributes {
      value?: string;
      placeholder?: string;
      disabled?: boolean;
      required?: boolean;
      readonly?: boolean;
      rows?: number;
      cols?: number;
      name?: string;
    }

    interface SelectAttributes extends HTMLAttributes {
      value?: string;
      disabled?: boolean;
      required?: boolean;
      multiple?: boolean;
      name?: string;
    }

    interface OptionAttributes extends HTMLAttributes {
      value?: string;
      selected?: boolean;
      disabled?: boolean;
    }

    interface LabelAttributes extends HTMLAttributes {
      htmlFor?: string;
    }

    /**
     * Intrinsic elements mapping HTML tags to their attribute types
     */
    interface IntrinsicElements {
      // Text content
      div: HTMLAttributes;
      span: HTMLAttributes;
      p: HTMLAttributes;
      
      // Headings
      h1: HTMLAttributes;
      h2: HTMLAttributes;
      h3: HTMLAttributes;
      h4: HTMLAttributes;
      h5: HTMLAttributes;
      h6: HTMLAttributes;
      
      // Lists
      ul: HTMLAttributes;
      ol: HTMLAttributes;
      li: HTMLAttributes;
      
      // Forms
      form: FormAttributes;
      input: InputAttributes;
      button: ButtonAttributes;
      textarea: TextAreaAttributes;
      select: SelectAttributes;
      option: OptionAttributes;
      label: LabelAttributes;
      
      // Links and media
      a: LinkAttributes;
      img: ImageAttributes;
      
      // Tables
      table: HTMLAttributes;
      thead: HTMLAttributes;
      tbody: HTMLAttributes;
      tfoot: HTMLAttributes;
      tr: HTMLAttributes;
      th: HTMLAttributes;
      td: HTMLAttributes;
      
      // Sections
      header: HTMLAttributes;
      footer: HTMLAttributes;
      nav: HTMLAttributes;
      main: HTMLAttributes;
      section: HTMLAttributes;
      article: HTMLAttributes;
      aside: HTMLAttributes;
      
      // Other common elements
      br: HTMLAttributes;
      hr: HTMLAttributes;
      strong: HTMLAttributes;
      em: HTMLAttributes;
      code: HTMLAttributes;
      pre: HTMLAttributes;
      blockquote: HTMLAttributes;
      
      // Allow any other HTML element with basic attributes
      [elemName: string]: HTMLAttributes;
    }

    interface Element extends VNode {}

    interface ElementClass {
      render(): VNode;
    }

    interface ElementAttributesProperty {
      props: {};
    }

    interface ElementChildrenAttribute {
      children: {};
    }

    // React compatibility types
    type ReactElement = VNode;
    type ReactNode = VNode | string | number | boolean | null | undefined | ReactNode[];
    type ReactChild = VNode | string | number;
    type ReactFragment = ReactNode[];
    
    /**
     * Component props with children
     */
    interface ComponentProps {
      children?: ReactNode;
      key?: string | number;
    }
    
    /**
     * SVG attributes
     */
    interface SVGAttributes extends HTMLAttributes {
      viewBox?: string;
      xmlns?: string;
      fill?: string;
      stroke?: string;
      strokeWidth?: string | number;
      d?: string;
      cx?: string | number;
      cy?: string | number;
      r?: string | number;
      width?: string | number;
      height?: string | number;
      x?: string | number;
      y?: string | number;
      transform?: string;
    }
    
    /**
     * SVG elements
     */
    interface IntrinsicElementsSVG {
      svg: SVGAttributes;
      path: SVGAttributes;
      circle: SVGAttributes;
      rect: SVGAttributes;
      line: SVGAttributes;
      polygon: SVGAttributes;
      polyline: SVGAttributes;
      g: SVGAttributes;
      defs: SVGAttributes;
      text: SVGAttributes;
      tspan: SVGAttributes;
    }
  }

  // Merge SVG elements into IntrinsicElements
  interface IntrinsicElements extends IntrinsicElementsSVG {}
}
