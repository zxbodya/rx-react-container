## React Rx Container 

Container to connect React components to Observables and observers.

It allows to easily connect React as a view layer for your rx application.

Also it is super useful when doing isomorphic apps.

### Example:

```JS
import React from 'react';
import {render} from 'react-dom';

import {Subject, Observable} from 'rx';
import RxContainer from 'rx-react-container';

const plusOne = new Subject();
const minusOne = new Subject();

const totalCount = Observable
  .merge(
    plusOne.map(() => +1),
    minusOne.map(() => -1)
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

const app = new RxContainer(App, {totalCount}, {plusOne, minusOne});

const appElement = document.getElementById('app');

app.forEach(renderApp=>render(renderApp(), appElement));

```
