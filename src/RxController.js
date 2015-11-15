import React from 'react';

class RxController extends React.Component {
  constructor(props) {
    super();
    this.state = props.initialState;
  }

  componentDidMount() {
    this.subscribtion = this.props.observable.subscribe((state)=> {
      this.setState(state);
    });
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

RxController.propTypes = {
  component: React.PropTypes.func,
  observable: React.PropTypes.object,
  initialState: React.PropTypes.object,
  props: React.PropTypes.object,
  callbacks: React.PropTypes.object
};

export default RxController;
