import React from 'react';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/defer';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/mapTo';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/share';

import { combineLatestObj } from './combineLatestObj';

import { RxContainer } from './RxContainer';

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

  const propsObservable = Object.keys(observables).length === 0
    ? Observable.of([{}])
    : combineLatestObj(observables).share();

  const initialState = {};

  return (initialProps) => (
    <RxContainer
      props={{...initialProps, ...props}}
      callbacks={callbacks}
      initialState={initialState}
      component={Component}
      observable={propsObservable}
    />
  );
}

export default createContainer;
