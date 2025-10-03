/**
 * JSX HTML Elements Comprehensive Tests
 * 测试所有 HTML 元素和特定属性
 */

import { describe, it, expect } from 'vitest';

describe('JSX HTML Elements', () => {
  describe('Text Content Elements', () => {
    it('should handle div element', () => {
      const vnode = <div className="container">Content</div>;

      expect(vnode.type).toBe('div');
      expect(vnode.props.className).toBe('container');
    });

    it('should handle span element', () => {
      const vnode = <span className="text">Text</span>;

      expect(vnode.type).toBe('span');
    });

    it('should handle p element', () => {
      const vnode = <p>Paragraph content</p>;

      expect(vnode.type).toBe('p');
    });

    it('should handle pre element', () => {
      const vnode = <pre>Preformatted text</pre>;

      expect(vnode.type).toBe('pre');
    });

    it('should handle code element', () => {
      const vnode = <code>const x = 42;</code>;

      expect(vnode.type).toBe('code');
    });

    it('should handle blockquote element', () => {
      const vnode = <blockquote cite="source.com">Quote</blockquote>;

      expect(vnode.type).toBe('blockquote');
      expect(vnode.props.cite).toBe('source.com');
    });
  });

  describe('Heading Elements', () => {
    it('should handle h1 element', () => {
      const vnode = <h1>Heading 1</h1>;

      expect(vnode.type).toBe('h1');
    });

    it('should handle h2 element', () => {
      const vnode = <h2>Heading 2</h2>;

      expect(vnode.type).toBe('h2');
    });

    it('should handle h3 element', () => {
      const vnode = <h3>Heading 3</h3>;

      expect(vnode.type).toBe('h3');
    });

    it('should handle h4 element', () => {
      const vnode = <h4>Heading 4</h4>;

      expect(vnode.type).toBe('h4');
    });

    it('should handle h5 element', () => {
      const vnode = <h5>Heading 5</h5>;

      expect(vnode.type).toBe('h5');
    });

    it('should handle h6 element', () => {
      const vnode = <h6>Heading 6</h6>;

      expect(vnode.type).toBe('h6');
    });
  });

  describe('List Elements', () => {
    it('should handle ul element', () => {
      const vnode = (
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      );

      expect(vnode.type).toBe('ul');
      expect(vnode.children.length).toBe(2);
    });

    it('should handle ol element', () => {
      const vnode = (
        <ol start={5}>
          <li>Item 1</li>
          <li>Item 2</li>
        </ol>
      );

      expect(vnode.type).toBe('ol');
      expect(vnode.props.start).toBe(5);
    });

    it('should handle li element', () => {
      const vnode = <li value={3}>List item</li>;

      expect(vnode.type).toBe('li');
    });
  });

  describe('Form Elements', () => {
    it('should handle form element', () => {
      const vnode = (
        <form action="/submit" method="post" enctype="multipart/form-data">
          Form content
        </form>
      );

      expect(vnode.type).toBe('form');
      expect(vnode.props.action).toBe('/submit');
      expect(vnode.props.method).toBe('post');
      expect(vnode.props.enctype).toBe('multipart/form-data');
    });

    it('should handle input element with various types', () => {
      const text = <input type="text" placeholder="Enter text" />;
      const email = <input type="email" required />;
      const password = <input type="password" />;
      const number = <input type="number" min={0} max={100} step={1} />;
      const checkbox = <input type="checkbox" checked />;
      const radio = <input type="radio" name="group" />;
      const file = <input type="file" accept=".pdf,.doc" />;
      const date = <input type="date" />;
      const time = <input type="time" />;
      const color = <input type="color" />;
      const range = <input type="range" min={0} max={100} />;

      expect(text.type).toBe('input');
      expect(text.props.type).toBe('text');
      expect(email.props.required).toBe(true);
      expect(number.props.min).toBe(0);
      expect(checkbox.props.checked).toBe(true);
    });

    it('should handle textarea element', () => {
      const vnode = (
        <textarea
          rows={5}
          cols={50}
          placeholder="Enter text"
          disabled={false}
        >
          Default value
        </textarea>
      );

      expect(vnode.type).toBe('textarea');
      expect(vnode.props.rows).toBe(5);
      expect(vnode.props.cols).toBe(50);
    });

    it('should handle select element', () => {
      const vnode = (
        <select value="option2" multiple={false}>
          <option value="option1">Option 1</option>
          <option value="option2">Option 2</option>
          <option value="option3" disabled>Option 3</option>
        </select>
      );

      expect(vnode.type).toBe('select');
      expect(vnode.props.value).toBe('option2');
      expect(vnode.children.length).toBe(3);
    });

    it('should handle option element', () => {
      const vnode = <option value="test" selected>Test Option</option>;

      expect(vnode.type).toBe('option');
      expect(vnode.props.value).toBe('test');
      expect(vnode.props.selected).toBe(true);
    });

    it('should handle button element', () => {
      const vnode = (
        <button type="submit" disabled={false} name="submitBtn">
          Submit
        </button>
      );

      expect(vnode.type).toBe('button');
      expect(vnode.props.type).toBe('submit');
    });

    it('should handle label element', () => {
      const vnode = <label htmlFor="input-id">Label Text</label>;

      expect(vnode.type).toBe('label');
      expect(vnode.props.htmlFor).toBe('input-id');
    });
  });

  describe('Table Elements', () => {
    it('should handle table element', () => {
      const vnode = (
        <table>
          <thead>
            <tr>
              <th>Header</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Data</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td>Footer</td>
            </tr>
          </tfoot>
        </table>
      );

      expect(vnode.type).toBe('table');
      expect(vnode.children.length).toBe(3);
    });

    it('should handle thead element', () => {
      const vnode = (
        <thead>
          <tr>
            <th>Column</th>
          </tr>
        </thead>
      );

      expect(vnode.type).toBe('thead');
    });

    it('should handle tbody element', () => {
      const vnode = (
        <tbody>
          <tr>
            <td>Cell</td>
          </tr>
        </tbody>
      );

      expect(vnode.type).toBe('tbody');
    });

    it('should handle tfoot element', () => {
      const vnode = (
        <tfoot>
          <tr>
            <td>Footer</td>
          </tr>
        </tfoot>
      );

      expect(vnode.type).toBe('tfoot');
    });

    it('should handle tr element', () => {
      const vnode = (
        <tr>
          <td>Cell 1</td>
          <td>Cell 2</td>
        </tr>
      );

      expect(vnode.type).toBe('tr');
      expect(vnode.children.length).toBe(2);
    });

    it('should handle th element', () => {
      const vnode = <th scope="col">Header</th>;

      expect(vnode.type).toBe('th');
    });

    it('should handle td element', () => {
      const vnode = <td colSpan={2}>Cell</td>;

      expect(vnode.type).toBe('td');
    });
  });

  describe('Semantic Elements', () => {
    it('should handle header element', () => {
      const vnode = (
        <header>
          <h1>Site Header</h1>
        </header>
      );

      expect(vnode.type).toBe('header');
    });

    it('should handle footer element', () => {
      const vnode = (
        <footer>
          <p>Copyright 2024</p>
        </footer>
      );

      expect(vnode.type).toBe('footer');
    });

    it('should handle nav element', () => {
      const vnode = (
        <nav>
          <a href="/">Home</a>
          <a href="/about">About</a>
        </nav>
      );

      expect(vnode.type).toBe('nav');
    });

    it('should handle main element', () => {
      const vnode = (
        <main>
          <article>Main content</article>
        </main>
      );

      expect(vnode.type).toBe('main');
    });

    it('should handle section element', () => {
      const vnode = (
        <section>
          <h2>Section Title</h2>
          <p>Section content</p>
        </section>
      );

      expect(vnode.type).toBe('section');
    });

    it('should handle article element', () => {
      const vnode = (
        <article>
          <h2>Article Title</h2>
          <p>Article content</p>
        </article>
      );

      expect(vnode.type).toBe('article');
    });

    it('should handle aside element', () => {
      const vnode = (
        <aside>
          <p>Sidebar content</p>
        </aside>
      );

      expect(vnode.type).toBe('aside');
    });
  });

  describe('Link and Media Elements', () => {
    it('should handle a element', () => {
      const vnode = (
        <a href="https://example.com" target="_blank" rel="noopener noreferrer">
          Link
        </a>
      );

      expect(vnode.type).toBe('a');
      expect(vnode.props.href).toBe('https://example.com');
      expect(vnode.props.target).toBe('_blank');
      expect(vnode.props.rel).toBe('noopener noreferrer');
    });

    it('should handle a element with download', () => {
      const vnode = <a href="/file.pdf" download="document.pdf">Download</a>;

      expect(vnode.props.download).toBe('document.pdf');
    });

    it('should handle img element', () => {
      const vnode = (
        <img
          src="/image.jpg"
          alt="Description"
          width={300}
          height={200}
          loading="lazy"
        />
      );

      expect(vnode.type).toBe('img');
      expect(vnode.props.src).toBe('/image.jpg');
      expect(vnode.props.alt).toBe('Description');
      expect(vnode.props.width).toBe(300);
      expect(vnode.props.loading).toBe('lazy');
    });
  });

  describe('Text Formatting Elements', () => {
    it('should handle strong element', () => {
      const vnode = <strong>Bold text</strong>;

      expect(vnode.type).toBe('strong');
    });

    it('should handle em element', () => {
      const vnode = <em>Italic text</em>;

      expect(vnode.type).toBe('em');
    });

    it('should handle br element', () => {
      const vnode = <br />;

      expect(vnode.type).toBe('br');
      expect(vnode.children.length).toBe(0);
    });

    it('should handle hr element', () => {
      const vnode = <hr />;

      expect(vnode.type).toBe('hr');
      expect(vnode.children.length).toBe(0);
    });
  });

  describe('Complex HTML Structures', () => {
    it('should handle complete page structure', () => {
      const vnode = (
        <div>
          <header>
            <nav>
              <a href="/">Home</a>
              <a href="/about">About</a>
            </nav>
          </header>
          <main>
            <article>
              <h1>Title</h1>
              <p>Content</p>
            </article>
            <aside>
              <h2>Sidebar</h2>
            </aside>
          </main>
          <footer>
            <p>Footer</p>
          </footer>
        </div>
      );

      expect(vnode.type).toBe('div');
      expect(vnode.children.length).toBe(3);
    });

    it('should handle complex form', () => {
      const vnode = (
        <form>
          <div>
            <label htmlFor="name">Name:</label>
            <input type="text" id="name" required />
          </div>
          <div>
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" required />
          </div>
          <div>
            <label htmlFor="message">Message:</label>
            <textarea id="message" rows={5} />
          </div>
          <button type="submit">Submit</button>
        </form>
      );

      expect(vnode.type).toBe('form');
      expect(vnode.children.length).toBe(4);
    });

    it('should handle complex table', () => {
      const vnode = (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>John</td>
              <td>30</td>
              <td>john@example.com</td>
            </tr>
            <tr>
              <td>Jane</td>
              <td>25</td>
              <td>jane@example.com</td>
            </tr>
          </tbody>
        </table>
      );

      expect(vnode.type).toBe('table');
      expect(vnode.children.length).toBe(2);
    });

    it('should handle nested lists', () => {
      const vnode = (
        <ul>
          <li>
            Item 1
            <ul>
              <li>Subitem 1.1</li>
              <li>Subitem 1.2</li>
            </ul>
          </li>
          <li>
            Item 2
            <ol>
              <li>Subitem 2.1</li>
              <li>Subitem 2.2</li>
            </ol>
          </li>
        </ul>
      );

      expect(vnode.type).toBe('ul');
      expect(vnode.children.length).toBe(2);
    });
  });

  describe('Data Attributes', () => {
    it('should handle single data attribute', () => {
      const vnode = <div data-testid="my-component">Content</div>;

      expect(vnode.props['data-testid']).toBe('my-component');
    });

    it('should handle multiple data attributes', () => {
      const vnode = (
        <div
          data-id="123"
          data-name="test"
          data-active="true"
        >
          Content
        </div>
      );

      expect(vnode.props['data-id']).toBe('123');
      expect(vnode.props['data-name']).toBe('test');
      expect(vnode.props['data-active']).toBe('true');
    });

    it('should handle data attributes with numeric values', () => {
      const vnode = <div data-count={42} data-index={0}>Content</div>;

      expect(vnode.props['data-count']).toBe(42);
      expect(vnode.props['data-index']).toBe(0);
    });
  });

  describe('ARIA Attributes', () => {
    it('should handle aria-label', () => {
      const vnode = <button aria-label="Close">×</button>;

      expect(vnode.props['aria-label']).toBe('Close');
    });

    it('should handle aria-hidden', () => {
      const vnode = <div aria-hidden="true">Hidden from screen readers</div>;

      expect(vnode.props['aria-hidden']).toBe('true');
    });

    it('should handle aria-pressed', () => {
      const vnode = <button aria-pressed="false">Toggle</button>;

      expect(vnode.props['aria-pressed']).toBe('false');
    });

    it('should handle multiple aria attributes', () => {
      const vnode = (
        <button
          aria-label="Menu"
          aria-expanded="false"
          aria-controls="menu-list"
        >
          Menu
        </button>
      );

      expect(vnode.props['aria-label']).toBe('Menu');
      expect(vnode.props['aria-expanded']).toBe('false');
      expect(vnode.props['aria-controls']).toBe('menu-list');
    });

    it('should handle aria-describedby', () => {
      const vnode = (
        <div>
          <input type="text" aria-describedby="hint" />
          <span id="hint">Enter your name</span>
        </div>
      );

      expect(vnode.children[0].props['aria-describedby']).toBe('hint');
    });
  });

  describe('Event Handlers on Elements', () => {
    it('should handle onClick on button', () => {
      const handler = () => {};
      const vnode = <button onClick={handler}>Click</button>;

      expect(vnode.props.onClick).toBe(handler);
    });

    it('should handle onInput on input', () => {
      const handler = () => {};
      const vnode = <input type="text" onInput={handler} />;

      expect(vnode.props.onInput).toBe(handler);
    });

    it('should handle onChange on select', () => {
      const handler = () => {};
      const vnode = (
        <select onChange={handler}>
          <option>Option 1</option>
        </select>
      );

      expect(vnode.props.onChange).toBe(handler);
    });

    it('should handle onSubmit on form', () => {
      const handler = () => {};
      const vnode = <form onSubmit={handler}>Form</form>;

      expect(vnode.props.onSubmit).toBe(handler);
    });

    it('should handle mouse events', () => {
      const clickHandler = () => {};
      const enterHandler = () => {};
      const leaveHandler = () => {};

      const vnode = (
        <div
          onClick={clickHandler}
          onMouseEnter={enterHandler}
          onMouseLeave={leaveHandler}
        >
          Interactive
        </div>
      );

      expect(vnode.props.onClick).toBe(clickHandler);
      expect(vnode.props.onMouseEnter).toBe(enterHandler);
      expect(vnode.props.onMouseLeave).toBe(leaveHandler);
    });

    it('should handle keyboard events', () => {
      const downHandler = () => {};
      const upHandler = () => {};
      const pressHandler = () => {};

      const vnode = (
        <input
          type="text"
          onKeyDown={downHandler}
          onKeyUp={upHandler}
          onKeyPress={pressHandler}
        />
      );

      expect(vnode.props.onKeyDown).toBe(downHandler);
      expect(vnode.props.onKeyUp).toBe(upHandler);
      expect(vnode.props.onKeyPress).toBe(pressHandler);
    });
  });
});

