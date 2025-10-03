// Main exports for Marabutan Framework
export * from './vdom/types';
export * from './vdom/vnode';
export * from './vdom/diff';
export * from './vdom/patch';
export { createElement } from './vdom/createElement';
export * from './mvi';
export * from './components';
export * from './mixins';

// JSX and Template Support
export * from './jsx-runtime';
export * from './template';

// Context API
export {
  createContext,
  useContextInComponent,
  contextRegistry,
  ProviderSymbol,
  ConsumerSymbol,
  type Context,
  type ContextId,
  type ProviderProps,
  type ConsumerProps,
  type ContextSubscriber,
  type ContextValue
} from './context';
