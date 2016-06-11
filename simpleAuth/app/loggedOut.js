var React = require('react');
var {
  View,
  Text,
  TextInput,
  StyleSheet,
  AsyncStorage,
  Image
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
        <View style={styles.containerToMid}>
          <Image
            source={require('../assets/sendAll.png')}
            style={styles.topLogo}
          />
        </View>
        <TextInput
          style={styles.input}
          ref="email"
          onChangeText={(email) => this.setState({email: email})}
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor='gray'
          placeholder="Email"
        />
        <TextInput
          style={styles.input}
          ref="password"
          onChangeText={(password) => this.setState({password: password})}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Password"
          placeholderTextColor='gray'
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
    backgroundColor: '#49483E',
    borderColor: 'gray',
    color: 'white',
    borderWidth: 1,
    borderRadius: 5
  },
  text: {
    color: 'gray'
  },
  topLogo: {
    width: 100,
    height: 100,
    marginBottom: 20
  },
  containerToMid: {
    alignItems: 'center'
  }
})
