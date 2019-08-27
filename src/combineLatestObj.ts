import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

type AnyObservablesObject = { [k: string]: Observable<any> };

export function combineLatestObj<T extends AnyObservablesObject>(
  obj: T
): Observable<
  { [k in keyof T]: T[k] extends Observable<infer V> ? V : never }
> {
  const sources = [];
  const keys: string[] = [];
  for (const key in obj) {
    /* istanbul ignore else  */
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      keys.push(key);
      sources.push(obj[key]);
    }
  }
  return combineLatest(sources).pipe(
    map(args => {
      const combination: { [k: string]: any } = {};
      for (let i = args.length - 1; i >= 0; i -= 1) {
        combination[keys[i]] = args[i];
      }
      return combination as any;
    })
  );
}
