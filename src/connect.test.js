import React from 'react';
import PropTypes from 'prop-types';

import { mount, render } from 'enzyme';

import { Subject, merge } from 'rxjs';
import { map, startWith, scan, switchMap } from 'rxjs/operators';

import { connect, combineProps } from './index';

function App({ onMinus, onPlus, totalCount, title }) {
  return (
    <div>
      <h1 id="title">{title}</h1>
      <button onClick={onMinus} id="minus">
        -
      </button>
      [<span id="count">{totalCount}</span>]
      <button onClick={onPlus} id="plus">
        +
      </button>
    </div>
  );
}

App.propTypes = {
  onMinus: PropTypes.func.isRequired,
  onPlus: PropTypes.func.isRequired,
  totalCount: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
};

App.navStatic = {
  header: 'ok',
};

function sampleController(container) {
  const onMinus$ = new Subject();
  const onPlus$ = new Subject();

  const click$ = merge(
    onMinus$.pipe(map(() => -1)),
    onPlus$.pipe(map(() => +1))
  );
  const totalCount$ = container
    .getProp('step')
    .pipe(
      switchMap(step => click$.pipe(map(v => v * step))),
      startWith(0),
      scan((acc, x) => acc + x, 0)
    );

  const title$ = container
    .getProps('step', 'heading')
    .pipe(map(([step, heading]) => `${heading} - ${step}`));

  return combineProps({ totalCount$, title$ }, { onMinus$, onPlus$ });
}

const AppContainer = connect(sampleController)(App);

test('connect', done => {
  const wrapper = mount(<AppContainer step="1" heading="Test" />);
  expect(wrapper.find('#count').text()).toBe('0');
  expect(wrapper.find('#title').text()).toBe('Test - 1');

  wrapper.find('#plus').simulate('click');

  expect(wrapper.find('#count').text()).toBe('1');
  wrapper.find('#plus').simulate('click');
  wrapper.find('#plus').simulate('click');

  expect(wrapper.find('#count').text()).toBe('3');
  wrapper.find('#minus').simulate('click');
  wrapper.find('#minus').simulate('click');

  expect(wrapper.find('#count').text()).toBe('1');

  wrapper.setProps({ step: 3 });
  expect(wrapper.find('#title').text()).toBe('Test - 3');
  wrapper.find('#plus').simulate('click');
  expect(wrapper.find('#count').text()).toBe('4');
  wrapper.find('#minus').simulate('click');
  expect(wrapper.find('#count').text()).toBe('1');

  wrapper.setProps({ step: 3, heading: 'New' });
  expect(wrapper.find('#title').text()).toBe('New - 3');
  expect(wrapper.find('#count').text()).toBe('1');

  wrapper.setProps({ step: 3 });
  expect(wrapper.find('#title').text()).toBe('New - 3');
  expect(wrapper.find('#count').text()).toBe('1');

  wrapper.unmount();
  done();
});

test('connect to throw if no observable returned', () => {
  expect(() => {
    const Cmp = connect(() => 0)(() => null);
    return new Cmp({}, {});
  }).toThrow('controller should return an observable');
});

test('connect - displayName', () => {
  // eslint-disable-next-line prefer-arrow-callback
  const Cmp1 = connect(() => 0)(function Name1() {});
  expect(Cmp1.displayName).toBe('connect(Name1)');

  const NODE_ENV = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';

  // eslint-disable-next-line prefer-arrow-callback
  const Cmp2 = connect(() => 0)(function Name2() {});
  expect(Cmp2.displayName).toBe(undefined);

  process.env.NODE_ENV = NODE_ENV;
});

test('connect - keep component statics', () => {
  // eslint-disable-next-line prefer-arrow-callback
  expect(AppContainer.navStatic).toEqual({ header: 'ok' });
});

test('server side rendering', () => {
  const wrapper = render(<AppContainer step="1" heading="Test" />);
  expect(wrapper.find('#count').text()).toBe('0');
  expect(wrapper.find('#title').text()).toBe('Test - 1');
});
