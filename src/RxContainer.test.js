import React from 'react';
import { mount } from 'enzyme';
import { Observable } from 'rxjs';
import { RxContainer } from './RxContainer';

function StaticView() {
  return <div id="root">Hello</div>;
}

describe('RxContainerController', () => {
  let subscribeCount = 0;
  let disposeCount = 0;

  const wrapper = mount(
    <RxContainer
      component={StaticView}
      observable={Observable.create(o => {
        subscribeCount += 1;
        o.next({});
        return () => {
          disposeCount += 1;
        };
      })}
      initialState={{}}
    />
  );

  it('renders static view', () => {
    expect(wrapper.find('#root').text()).toBe('Hello');
    expect(subscribeCount).toBe(1);
    expect(disposeCount).toBe(0);
  });

  it('does not resubscribe when rendered with same observable', () => {
    wrapper.setProps({ props: {} });
    expect(subscribeCount).toBe(1);
    expect(disposeCount).toBe(0);
  });

  it('creates new subscription on render with different observable', () => {
    wrapper.setProps({ observable: Observable.of({}) });
    expect(subscribeCount).toBe(1);
    expect(disposeCount).toBe(1);
  });
});
