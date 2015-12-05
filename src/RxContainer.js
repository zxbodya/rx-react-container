import React from 'react';

import {AnonymousObservable, Observable} from 'rx';

import combineLatestObj from 'rx-combine-latest-obj';

import RxContainerController from './RxContainerController';

/**
 * Creates observable form ready to render ReactElements.
 * The same ReactElement would be emitted on every observables combination.
 */
class RxContainer extends AnonymousObservable {
  /**
   * @param {React.Component} Component
   * @param {Object.<string, Rx.Observable>=} observables
   * @param {Object.<string, Rx.Observer>=}observers
   * @param {Object=} props
   */
  constructor(Component, observables = {}, observers = {}, props = {}) {
    super(observer=> {
      const callbacks = {};

      Object.keys(observers).forEach(key=> {
        callbacks[key] = (value)=>observers[key].onNext(value);
      });

      const propsObservable = Object.keys(observables).length === 0
        ? Observable.return({})
        : combineLatestObj(observables).share();

      const initialState = {};
      const renderProps = {
        props: props,
        callbacks: callbacks,
        component: Component,
        observable: propsObservable,
        initialState: initialState,
      };

      const renderFn = ()=> <RxContainerController {...renderProps}/>;

      return propsObservable
        .do(state=>Object.assign(initialState, state))
        .map(()=>renderFn)
        .distinctUntilChanged()
        .subscribe(observer);
    });
  }
}

export default RxContainer;
