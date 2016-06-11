var React = require('react');
var {
  StatusBar,
  View,
  StyleSheet,
  MapView,
  ListView,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  Animated,
  DeviceEventEmitter,
  Geolocation,
  AsyncStorage
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
      dataSource: ds.cloneWithRows(['']),
      search: '',
      userLocation: {
        latitude: 37.773972,
        longitude: -122.431297,
        animateDrop: true
      },
      mapRegion: {
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0,
        longitudeDelta: 0
      }
    }
  },

  componentDidMount() {
    this.makeSubscription();
    this.makeULSubscription();
    this.observePosts();
    this.observeUserList();
    // _keyboardWillShowSubscription = DeviceEventEmitter.addListener('keyboardWillShow', (e) => console.log('keyboardWillShow', e));
    // _keyboardWillHideSubscription = DeviceEventEmitter.addListener('keyboardWillHide', (e) => console.log('keyboardWillHide', e));
    this.location();

    // setInterval()
    var changeLocation = window.setInterval(() => {this.location()}, 3000);
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
      // let userListKeys = Object.keys(this.state.userList);
      // let userListEmailArr = [];
      // userListKeys.forEach((value) => {
      //   userListEmailArr.push(userList[value].email);
      // })
      this.setState({dataSource: ds.cloneWithRows(userList)});
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
    // ddpClient.call('toggleRed');
  },

  handleDecrement() {
    console.log('dec');
    ddpClient.call('deletePost');
    // ddpClient.call('toggleGreen');
  },

  handleSignOut() {
    console.log("attempting to sign out in loggedIn.js");
    ddpClient.logout(() => {
      this.props.changedSignedIn(false)
    });
  },

  render() {
    var annotations = this.state.friends.map((val) => {
      return {
        latitude: val.latitude,
        longitude: val.longitude,
        title: val.email.match(/(.+)@/)[1]
      };
    });

    let count = Object.keys(this.state.posts).length;

    return (
      <Animated.View style={styles.container}>
        <View style={styles.header}>
          <Text>UserId: {this.state.userId}</Text>
          <Text>Posts: {count}</Text>
          <Button text="Sign Out" onPress={this.handleSignOut}/>
        </View>
        <MapView
          style={styles.map}
          annotations={[
            this.state.userLocation
          ]}
          region={this.state.mapRegion}
        />
        <View style={styles.nav}>
          <View style={styles.search}>
            <TextInput
              style={styles.searchInput}
              value={this.state.search}
              placeholder={'Search...'}
              placeholderTextColor={'#757363'}
              onChangeText={(text) => {
                this.setState({
                  search: text,
                  dataSource: ds.cloneWithRows(friends.filter((val) => {
                    var regex = new RegExp(text.toLowerCase());
                    return regex.test(val.name.toLowerCase());
                  }))
                })
              }}
            />
          </View>
          <ListView
            style={styles.list}
            dataSource={this.state.dataSource}
            renderRow={this.renderRow}
            enableEmptySections={true}
          />
          <TouchableOpacity>
            <Image
              style={styles.sendAll}
              source={require('../assets/sendAll.png')}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>
    )
  },
  renderRow: function(row) {
    return (
      <View style={styles.row}>
       <Image
         source={{uri: row.picUrl}}
         style={styles.profilePic}
       />
       <View style={{flexDirection: 'column'}}>
         <Text style={styles.rowName}>
           {row.email}
         </Text>
         <Text>
           latitude: {row.latitude}
         </Text>
         <Text>
           longitude: {row.longitude}
         </Text>
         <View style={{flexDirection: 'row'}}>
           <TouchableOpacity style={[styles.button, styles.notify]}>
             <Text style={styles.buttonText}>
               Notify
             </Text>
           </TouchableOpacity>
           <TouchableOpacity style={[styles.button, styles.hide]}>
             <Text style={styles.buttonText}>
               Hide
             </Text>
           </TouchableOpacity>
         </View>
       </View>
     </View>
    )
  },
  location() {
    // console.log("attempting geolocation recall");
    var options = {
    enableHighAccuracy: true,
    // timeout: 50000000,
    // maximumAge: 0
  }
    navigator.geolocation.getCurrentPosition(
      location => {
        console.log('latitude', location.coords.latitude, 'longitude', location.coords.longitude);
        ddpClient.call('changeLocation', [location.coords.latitude, location.coords.longitude]);
        this.setState({
          userLocation: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          },
          mapRegion: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.14,
            longitudeDelta: 0.14
          }
        }
      );
      },
      error => {
        console.log('error', error);
      },
      options
    );
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 0
  },
  header: {
    flex: 1
  },
  map: {
    flex: 3
  },
  nav: {
    flex: 2,
    backgroundColor: '#272822'
  },
  search: {
    flex: 1,
    borderWidth: 1,
    backgroundColor: '#49483E'
  },
  searchInput:{
    flex: 1,
    borderColor: 'yellow',
    fontSize: 20,
    color: '#fff',
    marginLeft: 15
  },
  list: {
    flex: 5
  },
  row: {
    flexDirection: 'row',
    margin: 10
  },
  profilePic: {
    borderRadius: 30,
    height: 60,
    width: 60
  },
  rowName: {
    fontSize: 20,
    marginLeft: 10,
    color: '#fff'
  },
  notify: {
    borderColor: '#0083ef',
    backgroundColor: '#1f91ef',
    width: 160
  },
  hide: {
    borderColor: '#dd111f',
    backgroundColor: '#df6b74',
    width: 80,
    marginLeft: 0
  },
  button: {
    borderWidth: 1,
    margin: 10,
    height: 30,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  sendAll: {
    alignSelf: 'flex-end',
    height: 45,
    width: 45,
    marginTop: -55,
    marginRight: 10
  }
});


// significantly develop web-app tomorrow
