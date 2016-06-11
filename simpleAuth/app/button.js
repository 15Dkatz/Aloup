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
        <Text style={styles.text}>{text}</Text>
      </TouchableOpacity>
    )
  }
});


const styles = StyleSheet.create({
  button: {
    flex: 1,
    backgroundColor: '#1f91ef',
    borderColor: 'white',
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginVertical: 10,
    borderRadius: 5
  },
  text: {
    color: 'white'
  }
});
