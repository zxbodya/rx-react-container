import hoistStatics from 'hoist-non-react-statics';
import * as React from 'react';
import { ComponentType } from 'react';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { first, share } from 'rxjs/operators';
import { createGetProp, createGetProps, PropsHelper } from './PropsHelper';

/**
 * @deprecated alias to PropsHelper
 */
export type RxReactContainer<Props> = PropsHelper<Props>;

export function connect<Props, StateProps>(
  controller: (container: PropsHelper<Props>) => Observable<StateProps>
) {
  return (Component: ComponentType<StateProps>): ComponentType<Props> => {
    class Container extends React.Component<
      Props,
      { props: StateProps | null }
    > {
      public props$: BehaviorSubject<Props>;
      private subscription: Subscription | null;
      private stateProps$: Observable<StateProps>;
      private firstSubscription: Subscription;
      public getProp: PropsHelper<Props>['getProp'];
      public getProps: PropsHelper<Props>['getProps'];

      constructor(props: Props, context: object) {
        super(props, context);
        this.state = { props: null };
        const props$ = new BehaviorSubject(props);
        this.props$ = props$;
        this.getProp = createGetProp(this.props$);
        this.getProps = createGetProps(this.props$);
        this.subscription = null;
        const propsHelper: PropsHelper<Props> = {
          get props(): Props {
            return props$.getValue();
          },
          props$: props$.asObservable(),
          getProp: createGetProp(props$),
          getProps: createGetProps(props$),
        };
        const stateProps$ = controller(propsHelper);
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

      public render() {
        return (
          // @ts-expect-error
          this.state.props && React.createElement(Component, this.state.props)
        );
      }
      static displayName: string;
    }

    if (process.env.NODE_ENV !== 'production') {
      const name = Component.displayName || Component.name;
      if (name) {
        Container.displayName = `connect(${name})`;
      }
    }

    return hoistStatics(Container, Component);
  };
}
