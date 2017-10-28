import React from 'react';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { map } from 'rxjs/operators/map';
import { distinctUntilChanged } from 'rxjs/operators/distinctUntilChanged';
import { first } from 'rxjs/operators/first';
import { share } from 'rxjs/operators/share';

/**
 * @param controller
 * @return {function(*=)}
 */
export function connect(controller) {
  return Component => {
    class Container extends React.Component {
      constructor(props, context) {
        super(props, context);
        this.state = { props: null };
        this.props$ = new BehaviorSubject(props);
        this.subscription = null;
        this.firstSubscription = null;
        const stateProps$ = controller(this);
        if (!stateProps$.subscribe) {
          throw new Error('controller should return an observable');
        }
        this.stateProps$ = stateProps$.pipe(share());
      }

      componentWillMount() {
        // create subscription to get initial data
        // not creating permanent subscription, because componentWillUnmount is not called server-side
        // which in many cases will result in memory leak
        this.firstSubscription = this.stateProps$
          .pipe(first())
          .subscribe(props => {
            this.setState({ props });
          });
      }

      componentDidMount() {
        this.subscription = this.stateProps$.subscribe(props => {
          this.setState({ props });
        });
        // in case no data was received before first render - remove duplicated subscription
        this.firstSubscription.unsubscribe();
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
      getProp(key) {
        return this.props$.pipe(
          map(props => props[key]),
          distinctUntilChanged()
        );
      }

      /**
       * Observable with props by keys
       * @param keys
       */
      getProps(...keys) {
        return this.props$.pipe(
          distinctUntilChanged((p, q) => {
            for (let i = 0, l = keys.length; i < l; i += 1) {
              const name = keys[i];
              if (p[name] !== q[name]) return false;
            }
            return true;
          }),
          map(props => keys.map(key => props[key]))
        );
      }

      render() {
        return (
          this.state.props && React.createElement(Component, this.state.props)
        );
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      const name = Component.displayName || Component.name;
      if (name) {
        Container.displayName = `connect(${name})`;
      }
    }

    return Container;
  };
}
