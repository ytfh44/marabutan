// Framework examples and demonstrations
export * from './mixins';
export * from './components';

// Context API examples
export * from './context-examples';
export * from './context-mvi-integration';

// Example usage
import { run } from '../mvi/core';
import { AppComponent } from './components';
import {
  createMultiContextApp,
  ThemeProvider,
  AuthProvider,
  CounterProvider,
  Dashboard
} from './context-examples';
import {
  runSimpleMVIContext,
  runTodoMVIApp
} from './context-mvi-integration';

/**
 * Example of how to use the framework
 */
export function runExample() {
  // Create and run the main app component
  const app = AppComponent();

  // For this example, we'll just log that the component was created
  console.log('Framework example initialized');
  console.log('Components available:', app);

  return app;
}

/**
 * Simple MVI example without components
 */
export function simpleMVIExample() {
  const app = {
    initialState: { count: 0 },

    intent: (dispatch) => ({
      increment: () => dispatch({ type: 'INCREMENT' }),
      decrement: () => dispatch({ type: 'DECREMENT' })
    }),

    model: (state, action) => {
      switch (action.type) {
        case 'INCREMENT':
          return { ...state, count: state.count + 1 };
        case 'DECREMENT':
          return { ...state, count: state.count - 1 };
        default:
          return state;
      }
    },

    view: (state) => ({
      type: 'div',
      props: { className: 'simple-counter' },
      children: [
        { type: 'h1', props: {}, children: [`Count: ${state.count}`] },
        {
          type: 'button',
          props: { onClick: () => ({ type: 'INCREMENT' }) },
          children: ['+']
        },
        {
          type: 'button',
          props: { onClick: () => ({ type: 'DECREMENT' }) },
          children: ['-']
        }
      ]
    }),

    rootElement: '#app'
  };

  return run(app);
}

// ============================================================================
// Context API 示例运行函数
// ============================================================================

/**
 * 运行多 Context 集成示例
 * 展示 Theme、Auth 和 Counter Context 的嵌套使用
 */
export function runMultiContextExample() {
  console.log('Running Multi-Context Example...');
  const app = createMultiContextApp();
  
  console.log('Multi-Context app created with:');
  console.log('- ThemeProvider:', app.theme);
  console.log('- AuthProvider:', app.auth);
  console.log('- CounterProvider:', app.counter);
  console.log('- Dashboard:', app.dashboard);
  
  return app;
}

/**
 * 运行简单的 Context + MVI 示例
 * 展示 Context 在 MVI 架构中的基本使用
 */
export function runContextMVIExample() {
  console.log('Running Context + MVI Example...');
  return runSimpleMVIContext();
}

/**
 * 运行 Todo MVI 应用示例
 * 展示 Context 与 MVI 的完整集成
 */
export function runTodoExample() {
  console.log('Running Todo MVI App Example...');
  return runTodoMVIApp();
}

/**
 * 运行 Theme Context 示例
 * 创建一个简单的主题切换应用
 */
export function runThemeExample() {
  console.log('Running Theme Context Example...');
  
  const themeProvider = ThemeProvider();
  const dashboard = Dashboard();
  
  console.log('Theme example initialized');
  console.log('Current theme:', themeProvider.state.theme);
  
  return {
    provider: themeProvider,
    dashboard
  };
}

/**
 * 运行 Auth Context 示例
 * 创建一个认证管理应用
 */
export function runAuthExample() {
  console.log('Running Auth Context Example...');
  
  const authProvider = AuthProvider();
  
  console.log('Auth example initialized');
  console.log('User authenticated:', authProvider.state.user !== null);
  
  return authProvider;
}

/**
 * 运行 Counter Context 示例
 * 创建一个全局计数器应用（集成 Mixins）
 */
export function runCounterExample() {
  console.log('Running Counter Context Example...');
  
  const counterProvider = CounterProvider();
  
  console.log('Counter example initialized');
  console.log('Current count:', counterProvider.state.displayValue);
  
  return counterProvider;
}

/**
 * 显示所有可用的示例
 */
export function listExamples() {
  console.log('Available Examples:');
  console.log('');
  console.log('Basic Examples:');
  console.log('  - runExample()           : Main framework example');
  console.log('  - simpleMVIExample()     : Simple MVI counter');
  console.log('');
  console.log('Context API Examples:');
  console.log('  - runMultiContextExample() : Multi-context integration');
  console.log('  - runContextMVIExample()   : Context + MVI integration');
  console.log('  - runTodoExample()         : Todo app with Context + MVI');
  console.log('  - runThemeExample()        : Theme switching');
  console.log('  - runAuthExample()         : Authentication management');
  console.log('  - runCounterExample()      : Global counter (Context + Mixins)');
  console.log('');
  console.log('Run any of these functions to see the example in action!');
}
