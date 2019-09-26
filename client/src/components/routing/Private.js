import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const Private = ({
  component: Component,
  auth: { isAuthenticated, loadding },
  ...rest
}) => (
  <Route
    {...rest}
    render={props =>
      !isAuthenticated && !loadding ? (
        <Redirect to="/login" />
      ) : (
        <Component {...props} />
      )
    }
  />
);

Private.propTypes = {
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.authReducer
});

export default connect(mapStateToProps)(Private);
