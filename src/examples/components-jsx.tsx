import { createElement, Fragment } from '../vdom/createElement';
import { createComponent } from '../components/core';
import { ComponentDefinition } from '../components/types';
import { counterMixin, loggingMixin, timerMixin, localStorageMixin } from './mixins';

/**
 * JSX Version of Counter Component
 * Demonstrates JSX syntax with Marabutan Framework
 */
export const CounterComponentJSX = createComponent({
  displayName: 'CounterJSX',
  initialState: { displayValue: 0 },

  // Use counter mixin for state management
  mixins: {
    counter: counterMixin,
    logger: loggingMixin
  },

  // Model function that delegates to mixins and updates display value
  model: (state, action) => {
    // First, let mixins handle their state updates
    let newState = state;

    // Handle counter mixin actions
    if (action.type === 'INCREMENT' || action.type === 'DECREMENT' || action.type === 'RESET') {
      // The counter mixin reducer should handle this
      // For now, manually update the counter state
      const counterState = state.counter;
      if (counterState && typeof counterState === 'object') {
        const updatedCounter = { ...counterState };
        switch (action.type) {
          case 'INCREMENT':
            updatedCounter.count = (updatedCounter.count || 0) + 1;
            break;
          case 'DECREMENT':
            updatedCounter.count = (updatedCounter.count || 0) - 1;
            break;
          case 'RESET':
            updatedCounter.count = 0;
            break;
        }
        newState = { ...state, counter: updatedCounter };
      }
    }

    // Update display value to match counter
    if (newState.counter && newState.counter.count !== undefined) {
      newState = { ...newState, displayValue: newState.counter.count };
    }

    return newState;
  },

  // JSX View function
  view: (state, dispatch) => {
    return (
      <div className="counter">
        <h2>Counter: {state.displayValue}</h2>
        <button onClick={() => dispatch && dispatch({ type: 'INCREMENT' })}>+</button>
        <button onClick={() => dispatch && dispatch({ type: 'DECREMENT' })}>-</button>
        <button onClick={() => dispatch && dispatch({ type: 'RESET' })}>Reset</button>
      </div>
    );
  }
});

/**
 * JSX Version of Timer Component
 */
export const TimerComponentJSX = createComponent({
  displayName: 'TimerJSX',
  initialState: { time: 0 },

  mixins: {
    timer: timerMixin,
    logger: loggingMixin
  },

  model: (state, action) => {
    switch (action.type) {
      case 'TICK':
        return { ...state, time: state.time + 1 };
      case 'RESET_TIMER':
        return { ...state, time: 0 };
      default:
        return state;
    }
  },

  view: (state, dispatch) => {
    return (
      <div className="timer">
        <h2>Time: {state.time}s</h2>
        <button
          onClick={() => dispatch && dispatch(state.timer.intervalId ? { type: 'STOP_TIMER' } : { type: 'START_TIMER' })}
        >
          {state.timer.intervalId ? 'Stop' : 'Start'}
        </button>
        <button onClick={() => dispatch && dispatch({ type: 'RESET_TIMER' })}>
          Reset
        </button>
      </div>
    );
  },

  // Handle timer actions in intent
  intent: (dispatch) => {
    // Timer actions are handled by the timer mixin methods
    return {
      startTimer: () => dispatch({ type: 'START_TIMER' }),
      stopTimer: () => dispatch({ type: 'STOP_TIMER' })
    };
  }
});

/**
 * JSX Version of Todo Item Component
 */
interface TodoItemState {
  text: string;
  completed: boolean;
  id: string;
}

