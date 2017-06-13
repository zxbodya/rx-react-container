import React from 'react';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/distinctUntilChanged';

/**
 * High
 * @param controller
 * @return {function(*=)}
 */
export function connect(controller) {
  return Component => {
    class Container extends React.Component {
      constructor(props) {
        super();
        this.state = { props: null };
        this.props$ = new BehaviorSubject(props);
        this.subscription = null;
        this.stateProps$ = controller(this);
        if (!this.stateProps$.subscribe) {
          throw new Error('controller should return observable');
        }
      }

      componentWillMount() {
        this.subscription = this.stateProps$
          .subscribe(props => {
            this.setState({ props });
          });
      }

      componentWillReceiveProps(nextProps) {
        this.props$.next(nextProps);
      }

      componentWillUnmount() {
        this.subscription.unsubscribe();
      }

      /**
       * Observable with prop by key
       * @param key
       */
      prop(key) {
        return this.props$
          .map(props => props[key])
          .distinctUntilChanged();
      }

      /**
       * Observable with props by keys
       * @param keys
       */
      props(...keys) {
        return this.props$
          .distinctUntilChanged((p, q) => {
            for (let i = 0, l = keys.length; i < l; i += 1) {
              const name = keys[i];
              if (p[name] !== q[name]) return false;
            }
            return true;
          })
          .map(props => keys.map(key => props[key]));
      }

      render() {
        return this.state.props && React.createElement(Component, this.state.props);
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      const name = Component.displayName || Component.name;
      if (name) {
        Container.dispalyName = `connect(${name})`;
      }
    }

    return Container;
  };
}
