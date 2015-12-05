import React from 'react';

import {AnonymousObservable} from 'rx';

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

      const propsObservable = combineLatestObj(observables).share();

      const initialState = {};
      const renderProps = {
        props: props,
        callbacks: callbacks,
        component: Component,
        observable: propsObservable,
        initialState: initialState,
      };

      const renderFn = ()=> <RxController {...renderProps}/>;

      renderFn.component = RxController;
      renderFn.props = renderProps;

      return propsObservable
        .do(state=>Object.assign(initialState, state))
        .map(()=>renderFn)
        .distinctUntilChanged()
        .subscribe(observer);
    });

    this.params = [Component, observables, observers, props];
  }

  /**
   * Extend defined params
   * @param {Object.<string, Rx.Observable>=} observables
   * @param {Object.<string, Rx.Observer>=} observers
   * @param {Object=} props
   * @returns {RxContainer}
   */
  extend(observables, observers, props) {
    const [Component, prevObservables, prevObservers, prevProps] = this.params;
    return new RxContainer(
      Component,
      observables && Object.assign({}, prevObservables, observables),
      observers && Object.assign({}, prevObservers, observers),
      props && Object.assign({}, prevProps, props)
    );
  }

  /**
   * Extend defined params
   * @param {function(component: React.Component): React.Component} decorator
   * @returns {RxContainer}
   */
  decorate(decorator) {
    const [Component, observables, observers, props] = this.params;
    return new RxContainer(
      decorator(Component),
      observables,
      observers,
      props
    );
  }
}

export default RxContainer;
