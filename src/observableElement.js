'use strict';

let Rx = require('rx');
let React = require('react');


const objectObserver = require('./observableObject');

function createRxComponent(Element, observables = {}, observers = {}, props = {}) {

  var propsObservable = objectObserver(observables);

  var callbacks = {};

  Object.keys(observers).forEach(key=> {
    var observer = observers[key];
    callbacks[key] = (value)=>observer.onNext(value);
  });

  return propsObservable.map((state)=> {
    return (
      <Element {...props} {...state} {...callbacks}/>
    );
  });
}

module.exports = createRxComponent;
