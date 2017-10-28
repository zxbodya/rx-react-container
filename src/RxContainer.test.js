import React from 'react';
import PropTypes from 'prop-types';
import { mount } from 'enzyme';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { RxContainer } from './RxContainer';

function StaticView({ heading }) {
  return <div id="root">{heading}</div>;
}

StaticView.propTypes = {
  heading: PropTypes.string.isRequired,
};

describe('RxContainer', () => {
  let subscribeCount = 0;
  let disposeCount = 0;
  let wrapper;

  beforeAll(() => {
    wrapper = mount(
      <RxContainer
        component={StaticView}
        observable={Observable.create(o => {
          subscribeCount += 1;
          o.next({ heading: 'Hello' });
          return () => {
            disposeCount += 1;
          };
        })}
        initialState={{ heading: 'Hello' }}
      />
    );
  });

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
    wrapper.setProps({ observable: of({ heading: 'Hello' }) });
    expect(subscribeCount).toBe(1);
    expect(disposeCount).toBe(1);
  });

  it('renders updated values when received', () => {
    const data = new BehaviorSubject({ heading: 'initial' });
    wrapper.setProps({ observable: data });
    expect(wrapper.find('#root').text()).toBe('initial');
    data.next({ heading: 'new' });
    expect(wrapper.find('#root').text()).toBe('new');
  });

  afterAll(() => {
    wrapper.unmount();
  });
});
