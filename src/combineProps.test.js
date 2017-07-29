import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import 'rxjs/add/operator/take';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/toArray';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/interval';

import { combineProps } from './combineProps';

describe('combineProps', () => {
  it('works correctly for no argumenes', (done) => {
    combineProps()
      .toArray()
      .subscribe(v => {
        expect(v).toMatchSnapshot();
        done();
      });
  });

  it('works correctly for empty argumenes', (done) => {
    combineProps({}, {}, {})
      .toArray()
      .subscribe(v => {
        expect(v).toMatchSnapshot();
        done();
      });
  });

  it('works correctly when props are passed', (done) => {
    combineProps({}, {}, { a: 1 })
      .toArray()
      .subscribe(v => {
        expect(v).toMatchSnapshot();
        done();
      });
  });

  it('works correctly for observables', (done) => {
    combineProps({
      a: Observable.of(1),
      b: Observable.of(2),
    }, {}, {})
      .toArray()
      .subscribe(v => {
        expect(v).toMatchSnapshot();
        done();
      });
  });

  it('works correctly observers', (done) => {
    const a$ = new BehaviorSubject(0);
    combineProps({}, {
      a: a$,
    }, {})
      .toArray()
      .subscribe(v => {
        expect(v).toMatchSnapshot();
        v[0].a(123);
        expect(a$.value).toBe(123);
        done();
      });
  });

  it('ignores $ suffix', (done) => {
    const a$ = new BehaviorSubject(0);
    combineProps({
      b$: Observable.of(1),
    }, {
      a$,
    }, {})
      .toArray()
      .subscribe(v => {
        expect(v).toMatchSnapshot();
        v[0].a(123);
        expect(a$.value).toBe(123);
        expect(v[0].b).toBe(1);
        done();
      });
  });

  it('works for complete sample', (done) => {
    const b$ = new BehaviorSubject(0);
    combineProps({
      a$: Observable.of(1),
      b$,
    }, {
      onB: b$,
    }, {
      c: 1,
      d: 2,
    })
      .do(({ onB }) => setTimeout(onB, 1, 1))
      .take(2)
      .toArray()
      .subscribe(v => {
        expect(v).toMatchSnapshot();
        done();
      });
  });
});
