import React from 'react';

import { Observable } from 'rxjs';

import { combineLatestObj } from './combineLatestObj';

import RxContainerController from './RxContainerController';

/**
 * Creates observable of functions that will create react virtual dom.
 *
 * @param {React.Component} Component
 * @param {Object.<string, Observable>=} observables
 * @param {Object.<string, Observer>=} observers
 * @param {Object=} props
 */
function createContainer(Component, observables = {}, observers = {}, props = {}) {
  const callbacks = {};

  Object.keys(observers).forEach(key => {
    callbacks[key.replace(/\$$/, '')] = value => {
      observers[key].next(value);
    };
  });

  return Observable.defer(() => {
    const propsObservable = Object.keys(observables).length === 0
      ? Observable.of([{}])
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
      .mapTo(renderFn)
      .distinctUntilChanged();
  });
}

export default createContainer;
