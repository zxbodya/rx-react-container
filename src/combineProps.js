import { of } from 'rxjs/observable/of';
import { map } from 'rxjs/operators/map';

import { combineLatestObj } from './combineLatestObj';

/**
 * Creates observable combining values from observables, observers(as callbacks) and plain object
 * resulting in Observable of properties to be rendered with react component.
 *
 * @param {Object.<string, Observable>} observables=
 * @param {Object.<string, Observer>} observers=
 * @param {Object} props=
 */
export function combineProps(observables, observers, props) {
  const baseProps = Object.assign({}, props);

  if (observers) {
    Object.keys(observers).forEach(key => {
      baseProps[key.replace(/\$$/, '')] = value => {
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
