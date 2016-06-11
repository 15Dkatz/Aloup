/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry
} from 'react-native';

var App = require('./app');


class simpleAuth extends Component {
  render() {
    return (
      <App />
    );
  }
}

AppRegistry.registerComponent('simpleAuth', () => simpleAuth);
