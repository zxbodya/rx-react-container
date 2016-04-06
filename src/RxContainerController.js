import React from 'react';

class RxContainerController extends React.Component {
  constructor(props) {
    super();
    this.state = { props: props.initialState };
    this.subscribtion = null;
  }

  componentDidMount() {
    this.subscribtion = this.props.observable.subscribe(props => {
      this.setState({ props });
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.observable !== this.props.observable) {
      this.subscribtion.dispose();
      this.setState({ props: nextProps.initialState });
      this.subscribtion = nextProps.observable.subscribe(props => {
        this.setState({ props });
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
        {...this.state.props}
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
