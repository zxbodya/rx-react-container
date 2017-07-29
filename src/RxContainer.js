import React from 'react';
import PropTypes from 'prop-types';

export class RxContainer extends React.Component {
  constructor(props) {
    super();
    this.state = { props: props.initialState };
    this.subscription = null;
  }

  componentWillMount() {
    this.subscription = this.props.observable.subscribe(props => {
      this.setState({ props });
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.observable !== this.props.observable) {
      this.subscription.unsubscribe();
      this.setState({ props: nextProps.initialState });
      this.subscription = nextProps.observable.subscribe(props => {
        this.setState({ props });
      });
    }
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  render() {
    return React.createElement(this.props.component, this.state.props);
  }
}

RxContainer.propTypes = {
  component: PropTypes.func.isRequired,
  observable: PropTypes.object.isRequired,
  initialState: PropTypes.object.isRequired,
};
