import React from 'react';
import PropTypes from 'prop-types';
import { mount, render } from 'enzyme';

import { Subject, merge } from 'rxjs';

import { map, first, startWith, scan } from 'rxjs/operators';

import { createContainer } from './createContainer';

function StaticView() {
  return <div id="root">Hello</div>;
}

function App({ plusOne, minusOne, totalCount }) {
  return (
    <div>
      <button onClick={minusOne} id="minus">
        -
      </button>
      [<span id="count">{totalCount}</span>]
      <button onClick={plusOne} id="plus">
        +
      </button>
    </div>
  );
}

App.propTypes = {
  plusOne: PropTypes.any.isRequired,
  minusOne: PropTypes.any.isRequired,
  totalCount: PropTypes.any.isRequired,
};

function createSampleContainer() {
  const plusOne$ = new Subject();
  const minusOne$ = new Subject();

  const totalCount$ = merge(
    plusOne$.pipe(map(() => +1)),
    minusOne$.pipe(map(() => -1))
  ).pipe(
    startWith(0),
    scan((acc, x) => acc + x, 0)
  );

  return createContainer(App, { totalCount$ }, { plusOne$, minusOne$ });
}

describe('createContainer', () => {
  it('renders static view', done => {
    createContainer(StaticView)
      .pipe(first())
      .subscribe(renderApp => {
        const wrapper = mount(renderApp());
        expect(wrapper.find('#root').text()).toBe('Hello');
        wrapper.unmount();
        done();
      });
  });

  it('works', done => {
    createSampleContainer()
      .pipe(first())
      .subscribe(renderApp => {
        const wrapper = mount(renderApp());
        expect(wrapper.find('#count').text()).toBe('0');
        setTimeout(() => {
          wrapper.find('#plus').simulate('click');

          expect(wrapper.find('#count').text()).toBe('1');
          wrapper.find('#plus').simulate('click');
          wrapper.find('#plus').simulate('click');

          expect(wrapper.find('#count').text()).toBe('3');
          wrapper.find('#minus').simulate('click');
          wrapper.find('#minus').simulate('click');

          expect(wrapper.find('#count').text()).toBe('1');
          wrapper.unmount();
          done();
        });
      });
  });
  it('ssr', done => {
    createSampleContainer()
      .pipe(first())
      .subscribe(renderApp => {
        const wrapper = render(renderApp());
        expect(wrapper.find('#count').text()).toBe('0');
        done();
      });
  });
});
