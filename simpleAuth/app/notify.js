var React = require('react');
var {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  DeviceEventEmitter
} = require('react-native');
var dismissKeyboard = require('dismissKeyboard');


module.exports = React.createClass({
  getInitialState: function() {
    return {
      message: '',
      viewOffset: new Animated.Value(0)
    };
  },
  render: function() {
    return (
      <Animated.View style={[styles.container, {marginTop: this.state.viewOffset}]}>
        <View>
          <Text style={styles.notify}>Notify {this.props.data.receiver}</Text>
        </View>
        <View>
          <TextInput
            style={styles.input}
            value={this.state.message}
            multiline={true}
            autoFocus={true}
            onChangeText={(val) => this.setState({message: val})}
          />
        </View>
        <View>
          <TouchableOpacity
            style={styles.send}
            onPress={() => {
              dismissKeyboard();
              this.props.navigator.pop();
            }}
            >
            <Text style={styles.sendText}>
              Send
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  },
  componentDidMount: function() {
    DeviceEventEmitter.addListener('keyboardWillShow', () => {
      Animated.timing(this.state.viewOffset, {
        toValue: -300,
        duration: 100
      }).start();
    });
    DeviceEventEmitter.addListener('keyboardWillHide', () => {
      Animated.timing(this.state.viewOffset, {
        toValue: 0,
        duration: 100
      }).start();
    });
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#272822'
  },
  notify: {
    fontSize: 30,
    color: '#fff'
  },
  input: {
    width: 300,
    height: 200,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#fff',
    color: '#fff',
    overflow: 'hidden',
    padding: 10,
    margin: 10,
    fontSize: 19,
    backgroundColor: '#49483E'
  },
  send: {
    borderWidth: 2,
    borderRadius: 5,
    borderColor: '#0083ef',
    width: 110,
    height: 40,
    backgroundColor: '#1f91ef',
  },
  sendText: {
    fontSize: 30,
    textAlign: 'center',
    color: '#fff'

  }
});
