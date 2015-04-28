'use strict';

const React = require('react');

const objectObserver = require('./observableObject');

function createRxComponent(Element, observables = {}, observers = {}, props = {}) {

  const propsObservable = objectObserver(observables);

  const callbacks = {};

  Object.keys(observers).forEach(key=> {
    callbacks[key] = (value)=>observers[key].onNext(value);
  });

  return propsObservable.map((state)=> {
    return (
      <Element {...props} {...state} {...callbacks}/>
    );
  });
}

module.exports = createRxComponent;
