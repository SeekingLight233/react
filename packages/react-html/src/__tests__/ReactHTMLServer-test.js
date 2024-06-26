/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

global.TextDecoder = require('util').TextDecoder;
global.TextEncoder = require('util').TextEncoder;

let React;
let ReactHTML;

describe('ReactHTML', () => {
  beforeEach(() => {
    jest.resetModules();
    // We run in the react-server condition.
    jest.mock('react', () => require('react/react.react-server'));
    jest.mock('react-html', () =>
      require('react-html/react-html.react-server'),
    );

    React = require('react');
    ReactHTML = require('react-html');
  });

  it('should be able to render a simple component', async () => {
    function Component() {
      // We can't use JSX because that's client-JSX in our tests.
      return React.createElement('div', null, 'hello world');
    }

    const html = await ReactHTML.renderToMarkup(React.createElement(Component));
    expect(html).toBe('<div>hello world</div>');
  });

  it('supports the useId Hook', async () => {
    function Component() {
      const firstNameId = React.useId();
      const lastNameId = React.useId();
      // We can't use JSX because that's client-JSX in our tests.
      return React.createElement(
        'div',
        null,
        React.createElement(
          'h2',
          {
            id: firstNameId,
          },
          'First',
        ),
        React.createElement(
          'p',
          {
            'aria-labelledby': firstNameId,
          },
          'Sebastian',
        ),
        React.createElement(
          'h2',
          {
            id: lastNameId,
          },
          'Last',
        ),
        React.createElement(
          'p',
          {
            'aria-labelledby': lastNameId,
          },
          'Smith',
        ),
      );
    }

    const html = await ReactHTML.renderToMarkup(React.createElement(Component));
    const container = document.createElement('div');
    container.innerHTML = html;

    expect(container.getElementsByTagName('h2')[0].id).toBe(
      container.getElementsByTagName('p')[0].getAttribute('aria-labelledby'),
    );
    expect(container.getElementsByTagName('h2')[1].id).toBe(
      container.getElementsByTagName('p')[1].getAttribute('aria-labelledby'),
    );

    // It's not the same id between them.
    expect(container.getElementsByTagName('h2')[0].id).not.toBe(
      container.getElementsByTagName('p')[1].getAttribute('aria-labelledby'),
    );
  });

  // @gate enableCache
  it('supports cache', async () => {
    let counter = 0;
    const getCount = React.cache(() => {
      return counter++;
    });
    function Component() {
      const a = getCount();
      const b = getCount();
      return React.createElement('div', null, a, b);
    }

    const html = await ReactHTML.renderToMarkup(React.createElement(Component));
    expect(html).toBe('<div>00</div>');
  });
});
