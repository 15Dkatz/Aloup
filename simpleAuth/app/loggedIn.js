var React = require('react');
var {
  View,
  Text,
  AsyncStorage,
  ListView,
  StyleSheet
} = require('react-native');

import Button from './button';
import ddpClient from './ddp';

var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
module.exports = React.createClass({
  getInitialState() {



    return {
      posts: {},
      userList: {},
      userId: '',
      userListEmailArr: ['a'],
      dataSource: ds.cloneWithRows(['a', 'b', 'c'])
    }
  },

  componentDidMount() {
    this.makeSubscription();
    this.makeULSubscription();
    this.observePosts();
    this.observeUserList();
  },

  observePosts() {
    console.log('observing posts');
    AsyncStorage.getItem('userId', (err, result) => {
      this.setState({
        userId: result
      })
    })
    let observer = ddpClient.observe("posts");
    observer.added = (id) => {
      this.setState({posts: ddpClient.collections.posts})
      console.log("posts...");
    }
    observer.changed = (id, oldFields, clearedFields, newFields) => {
      this.setState({posts: ddpClient.collections.posts})
    }
    observer.removed = (id, oldValue) => {
      this.setState({posts: ddpClient.collections.posts})
    }
  },

  observeUserList() {
    console.log('observing userList');
    let ulobserver = ddpClient.observe("userList");
    ulobserver.added = (id) => {
      this.setState({userList: ddpClient.collections.userList})
      console.log('ddpClient.collections.userList', ddpClient.collections.userList);
      let userList = ddpClient.collections.userList;
      let userListKeys = Object.keys(this.state.userList);
      let userListEmailArr = [];
      userListKeys.forEach((value) => {
        userListEmailArr.push(userList[value].email);
      })
      // console.log('userList keys', userListArr, 'userList', userList);
      // this.setState({userListEmailArr});
      // ds.cloneWithRows(['a', 'b', 'c'])
      this.setState({dataSource: ds.cloneWithRows(userListEmailArr)});
    }
    ulobserver.changed = (id, oldFields, clearedFields, newFields) => {
      this.setState({userList: ddpClient.collections.userList})
      console.log('ddpClient.collections.userList', ddpClient.collections.userList);
    }
    ulobserver.removed = (id, oldValue) => {
      this.setState({userList: ddpClient.collections.userList})
      console.log('ddpClient.collections.userList', ddpClient.collections.userList);
    }
  },

  makeSubscription() {
    ddpClient.subscribe("posts", [], () => {
      this.setState({posts: ddpClient.collections.posts});
    })
  },

  makeULSubscription() {
    ddpClient.subscribe("userList", [], () => {
      this.setState({userList: ddpClient.collections.userList});
    });
  },

  handleIncrement() {
    console.log('inc');
    ddpClient.call('addPost');
    ddpClient.call('toggleRed');
  },

  handleDecrement() {
    console.log('dec');
    ddpClient.call('deletePost');
    ddpClient.call('toggleGreen');
  },

  handleSignOut() {
    console.log("attempting to sign out in loggedIn.js");
    ddpClient.logout(() => {
      this.props.changedSignedIn(false)
    });
  },

  render() {
    let count = Object.keys(this.state.posts).length;

    return (
      <View>
        <View>
          <Text>UserId: {this.state.userId}</Text>
          <Text>Posts: {count}</Text>
          <Button text="Increment and Red" onPress={this.handleIncrement}/>
          <Button text="Decrement and Green" onPress={this.handleDecrement}/>

          <Button text="Sign Out" onPress={this.handleSignOut}/>
        </View>
        <View>
          <ListView
            style = {styles.container}
            dataSource = {
              this.state.dataSource
            }
            renderRow={this.renderRow}
          />
        </View>
      </View>
    )
  },
  renderRow: function(row) {
    return (
      <View>
        <Text>
          {row}
        </Text>
      </View>
    )
  }
})

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})
