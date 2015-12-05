import React from 'react';

import {AnonymousObservable, Observable} from 'rx';

import combineLatestObj from 'rx-combine-latest-obj';

import RxContainerController from './RxContainerController';

/**
 * Creates observable of functions that will create react virtual dom.
 *
 * @param {React.Component} Component
 * @param {Object.<string, Rx.Observable>=} observables
 * @param {Object.<string, Rx.Observer>=} observers
 * @param {Object=} props
 */
function createContainer(Component, observables = {}, observers = {}, props = {}) {
  return new AnonymousObservable(observer=> {
    const callbacks = {};

    Object.keys(observers).forEach(key=> {
      callbacks[key.replace(/\$$/, '')] = (value)=>observers[key].onNext(value);
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

export default createContainer;
