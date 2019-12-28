import * as React from 'react';
import { useEffect } from 'react';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { share, first } from 'rxjs/operators';
import { createGetProp, createGetProps, PropsHelper } from './PropsHelper';

function createPropsHelpers<Props>(
  props$: BehaviorSubject<Props>
): PropsHelper<Props> {
  return {
    get props(): Props {
      return props$.getValue();
    },
    props$: props$.asObservable(),
    getProp: createGetProp(props$),
    getProps: createGetProps(props$),
  };
}

export function useRxController<Props, StateProps>(
  controller: (helper: PropsHelper<Props>) => Observable<StateProps>,
  props: Props
): StateProps | null {
  let initialState = null;
  const [internalState, setInternalState] = React.useState<{
    state$?: Observable<StateProps>;
    subscription?: Subscription;
    props$?: BehaviorSubject<Props>;
  }>({});

  // first render
  if (!internalState.props$) {
    const props$: BehaviorSubject<Props> = new BehaviorSubject(props);
    const state$: Observable<StateProps> = controller(
      createPropsHelpers(props$)
    ).pipe(share());

    // if there are already some data - get it
    state$.pipe(first()).subscribe(v => {
      initialState = v;
    });

    setInternalState({ ...internalState, state$, props$ });
  }

  const [state, setState] = React.useState<StateProps | null>(initialState);
  useEffect(() => {
    const subscription: Subscription = internalState.state$!.subscribe(
      props => {
        setState(props);
      }
    );
    setInternalState({ ...internalState, subscription });
    return () => {
      subscription.unsubscribe();
    };
  }, [internalState.state$]);

  // push each props into behavior subject
  useEffect(() => {
    if (internalState.props$) {
      internalState.props$.next(props);
    }
  }, Object.values(props));

  return state;
}
