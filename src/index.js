import React from 'react';

import { AnonymousObservable, Observable } from 'rx';

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
  const callbacks = {};

  Object.keys(observers).forEach(key => {
    callbacks[key.replace(/\$$/, '')] = value => {
      observers[key].onNext(value);
    };
  });

  return new AnonymousObservable(observer => {
    const propsObservable = Object.keys(observables).length === 0
      ? Observable.return({})
      : combineLatestObj(observables).share();

    const initialState = {};

    const renderFn = () => (
      <RxContainerController
        props={props}
        callbacks={callbacks}
        initialState={initialState}
        component={Component}
        observable={propsObservable}
      />
    );

    return propsObservable
      .do(state => {
        Object.assign(initialState, state);
      })
      .map(() => renderFn)
      .distinctUntilChanged()
      .subscribe(observer);
  });
}

export default createContainer;
