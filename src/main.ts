import './style.css';
import { runJSXExample, runTemplateExample, runMixedExample } from './demo';

// Initialize the framework examples
document.addEventListener('DOMContentLoaded', () => {
  const appElement = document.querySelector<HTMLDivElement>('#app');
  if (appElement) {
    appElement.innerHTML = `
      <div class="framework-demo">
        <h1>Marabutan Framework with JSX/TSX & Template Support</h1>
        <p>A modern JavaScript framework with MVI architecture, virtual DOM, mixins, and JSX/TSX support.</p>

        <div class="demo-tabs">
          <button id="jsx-tab" class="tab-button active">JSX Components</button>
          <button id="template-tab" class="tab-button">Template System</button>
          <button id="mixed-tab" class="tab-button">Mixed Example</button>
        </div>

        <div class="demo-content">
          <div id="jsx-demo" class="demo-panel active">
            <h2>JSX Component Demo</h2>
            <div id="jsx-root"></div>
          </div>
          <div id="template-demo" class="demo-panel">
            <h2>Template System Demo</h2>
            <div id="template-root"></div>
          </div>
          <div id="mixed-demo" class="demo-panel">
            <h2>Mixed JSX/Template Demo</h2>
            <div id="mixed-root"></div>
          </div>
        </div>
      </div>
    `;

    // Initialize demo tabs
    setupDemoTabs();

    // Run the JSX example by default
    runJSXExample();
  }
});

function setupDemoTabs() {
  const jsxTab = document.getElementById('jsx-tab')!;
  const templateTab = document.getElementById('template-tab')!;
  const mixedTab = document.getElementById('mixed-tab')!;

  jsxTab.addEventListener('click', () => {
    switchTab('jsx');
    runJSXExample();
  });

  templateTab.addEventListener('click', () => {
    switchTab('template');
    runTemplateExample();
  });

  mixedTab.addEventListener('click', () => {
    switchTab('mixed');
    runMixedExample();
  });
}

function switchTab(activeTab: string) {
  // Update tab buttons
  document.querySelectorAll('.tab-button').forEach(button => {
    button.classList.remove('active');
  });

  document.getElementById(`${activeTab}-tab`)!.classList.add('active');

  // Update demo panels
  document.querySelectorAll('.demo-panel').forEach(panel => {
    panel.classList.remove('active');
  });

  document.getElementById(`${activeTab}-demo`)!.classList.add('active');
}
