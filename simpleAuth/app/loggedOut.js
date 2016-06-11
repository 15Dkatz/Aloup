var React = require('react');
var {
  View,
  Text,
  TextInput,
  StyleSheet,
  AsyncStorage
} = require('react-native');

import Button from './button';
import ddpClient from './ddp';

module.exports = React.createClass({
  getInitialState() {
    return {
      email: '',
      password: ''
    }
  },

  componentDidMount() {
    AsyncStorage.getItem('loginToken')
      .then((res) => {
        if (res) {
          ddpClient.loginWithToken(res, (err, res) => {
            if (res) {
              this.props.changedSignedIn(true);
            } else {
              this.props.changedSignedIn(false);
            }
          })
        }
      })
  },

  handleSignIn() {
    console.log("attempting sign in with", this.state.email, this.state.password);
    let {email, password} = this.state;
    ddpClient.loginWithEmail(email, password, (err, res) => {
      ddpClient.onAuthResponse(err, res);
      if (res) {
        this.props.changedSignedIn(true);
      } else {
        this.props.changedSignedIn(false);
      }
    });

    this.refs.email.setNativeProps({text: ''});
    this.refs.password.setNativeProps({text: ''});
  },

  handleSignUp() {
    // console.log("attempting sign up with", this.state.email, this.state.password);
    let {email, password} = this.state;
    ddpClient.signUpWithEmail(email, password, (err, res) => {
      ddpClient.onAuthResponse(err, res);
      if (res) {
        this.props.changedSignedIn(true);
        console.log("signed In true", res);
        //pass res into loggedIn
        //where redux comes in
      } else {
        this.props.changedSignedIn(false);
        console.log("signed In false", err);
      }
    });

    this.refs.email.setNativeProps({text: ''});
    this.refs.password.setNativeProps({text: ''});
  },

  render() {
    return (
      <View>
        <TextInput
          style={styles.input}
          ref="email"
          onChangeText={(email) => this.setState({email: email})}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Email"
        />
        <TextInput
          style={styles.input}
          ref="password"
          onChangeText={(password) => this.setState({password: password})}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Password"
          secureTextEntry={true}
        />
      <Button text="Sign In" onPress={this.handleSignIn}/>
      <Button text="Sign Up" onPress={this.handleSignUp}/>
      </View>
    )
  }
});

const styles = StyleSheet.create({
  input: {
    height: 40,
    width: 350,
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'white',
    borderColor: 'gray',
    borderWidth: 1
  }
})
