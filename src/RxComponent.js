import React from 'react';

import {AnonymousObservable} from 'rx';

import objectObserver from './observableObject';

class RxController extends React.Component {
  constructor(props) {
    super();
    this.state = props.initialState;
  }

  componentDidMount() {
    this.subscribtion = this.props.observable.subscribe((state)=> {
      this.setState(state);
    });
  }

  componentWillUnmount() {
    this.subscribtion.dispose();
  }

  render() {
    const Component = this.props.component;
    return (
      <Component
        {...this.props.props}
        {...this.props.callbacks}
        {...this.state}
      />
    );
  }
}

RxController.propTypes = {
  component: React.PropTypes.func,
  observable: React.PropTypes.object,
  initialState: React.PropTypes.object,
  props: React.PropTypes.object,
  callbacks: React.PropTypes.object
};

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
      const renderProps = {
        props: props,
        callbacks: callbacks,
        component: Component,
        observable: propsObservable,
        initialState: initialState
      };

      const renderFn = function () {
        return (
          <RxController {...renderProps}/>
        );
      };

      renderFn.component = RxController;
      renderFn.props = renderProps;

      return propsObservable
        .do(state=>Object.assign(initialState, state))
        .map(()=>renderFn)
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

  /**
   * Extend defined params
   * @param {function(component: React.Component): React.Component} decorator
   * @returns {RxComponent}
   */
  decorate(decorator) {
    const [Component, observables, observers, props] = this.params;
    return new RxComponent(
      decorator(Component),
      observables,
      observers,
      props
    );
  }
}

export default RxComponent;
