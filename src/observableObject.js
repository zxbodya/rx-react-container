'use strict';

const {Observable} = require('rx');

function observableObject(observables) {
  var keys = Object.keys(observables);
  var valueObservables = keys.map(key=>observables[key]);

  if (keys.length === 0) {
    return Observable.never().startWith({});
  }

  return Observable.combineLatest(valueObservables, (...values)=> {
    let res = {};
    for (let i = 0, l = keys.length; i < l; i++) {
      res[keys[i]] = values[i];
    }
    return res;
  });
}

module.exports = observableObject;
