// @ts-ignore
import hoistStatics from 'hoist-non-react-statics';
import * as React from 'react';
import { ComponentType } from 'react';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, first, map, share } from 'rxjs/operators';

export interface RxReactContainer<Props> extends React.Component<Props> {
  props$: Observable<Props>;
  getProp<K extends keyof Props>(key: K): Observable<Props[K]>;
  getProps<K extends Array<keyof Props>>(
    ...keys: K
  ): Observable<
    { [Ki in keyof K]: K[Ki] extends keyof Props ? Props[K[Ki]] : never }
  >;
}
/**
 * @param controller
 * @return {function(*=)}
 */
export function connect<Props, StateProps>(
  controller: (container: RxReactContainer<Props>) => Observable<StateProps>
) {
  return (Component: ComponentType<StateProps>): ComponentType<Props> => {
    class Container extends React.Component<Props, { props: StateProps | null }>
      implements RxReactContainer<Props> {
      public props$: BehaviorSubject<Props>;
      private subscription: Subscription | null;
      private stateProps$: Observable<StateProps>;
      private firstSubscription: Subscription;

      constructor(props: Props, context: object) {
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

      public componentDidMount() {
        this.subscription = this.stateProps$.subscribe(props => {
          this.setState({ props });
        });
        // in case no data was received before first render - remove duplicated subscription
        this.firstSubscription.unsubscribe();
      }

      public componentDidUpdate() {
        this.props$.next(this.props);
      }

      public componentWillUnmount() {
        if (this.subscription) {
          this.subscription.unsubscribe();
        }
      }

      /**
       * Observable with prop by key
       */
      public getProp<K extends keyof Props>(key: K): Observable<Props[K]> {
        return this.props$.pipe(
          map(props => props[key]),
          distinctUntilChanged()
        );
      }

      /**
       * Observable with props by keys
       */
      public getProps<Keys extends Array<keyof Props>>(
        ...keys: Keys
      ): Observable<
        {
          [Key in keyof Keys]: Keys[Key] extends keyof Props
            ? Props[Keys[Key]]
            : never;
        }
      > {
        const r = this.props$.pipe(
          distinctUntilChanged((p, q) => {
            for (let i = 0, l = keys.length; i < l; i += 1) {
              const name = keys[i];
              if (p[name] !== q[name]) {
                return false;
              }
            }
            return true;
          }),
          map(props => keys.map(key => props[key]))
        );
        return r as any;
      }

      public render() {
        return (
          this.state.props && React.createElement(Component, this.state.props)
        );
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      const name = Component.displayName || Component.name;
      if (name) {
        // @ts-ignore
        Container.displayName = `connect(${name})`;
      }
    }

    return hoistStatics(Container, Component);
  };
}
