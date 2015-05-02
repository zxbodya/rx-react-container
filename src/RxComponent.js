'use strict';

const React = require('react');
const Rx = require('rx');
const {AnonymousObservable} = Rx;

const objectObserver = require('./observableObject');

class RxComponent extends AnonymousObservable {
  /**
   * @param {React.Component} Component
   * @param {Object.<Rx.Observable>} observables
   * @param {Object.<Rx.Observer>}observers
   * @param {Object} props
   */
  constructor(Component, observables = {}, observers = {}, props = {}) {
    super(observer=> {
      const callbacks = {};

      Object.keys(observers).forEach(key=> {
        callbacks[key] = (value)=>observers[key].onNext(value);
      });

      return objectObserver(observables).map((state)=> {
        return (
          <Component {...props} {...state} {...callbacks}/>
        );
      }).subscribe(observer);
    });
    this.params = [Component, observables, observers, props];
  }

  /**
   * Extend defined params
   * @param {Object.<Rx.Observable>} observables
   * @param {Object.<Rx.Observer>}observers
   * @param {Object} props
   * @returns {RxComponent}
   */
  extend(observables, observers, props) {
    const [Component, prevObservables, prevObservers, prevProps] = this.params;
    return new RxComponent(
      Component,
      observables && Object.assign({}, prevObservables, observables),
      observers && Object.assign({}, prevObservers, observers),
      props && Object.assign({}, prevProps, props)
    );
  }
}

module.exports = RxComponent;
