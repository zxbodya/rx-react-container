'use strict';

let Rx = require('rx');

function objectObserver(observables) {
  var keys = Object.keys(observables);
  var valueObservables = keys.map(key=>observables[key]);

  if (keys.length === 0) {
    return Rx.Observable.return({});
  }

  return Rx.Observable.combineLatest(valueObservables, (...values)=> {
    let res = {};
    for (let i = 0, l = keys.length; i < l; i++) {
      res[keys[i]] = values[i];
    }
    return res;
  })
}
module.exports = objectObserver;
