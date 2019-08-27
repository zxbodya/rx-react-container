import { BehaviorSubject, of } from 'rxjs';

import { take, tap, toArray } from 'rxjs/operators';

import { combineProps } from './combineProps';

describe('combineProps', () => {
  it('works correctly for no arguments', done => {
    combineProps()
      .pipe(toArray())
      .subscribe(v => {
        expect(v).toMatchSnapshot();
        done();
      });
  });

  it('works correctly for empty arguments', done => {
    combineProps({}, {}, {})
      .pipe(toArray())
      .subscribe(v => {
        expect(v).toMatchSnapshot();
        done();
      });
  });

  it('works correctly when props are passed', done => {
    combineProps({}, {}, { a: 1 })
      .pipe(toArray())
      .subscribe(v => {
        expect(v).toMatchSnapshot();
        done();
      });
  });

  it('works correctly for observables', done => {
    combineProps(
      {
        a: of(1),
        b: of(2),
      },
      {},
      {}
    )
      .pipe(toArray())
      .subscribe(v => {
        expect(v).toMatchSnapshot();
        done();
      });
  });

  it('works correctly observers', done => {
    const a$ = new BehaviorSubject(0);
    combineProps(
      {},
      {
        a: a$,
      },
      {}
    )
      .pipe(toArray())
      .subscribe(v => {
        expect(v).toMatchSnapshot();
        v[0].a(123);
        expect(a$.value).toBe(123);
        done();
      });
  });

  it('works for complete sample', done => {
    const b$ = new BehaviorSubject(0);
    combineProps(
      {
        a: of(1),
        b: b$,
      },
      {
        onB: b$,
      },
      {
        c: 1,
        d: 2,
      }
    )
      .pipe(
        tap(({ onB }) => setTimeout(onB, 1, 1)),
        take(2),
        toArray()
      )
      .subscribe(v => {
        expect(v).toMatchSnapshot();
        done();
      });
  });
});
