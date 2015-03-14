'use strict';

var createObserver = (context, stateKey) => {
  return value => {
    var partialState = {};
    partialState[stateKey] = value;
    context.setState(partialState);
  }
};

var autoSubscribeMixin = (autoSubscribeProps)=> {
  function updateSubscriptions(context, props, nextProps) {
    var partialState;
    for (var key in autoSubscribeProps) {
      var prop = nextProps[key];
      if (prop !== props[key]) {
        if (key in context._autoSubscribeObs) {
          context._autoSubscribeObs[key].dispose();
        }
        var conf = autoSubscribeProps[key];
        var stateKey = conf[0];
        if (prop.subscribe) {
          partialState = {};
          partialState[stateKey] = conf[1];
          context.setState(partialState);
          context._autoSubscribeObs[key] = prop.subscribe(createObserver(context, stateKey));
        } else {
          partialState = {};
          partialState[stateKey] = prop;
          context.setState(partialState);
        }
      }
    }
  }

  return {
    getInitialState() {
      var initialState = {};

      for (var key in autoSubscribeProps) {
        var conf = autoSubscribeProps[key];
        initialState[conf[0]] = conf[1];
      }

      return initialState;
    },

    componentWillMount() {
      this._autoSubscribeObs = {};
      updateSubscriptions(this, {}, this.props);
    },
    componentWillReceiveProps(nextProps) {
      updateSubscriptions(this, this.props, nextProps);
    },
    componentWillUnmount() {
      for (var key in autoSubscribeProps) {
        if (key in this._autoSubscribeObs) {
          this._autoSubscribeObs[key].dispose();
        }
      }
    }
  };
};

module.exports = autoSubscribeMixin;
