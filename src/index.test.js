import React from 'react';
import { mount } from 'enzyme';
import { Subject, Observable } from 'rx';
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
  plusOne: React.PropTypes.any,
  minusOne: React.PropTypes.any,
  totalCount: React.PropTypes.any,
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
      .forEach(renderApp => {
        const wrapper = mount(renderApp());
        expect(wrapper.find('#root').text()).toBe('Hello');
        wrapper.unmount();
        done();
      });
  });

  it('works', (done) => {
    createSampleContainer()
      .first()
      .forEach(renderApp => {
        const wrapper = mount(renderApp());
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
});
