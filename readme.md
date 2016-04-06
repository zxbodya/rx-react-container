## Rx React Container 

[![Build Status](https://travis-ci.org/zxbodya/rx-react-container.svg?branch=master)](https://travis-ci.org/zxbodya/rx-react-container)

Allows to use React as a view layer for RxJS application, and to wait for required data before first rendering. 

Works by wrapping React Component into container that:

 * passes data form observables
 * connects component to observers via callbacks

Also it is super useful when doing isomorphic apps - it allows to wait for data before first render(actually it was one of my biggest reasons to make this library).

If you are interested in history of this library - look at [gist about it](https://gist.github.com/zxbodya/20c63681d45a049df3fc).

First place where it is already used is my [reactive-widgets](https://github.com/zxbodya/reactive-widgets) project.

### Installation

`npm install rx-react-container --save`
 
### Documentation

Module exports function:

`createContainer(Component, observables, observers, props)`

Where:

- `Component` react component to wrap
- `observables` observables with data for component
- `observers` observers to be passed as callbacks to component 
- `props` props to pass directly to component 

In `observers` and `observables` key names it supports `$` 
suffix popularized by Cycle.js ([What does the suffixed dollar sign `$` mean?](http://cycle.js.org/basic-examples.html#what-does-the-suffixed-dollar-sign-mean)). 
For example if you pass `name$` stream - data from it would be passed as `name`. 

It will create an observable, that will return function for rendering virtual dom with container component.
 
Container component has state - it is equal to latest combination of data from `observables`, and will be updated if state changes.

Also container will correctly dispose subscription to observables when unmounted from DOM.   
 
### Example:

```JS
import React from 'react';
import {render} from 'react-dom';

import {Subject, Observable} from 'rx';
import createContainer from 'rx-react-container';

const plusOne$ = new Subject();
const minusOne$ = new Subject();

const totalCount$ = Observable
  .merge(
    plusOne$.map(() => +1),
    minusOne$.map(() => -1)
  )
  .startWith(0)
  .scan((acc, x) => acc + x, 0);

const App = ({plusOne, minusOne, totalCount}) => {
  return (
    <div>
      <button onClick={minusOne}>-</button>
      [{totalCount}]
      <button onClick={plusOne}>+</button>
    </div>
  );
};

const app$ = createContainer(App, {totalCount$}, {plusOne$, minusOne$});

const appElement = document.getElementById('app');

app$.forEach(renderApp=>render(renderApp(), appElement));

```
