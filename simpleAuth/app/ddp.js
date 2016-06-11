import DDPClient from 'ddp-client';
import {AsyncStorage} from 'react-native';
let ddpClient = new DDPClient(
  //uncomment below for heroku
  // {
  //    'url': 'ws://limitless-brushlands-79962.herokuapp.com/websocket'
  // }
  // also try IBM Bluemix with mongoLab backend
);

ddpClient.signUpWithEmail = (email, password, cb) => {
  let params = {
    email: email,
    password: password
  };
  AsyncStorage.setItem('email', email);
  console.log("sign up with email in ddp", email, password);
  return ddpClient.call('createUser', [params], cb);
}

ddpClient.signUpWithUsername = (username, password, cb) => {
  let params = {
    username: username,
    password: password
  };

  return ddpClient.call('createUser', [params], cb);
}

ddpClient.loginWithEmail = (email, password, cb) => {
  let params = {
    user: {
      email: email
    },
    password: password
  }
  AsyncStorage.setItem('email', email);
  return ddpClient.call("login", [params], cb)
}

ddpClient.loginWithUsername = (username, password, cb) => {
  let params = {
    user: {
      username: username
    },
    password: password
  };

  return ddpClient.call("login", [params], cb)
}

ddpClient.onAuthResponse = (err, res) => {
  if (res) {
    console.log('authWithResponse res', res);
    let {id, token, tokenExpires} = res;
    ddpClient.call('addToUserList', id);
    ddpClient.call('toggleRed');
    ddpClient.call('addToUserList');
    // ddpClient.call(toggleFunction(true));
    AsyncStorage.setItem('userId', id.toString());
    AsyncStorage.setItem('loginToken', token.toString());
    AsyncStorage.setItem('loginTokenExpires', tokenExpires.toString());
  } else {
    AsyncStorage.multiRemove(['userId', 'loginToken', 'loginTokenExpires'])
  }
}

ddpClient.loginWithToken = (loginToken, cb) => {
  let params = {resume: loginToken};
  return ddpClient.call("login", [params], cb)
}


ddpClient.logout = (cb) => {
  AsyncStorage.multiRemove(['userId', 'loginToken', 'loginTokenExpires']).
    then((res)=>{
      ddpClient.call("logout", [], cb)
    });
}

export default ddpClient;
