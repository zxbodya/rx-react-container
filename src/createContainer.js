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
 * Creates observable of functions that will create react virtual dom.
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
