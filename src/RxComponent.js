'use strict';

const React = require('react');
const Rx = require('rx');
const {AnonymousObservable} = Rx;

const objectObserver = require('./observableObject');

function createProxyComponent(Component, observable, initialState) {
  class RxProxy extends React.Component {
    constructor(props, context) {
      super(props, context);
    }

    componentWillMount() {
      this.setState(initialState);
    }

    componentDidMount() {
      this.subscribtion = observable.subscribe((state)=> {
        this.setState(state);
      });
    }

    componentWillUnmount() {
      this.subscribtion.dispose();
    }

    render() {
      return (<Component {...this.props} {...this.state}/>);
    }
  }
  return RxProxy;
}

/**
 * Creates observable form ready to render ReactElements.
 * The same ReactElement would be emitted on every observables combination.
 */
class RxComponent extends AnonymousObservable {
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

      const propsObservable = objectObserver(observables).share();

      const initialState = {};
      const Proxy = createProxyComponent(Component, propsObservable, initialState);
      const proxyElement = (
        <Proxy {...props} {...callbacks}/>
      );

      return propsObservable
        .do(state=>Object.assign(initialState, state))
        .map(()=>proxyElement)
        .subscribe(observer);
    });

    this.params = [Component, observables, observers, props];
  }

  /**
   * Extend defined params
   * @param {Object.<string, Rx.Observable>=} observables
   * @param {Object.<string, Rx.Observer>=} observers
   * @param {Object=} props
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
