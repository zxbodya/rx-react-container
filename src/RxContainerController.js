import React from 'react';

class RxContainerController extends React.Component {
  constructor(props) {
    super();
    this.state = props.initialState;
    this.subscribtion = null;
  }

  componentDidMount() {
    this.subscribtion = this.props.observable.subscribe((state)=> {
      this.setState(state);
    });
  }

  componentWillReceiveProps(props) {
    if (props.observable !== this.props.observable) {
      this.subscribtion.dispose();
      this.setState(props.initialState);
      this.subscribtion = this.props.observable.subscribe((state)=> {
        this.setState(state);
      });
    }
  }

  componentWillUnmount() {
    this.subscribtion.dispose();
  }

  render() {
    const Component = this.props.component;
    return (
      <Component
        {...this.props.props}
        {...this.props.callbacks}
        {...this.state}
      />
    );
  }
}

RxContainerController.propTypes = {
  component: React.PropTypes.func,
  observable: React.PropTypes.object,
  initialState: React.PropTypes.object,
  props: React.PropTypes.object,
  callbacks: React.PropTypes.object,
};

export default RxContainerController;
