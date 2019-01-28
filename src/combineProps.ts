import { Observable, Observer, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { combineLatestObj } from './combineLatestObj';

/**
 * Creates observable combining values from observables, observers(as callbacks) and plain object
 * resulting in Observable of properties to be rendered with react component.
 *
 * @param {Object.<string, Observable>} observables=
 * @param {Object.<string, Observer>} observers=
 * @param {Object} props=
 */
export function combineProps(
  observables?: { [k: string]: Observable<any> },
  observers?: { [k: string]: Observer<any> },
  props?: { [k: string]: any }
) {
  const baseProps = Object.assign({}, props);

  if (observers) {
    Object.keys(observers).forEach(key => {
      baseProps[key.replace(/\$$/, '')] = (value: any) => {
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
