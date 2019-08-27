import { Observable, Observer, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { combineLatestObj } from './combineLatestObj';

type AnyObservablesObject = { [k: string]: Observable<any> };
type AnyObserversObject = { [k: string]: Observer<any> };

/**
 * Creates observable combining values from observables, observers(as callbacks) and plain object
 * resulting in Observable of properties to be rendered with react component.
 */
export function combineProps<
  ObservablesObject extends AnyObservablesObject,
  ObserversObject extends AnyObserversObject,
  OtherProps extends {}
>(
  observables?: ObservablesObject,
  observers?: ObserversObject,
  props?: OtherProps
): Observable<
  OtherProps &
    {
      [k in keyof ObservablesObject]: ObservablesObject[k] extends Observable<
        infer V
      >
        ? V
        : never;
    } &
    {
      [k in keyof ObserversObject]: ObserversObject[k] extends Observer<infer V>
        ? (value: V) => void
        : never;
    }
> {
  const baseProps: any = Object.assign({}, props);

  if (observers) {
    Object.keys(observers).forEach(key => {
      baseProps[key] = (value: any) => {
        observers[key].next(value);
      };
    });
  }

  if (observables && Object.keys(observables).length > 0) {
    return combineLatestObj(observables).pipe(
      map(newProps => Object.assign({}, baseProps, newProps))
    );
  }

  return of(baseProps);
}
