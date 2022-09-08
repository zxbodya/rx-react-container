## Rx React Container 

[![Build Status](https://travis-ci.org/zxbodya/rx-react-container.svg?branch=master)](https://travis-ci.org/zxbodya/rx-react-container)
[![codecov.io](https://codecov.io/github/zxbodya/rx-react-container/coverage.svg?branch=master)](https://codecov.io/github/zxbodya/rx-react-container?branch=master)

Helper utilities allowing to transparently connect RxJS logic to React Component.

Works by wrapping React Component into container that:

 - provides access to props passed to it as observables (both individual, and combinations - see details below)
 - renders wrapped component with data form observable created in controller
 - provides utility to combine observables, observers and static props into one observable of props to be rendered

If you are interested in history behind this - look at [gist about it](https://gist.github.com/zxbodya/20c63681d45a049df3fc).

First project where it was used: [reactive-widgets](https://github.com/zxbodya/reactive-widgets)

### Installation

`npm install rx-react-container --save`

### Usage

Currently there are two ways of using it:
 - with high order components
 - with hooks

High order components:

```ts
const ContainerComponent = connect(
  controller: (propsHelper) => Observable<ResultProps>
)(WrappedComponent)
```

Hooks:

*Warning: hooks version is very new, consider it experimental*

```ts
const resultProps = useRxController(
  controller: (propsHelper) => Observable<ResultProps>,
  props
);
```

In theory, both are equivalent, while hooks one is more compact/flexible.

In both cases `controller` is function creating observable of properties to be rendered.

`propsHelper` argument of it provides few helper methods to access props as observables:

- `getProp(name)` - returning observable of distinct values of specified property
- `getProps(...names)` - returning observable of distinct arrays of values for specified properties

also there are fields with current properties(in some cases this is useful, but generally - better to use helper methods above):

- `props$` - observable with current properties 
- `props` -  getter to get current properties of wrapper component, or what was passed to hook when rendering

To help combining various things into result observable, library also provides helper function to combine data into single observable:

`combineProps(observables, observers, otherProps)` 

Where:

- `observables` object with observables with data for component
- `observers` object with observers to be passed as callbacks to component 
- `props` object with props to pass directly to component 
 
### Example:

```JS
import React from 'react';
import { render } from 'react-dom';

import { Subject, merge } from 'rxjs';
import { connect, combineProps, useRxController } from 'rx-react-container';
import { map, scan, switchMap, startWith } from 'rxjs/operators';

function App({ onMinus, onPlus, totalCount, step }) {
  return (
    <div>
      <button onClick={onMinus}>-{step}</button>[<span>{totalCount}</span>]
      <button onClick={onPlus}>+{step}</button>
    </div>
  );
}

function appController(container) {
  const onMinus$ = new Subject();
  const onPlus$ = new Subject();

  const click$ = merge(
    onMinus$.pipe(map(() => -1)),
    onPlus$.pipe(map(() => +1))
  );
  const step$ = container.getProp('step');

  const totalCount$ = step$.pipe(
    switchMap(step => click$.pipe(map(v => v * step))),
    startWith(0),
    scan((acc, x) => acc + x, 0)
  );

  return combineProps(
    { totalCount: totalCount$, step: step$ },
    { onMinus: onMinus$, onPlus: onPlus$ }
  );
}

const AppContainer = connect(appController)(App);

// same thing with hooks
function HookApp(props) {
  const state = useRxController(appController, props);
  if(!state) return null;
  const { onMinus, onPlus, totalCount, step } = state;
  return (
    <div>
      <button onClick={onMinus}>-{step}</button>[<span>{totalCount}</span>]
      <button onClick={onPlus}>+{step}</button>
    </div>
  );
}

const appElement = document.getElementById('app');
render(<AppContainer step="1" />, appElement);

```
