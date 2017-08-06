import React from 'react';
import PropTypes from 'prop-types';
import { mount } from 'enzyme';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/scan';

import createContainer from './index';

function StaticView() {
  return <div id="root">Hello</div>;
}

function App({ plusOne, minusOne, totalCount }) {
  return (
    <div>
      <button onClick={minusOne} id="minus">-</button>
      [<span id="count">{totalCount}</span>]
      <button onClick={plusOne} id="plus">+</button>
    </div>
  );
}

App.propTypes = {
  plusOne: PropTypes.any,
  minusOne: PropTypes.any,
  totalCount: PropTypes.any,
};

function createSampleContainer() {
  const plusOne$ = new Subject();
  const minusOne$ = new Subject();

  const totalCount$ = Observable
    .merge(
      plusOne$.map(() => +1),
      minusOne$.map(() => -1)
    )
    .startWith(0)
    .scan((acc, x) => acc + x, 0);

  return createContainer(App, { totalCount$ }, { plusOne$, minusOne$ });
}

describe('createContainer', () => {
  it('renders static view', (done) => {
    createContainer(StaticView)
      .first()
      .subscribe(renderApp => {
        const wrapper = mount(renderApp());
        expect(wrapper.find('#root').text()).toBe('Hello');
        wrapper.unmount();
        done();
      });
  });

  it('works', (done) => {
    createSampleContainer()
      .first()
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
});
