## Rx React Container 

[![Build Status](https://travis-ci.org/zxbodya/rx-react-container.svg?branch=master)](https://travis-ci.org/zxbodya/rx-react-container)
[![codecov.io](https://codecov.io/github/zxbodya/rx-react-container/coverage.svg?branch=master)](https://codecov.io/github/zxbodya/rx-react-container?branch=master)

Provides HoC component, and utilities allowing to transparently connecting RxJS logic to React Component.

Works by wrapping React Component into container that:

 - provides access to props passed to it as observables (both individual, and combinations - see details below)
 - renders wrapped component with data form observable created in controller
 - provides utility to combine observables, observers and static props into one observable of props to be rendered

In previous versions of this library(and, for compatibility reasons, in current) it also provides a function creating Observable with functions returning virtual dom ready to be rendered. 
 Which I was considering useful for doing isomorphic apps - because,
 it allowed to wait for data before first render(actually it was one of reasons to start this project).

But, I suggest new approach with HoC - as better, so `createContainer` is deprecated, and planned to be removed in future.

If you are interested in history behind this - look at [gist about it](https://gist.github.com/zxbodya/20c63681d45a049df3fc).

First place where it was already used is [reactive-widgets](https://github.com/zxbodya/reactive-widgets) project.

### Installation

`npm install rx-react-container --save`

(If you are looking for RxJS 4 version - see version 0.1.4 - `createContainer` only)

```JS
import { connect, combineProps } from 'rx-react-container';

// deprecated createContainer
import createContainer from 'rx-react-container';
```

### Documentation

Basic usage:

```
const ContainerComponent = connect(
  controller: container => Observable<WrappedComponentProps>
)(WrappedComponent)
```

This will create HoC combining controller and React Component.

`controller` here is a function creating observable of properties to be passed to wrapped component. It is called on component creation and receives container component instance as argument.
 
container instance provides few helper methods to access props as observables:

- `getProp(name)` - returning observable of distinct values of specified property
- `getProps(...names)` - returning observable of distinct arrays of values for specified properties

Also there is helper function to combine data into single observable (meant to be used in controller):

`combineProps(observables, observers, props)` 

Where:

- `observables` object with observables with data for component
- `observers` object with observers to be passed as callbacks to component 
- `props` object with props to pass directly to component 

In `observers` and `observables` key names it supports `$` 
suffix popularized by Cycle.js ([What does the suffixed dollar sign `$` mean?](http://cycle.js.org/basic-examples.html#what-does-the-suffixed-dollar-sign-mean)). 
For example if you pass `name$` stream - data from it would be passed as `name`. 

Previous approach:

`createContainer(Component, observables, observers, props)`

It creates an observable of functions rendering virtual dom with container component.
 
Container component has state - it is equal to latest combination of data from `observables`, and is updated when state changes.
 
### Example:

```JS
import React from 'react';
import { render } from 'react-dom';

import { Subject, Observable } from 'rxjs';
import { connect, combineProps } from 'rx-react-container';

function App({ onMinus, onPlus, totalCount, step }) {
  return (
    <div>
      <button onClick={onMinus}>-{step}</button>
      [<span>{totalCount}</span>]
      <button onClick={onPlus}>+{step}</button>
    </div>
  );
}

function appController(container) {
  const onMinus$ = new Subject();
  const onPlus$ = new Subject();

  const click$ = Observable
    .merge(
      onMinus$.map(() => -1),
      onPlus$.map(() => +1)
    );
  const step$ = container.getProp('step');
  
  const totalCount$ = step$
    .switchMap(step => click$.map(v => v * step))
    .startWith(0)
    .scan((acc, x) => acc + x, 0);

  return combineProps({ totalCount$, step$ }, { onMinus$, onPlus$ });
}

const AppContainer = connect(appController)(App);

const appElement = document.getElementById('app');
render(<AppContainer step="1"/>, appElement);

```
