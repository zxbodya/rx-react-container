import React from 'react';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/defer';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/mapTo';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/share';

import { RxContainer } from './RxContainer';
import { combineProps } from './combineProps';

/**
 * @deprecated Deprecated in favor of `connect`
 * Creates observable of functions that will create react virtual dom.
 *
 * Parameters:
 *
 *  - `Component` react component to wrap
 *  - `observables` observables with data for component
 *  - `observers` observers to be passed as callbacks to component
 *  - `props` props to pass directly to component
 *
 *  In `observers` and `observables` key names it supports `$`
 *  suffix popularized by Cycle.js (http://cycle.js.org/basic-examples.html#what-does-the-suffixed-dollar-sign-mean).
 *  For example if you pass `name$` stream - data from it would be passed as `name`.
 *
 *  It will create an observable, that will return function for rendering virtual dom with container component.
 *
 *  Container component has state - it is equal to latest combination of data from `observables`,
 *  and will be updated if state changes.
 *
 *  Also container will correctly dispose subscription to observables when unmounted from DOM.
 *
 *  ### Example:
 *
 *  ```JS
 *  import React from 'react';
 *  import {render} from 'react-dom';
 *
 *  import {Subject, Observable} from 'rxjs';
 *  import createContainer from 'rx-react-container';
 *
 *  const plusOne$ = new Subject();
 *  const minusOne$ = new Subject();
 *
 *  const totalCount$ = Observable
 *  .merge(
 *  plusOne$.map(() => +1),
 *  minusOne$.map(() => -1)
 *  )
 *  .startWith(0)
 *  .scan((acc, x) => acc + x, 0);
 *
 *  const App = ({plusOne, minusOne, totalCount}) => {
 *   return (
 *     <div>
 *       <button onClick={minusOne}>-</button>
 *       [{totalCount}]
 *       <button onClick={plusOne}>+</button>
 *     </div>
 *   );
 *  ;
 *
 *  const app$ = createContainer(App, {totalCount$}, {plusOne$, minusOne$});
 *  const appElement = document.getElementById('app');
 *  app$.forEach(renderApp=>render(renderApp(), appElement));
 *
 *  ```
 *
 * @param {React.Component} Component
 * @param {Object.<string, Observable>=} observables
 * @param {Object.<string, Observer>=} observers
 * @param {Object=} props
 */
export function createContainer(Component, observables = {}, observers = {}, props = {}) {
  return Observable.defer(() => {
    const propsObservable = combineProps(observables, observers, props).share();

    const initialState = {};

    const renderFn = () => (
      <RxContainer
        props={props}
        initialState={initialState}
        component={Component}
        observable={propsObservable}
      />
    );

    return propsObservable
      .do(state => {
        Object.assign(initialState, state);
      })
      .mapTo(renderFn)
      .distinctUntilChanged();
  });
}
