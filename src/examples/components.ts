import { createElement } from '../vdom/createElement';
import { createComponent } from '../components/core';
import { ComponentDefinition } from '../components/types';
import { counterMixin, loggingMixin, timerMixin, localStorageMixin } from './mixins';

/**
 * Counter component using MVI architecture and mixins
 */
export const CounterComponent = createComponent({
  displayName: 'Counter',
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

  // View function
  view: (state) => {
    return createElement('div', { className: 'counter' },
      createElement('h2', {}, 'Counter: ', state.displayValue),
      createElement('button', {
        onClick: () => ({ type: 'INCREMENT' })
      }, '+'),
      createElement('button', {
        onClick: () => ({ type: 'DECREMENT' })
      }, '-'),
      createElement('button', {
        onClick: () => ({ type: 'RESET' })
      }, 'Reset')
    );
  }
});

/**
 * Timer component using timer mixin
 */
export const TimerComponent = createComponent({
  displayName: 'Timer',
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

  view: (state) => {
    return createElement('div', { className: 'timer' },
      createElement('h2', {}, `Time: ${state.time}s`),
      createElement('button', {
        onClick: () => state.timer.intervalId ? { type: 'STOP_TIMER' } : { type: 'START_TIMER' }
      }, state.timer.intervalId ? 'Stop' : 'Start'),
      createElement('button', {
        onClick: () => ({ type: 'RESET_TIMER' })
      }, 'Reset')
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
 * Todo item component
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

export const TodoItemComponent = createComponent<TodoItemState, TodoItemProps>({
  displayName: 'TodoItem',
  initialState: { text: '', completed: false, id: '' },

  view: (state) => {
    return createElement('div', {
      className: `todo-item ${state.completed ? 'completed' : ''}`
    },
      createElement('input', {
        type: 'checkbox',
        checked: state.completed,
        onChange: () => ({ type: 'TOGGLE' })
      }),
      createElement('span', {}, state.text),
      createElement('button', {
        onClick: () => ({ type: 'DELETE' })
      }, 'Delete')
    );
  }
});

/**
 * Todo list component
 */
interface TodoListState {
  todos: TodoItemState[];
  newTodoText: string;
}

export const TodoListComponent = createComponent({
  displayName: 'TodoList',
  initialState: {
    todos: [
      { id: '1', text: 'Learn MVI architecture', completed: false },
      { id: '2', text: 'Build virtual DOM', completed: true },
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

  view: (state) => {
    return createElement('div', { className: 'todo-list' },
      createElement('h2', {}, 'Todo List'),
      createElement('div', { className: 'add-todo' },
        createElement('input', {
          type: 'text',
          value: state.newTodoText,
          placeholder: 'Enter new todo...',
          onInput: (e) => ({ type: 'UPDATE_NEW_TODO', text: e.target.value })
        }),
        createElement('button', {
          onClick: () => ({ type: 'ADD_TODO' })
        }, 'Add')
      ),
      createElement('ul', {},
        ...state.todos.map(todo =>
          createElement('li', { key: todo.id },
            createElement(TodoItemComponent, {
              todo,
              onToggle: (id) => ({ type: 'TOGGLE_TODO', id }),
              onDelete: (id) => ({ type: 'DELETE_TODO', id })
            })
          )
        )
      )
    );
  }
});

/**
 * Main app component that combines everything
 */
export const AppComponent = createComponent({
  displayName: 'App',
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

  view: (state) => {
    return createElement('div', { className: 'app' },
      createElement('nav', {},
        createElement('button', {
          className: state.currentView === 'counter' ? 'active' : '',
          onClick: () => ({ type: 'SWITCH_VIEW', view: 'counter' })
        }, 'Counter'),
        createElement('button', {
          className: state.currentView === 'timer' ? 'active' : '',
          onClick: () => ({ type: 'SWITCH_VIEW', view: 'timer' })
        }, 'Timer'),
        createElement('button', {
          className: state.currentView === 'todos' ? 'active' : '',
          onClick: () => ({ type: 'SWITCH_VIEW', view: 'todos' })
        }, 'Todos')
      ),
      createElement('main', {},
        state.currentView === 'counter' && createElement(CounterComponent),
        state.currentView === 'timer' && createElement(TimerComponent),
        state.currentView === 'todos' && createElement(TodoListComponent)
      )
    );
  }
});
