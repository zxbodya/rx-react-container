import React from 'react';
import { BehaviorSubject } from 'rxjs';
import { map, distinctUntilChanged, first, share } from 'rxjs/operators';

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
        const stateProps$ = controller(this);
        if (!stateProps$.subscribe) {
          throw new Error('controller should return an observable');
        }
        this.stateProps$ = stateProps$.pipe(share());
        // create subscription to get initial data
        // not creating permanent subscription, because componentWillUnmount is not called server-side
        // which in many cases will result in memory leak
        this.firstSubscription = this.stateProps$.pipe(first()).subscribe(p => {
          const newState = { props: p };
          if (this.state.props !== null) {
            this.setState(newState);
          } else {
            this.state = newState;
          }
        });
      }

      componentDidMount() {
        this.subscription = this.stateProps$.subscribe(props => {
          this.setState({ props });
        });
        // in case no data was received before first render - remove duplicated subscription
        this.firstSubscription.unsubscribe();
      }

      componentDidUpdate() {
        this.props$.next(this.props);
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
