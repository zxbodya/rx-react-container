import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

export type PropsHelper<Props> = {
  props: Props;
  props$: Observable<Props>;
  getProp<K extends keyof Props>(key: K): Observable<Props[K]>;
  getProps<Keys extends Array<keyof Props>>(
    ...keys: Keys
  ): Observable<
    {
      [Key in keyof Keys]: Keys[Key] extends keyof Props
        ? Props[Keys[Key]]
        : never;
    }
  >;
};

export const createGetProp = <Props>(props$: Observable<Props>) =>
  function getProp<K extends keyof Props>(key: K): Observable<Props[K]> {
    return props$.pipe(
      map(props => props[key]),
      distinctUntilChanged()
    );
  };

export const createGetProps = <Props>(props$: Observable<Props>) =>
  function getProps<Keys extends Array<keyof Props>>(
    ...keys: Keys
  ): Observable<
    {
      [Key in keyof Keys]: Keys[Key] extends keyof Props
        ? Props[Keys[Key]]
        : never;
    }
  > {
    const r = props$.pipe(
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
  };
