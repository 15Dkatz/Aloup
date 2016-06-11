// import React, {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet
// } from 'react-native';
var React = require('react');
var {
  Navigator,
  View,
  StyleSheet,
  TouchableOpacity,
  Text
} = require('react-native');

module.exports = React.createClass({
  render() {
    let {text, onPress} = this.props;

    return (
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text>{text}</Text>
      </TouchableOpacity>
    )
  }
});


const styles = StyleSheet.create({
  button: {
    flex: 1,
    backgroundColor: '#eee',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginVertical: 10
  }
});
