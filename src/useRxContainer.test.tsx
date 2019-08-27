import * as React from 'react';

import { mount, render } from 'enzyme';

import { merge, Observable, Subject } from 'rxjs';
import { map, scan, startWith, switchMap } from 'rxjs/operators';

import { combineProps } from '.';
import { PropsHelper } from './PropsHelper';
import { useRxController } from './useRxController';

interface AppProps {
  onMinus: (event: any) => void;
  onPlus: (event: any) => void;
  totalCount: number;
  title: string;
}

interface ContainerProps {
  step: number;
  heading: string;
}

function sampleController(
  container: PropsHelper<ContainerProps>
): Observable<AppProps> {
  const onMinus$ = new Subject();
  const onPlus$ = new Subject();

  const click$ = merge(
    onMinus$.pipe(map(() => -1)),
    onPlus$.pipe(map(() => +1))
  );
  const totalCount$ = container.getProp('step').pipe(
    switchMap(step => click$.pipe(map(v => v * step))),
    startWith(0),
    scan((acc, x) => acc + x, 0)
  );

  const title$ = container
    .getProps('step', 'heading')
    .pipe(map(([step, heading]) => `${heading} - ${step}`));

  return combineProps(
    { totalCount: totalCount$, title: title$ },
    { onMinus: onMinus$, onPlus: onPlus$ }
  );
}

function App(props: ContainerProps) {
  const state = useRxController(sampleController, props);
  if (!state) return null;
  const { onMinus, onPlus, totalCount, title } = state;
  return (
    <div>
      <h1 id="title">{title}</h1>
      <button type="button" onClick={onMinus} id="minus">
        -
      </button>
      [<span id="count">{totalCount}</span>]
      <button type="button" onClick={onPlus} id="plus">
        +
      </button>
    </div>
  );
}

App.navStatic = {
  header: 'ok',
};

const AppContainer = App;

describe('useRxContainer', () => {
  test('base', done => {
    const wrapper = mount(<AppContainer step={1} heading="Test" />);
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

  test('server side rendering', () => {
    const wrapper = render(<AppContainer step={1} heading="Test" />);
    expect(wrapper.find('#count').text()).toBe('0');
    expect(wrapper.find('#title').text()).toBe('Test - 1');
  });
});
