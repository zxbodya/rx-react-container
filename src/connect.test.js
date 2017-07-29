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

import { connect, combineProps } from './index';

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
  plusOne: PropTypes.func.isRequired,
  minusOne: PropTypes.func.isRequired,
  totalCount: PropTypes.number.isRequired,
};

function sampleController() {
  const plusOne$ = new Subject();
  const minusOne$ = new Subject();

  const totalCount$ = Observable
    .merge(
      plusOne$.map(() => +1),
      minusOne$.map(() => -1)
    )
    .startWith(0)
    .scan((acc, x) => acc + x, 0);

  return combineProps({ totalCount$ }, { plusOne$, minusOne$ });
}

const AppContainer = connect(sampleController)(App);

describe('createContainer', () => {
  it('works', (done) => {
    const wrapper = mount(<AppContainer />);
    expect(wrapper.find('#count').text()).toBe('0');
    setTimeout(() => {
      wrapper.find('#plus').simulate('click');
      setTimeout(() => {
        expect(wrapper.find('#count').text()).toBe('1');
        wrapper.find('#plus').simulate('click');
        wrapper.find('#plus').simulate('click');
        setTimeout(() => {
          expect(wrapper.find('#count').text()).toBe('3');
          wrapper.find('#minus').simulate('click');
          wrapper.find('#minus').simulate('click');
          setTimeout(() => {
            expect(wrapper.find('#count').text()).toBe('1');
            wrapper.unmount();
            done();
          }, 10);
        }, 10);
      }, 10);
    }, 10);
  });
});