interface TodoItemProps {
  todo: TodoItemState;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TodoItemComponentJSX = createComponent<TodoItemState, TodoItemProps>({
  displayName: 'TodoItemJSX',
  initialState: { text: '', completed: false, id: '' },

  view: (state, dispatch) => {
    return (
      <div className={`todo-item ${state.completed ? 'completed' : ''}`}>
        <input
          type="checkbox"
          checked={state.completed}
          onChange={() => dispatch && dispatch({ type: 'TOGGLE' })}
        />
        <span>{state.text}</span>
        <button onClick={() => dispatch && dispatch({ type: 'DELETE' })}>
          Delete
        </button>
      </div>
    );
  }
});

/**
 * JSX Version of Todo List Component
 */
interface TodoListState {
  todos: TodoItemState[];
  newTodoText: string;
}

export const TodoListComponentJSX = createComponent({
  displayName: 'TodoListJSX',
  initialState: {
    todos: [
      { id: '1', text: 'Learn JSX with Marabutan', completed: false },
      { id: '2', text: 'Build template system', completed: true },
      { id: '3', text: 'Implement mixins system', completed: true }
    ],
    newTodoText: ''
  },

  mixins: {
    storage: localStorageMixin
  },

  model: (state, action) => {
    switch (action.type) {
      case 'ADD_TODO':
        if (state.newTodoText.trim()) {
          const newTodo: TodoItemState = {
            id: Date.now().toString(),
            text: state.newTodoText.trim(),
            completed: false
          };
          return {
            ...state,
            todos: [...state.todos, newTodo],
            newTodoText: ''
          };
        }
        return state;

      case 'TOGGLE_TODO':
        return {
          ...state,
          todos: state.todos.map(todo =>
            todo.id === action.id
              ? { ...todo, completed: !todo.completed }
              : todo
          )
        };

      case 'DELETE_TODO':
        return {
          ...state,
          todos: state.todos.filter(todo => todo.id !== action.id)
        };

      case 'UPDATE_NEW_TODO':
        return {
          ...state,
          newTodoText: action.text
        };

      default:
        return state;
    }
  },

  view: (state, dispatch) => {
    return (
      <div className="todo-list">
        <h2>Todo List (JSX Version)</h2>
        <div className="add-todo">
          <input
            type="text"
            value={state.newTodoText}
            placeholder="Enter new todo..."
            onInput={(e: any) => dispatch && dispatch({ type: 'UPDATE_NEW_TODO', text: e.target.value })}
          />
          <button onClick={() => dispatch && dispatch({ type: 'ADD_TODO' })}>
            Add
          </button>
        </div>
        <ul>
          {state.todos.map(todo => (
            <li key={todo.id}>
              <TodoItemComponentJSX
                todo={todo}
                onToggle={(id: string) => dispatch && dispatch({ type: 'TOGGLE_TODO', id })}
                onDelete={(id: string) => dispatch && dispatch({ type: 'DELETE_TODO', id })}
              />
            </li>
          ))}
        </ul>
      </div>
    );
  }
});

/**
 * JSX Version of Main App Component
 */
export const AppComponentJSX = createComponent({
  displayName: 'AppJSX',
  initialState: {
    currentView: 'counter' as 'counter' | 'timer' | 'todos'
  },

  mixins: {
    logger: loggingMixin
  },

  model: (state, action) => {
    switch (action.type) {
      case 'SWITCH_VIEW':
        return { ...state, currentView: action.view };
      default:
        return state;
    }
  },

  view: (state, dispatch) => {
    return (
      <div className="app">
        <nav>
          <button
            className={state.currentView === 'counter' ? 'active' : ''}
            onClick={() => dispatch && dispatch({ type: 'SWITCH_VIEW', view: 'counter' })}
          >
            Counter
          </button>
          <button
            className={state.currentView === 'timer' ? 'active' : ''}
            onClick={() => dispatch && dispatch({ type: 'SWITCH_VIEW', view: 'timer' })}
          >
            Timer
          </button>
          <button
            className={state.currentView === 'todos' ? 'active' : ''}
            onClick={() => dispatch && dispatch({ type: 'SWITCH_VIEW', view: 'todos' })}
          >
            Todos
          </button>
        </nav>
        <main>
          {state.currentView === 'counter' && <CounterComponentJSX />}
          {state.currentView === 'timer' && <TimerComponentJSX />}
          {state.currentView === 'todos' && <TodoListComponentJSX />}
        </main>
      </div>
    );
  }
});

/**
 * JSX Example with Fragments and mixed content
 */
export const FragmentExample = createComponent({
  displayName: 'FragmentExample',
  initialState: { items: ['Apple', 'Banana', 'Cherry'] },

  view: (state, dispatch) => {
    return (
      <Fragment>
        <h3>Fragment Example</h3>
        <ul>
          {state.items.map((item: string, index: number) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <p>Total items: {state.items.length}</p>
      </Fragment>
    );
  }
});
