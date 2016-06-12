var React = require('react');
var Keyboard = require('Keyboard');
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
import Notify from './notify';


var pics = [
    'http://coolspotters.com/files/photos/910773/spongebob-squarepants-profile.jpg',
    'http://cdn.bleacherreport.net/images_root/users/photos/002/561/373/iloveyou_crop_150x150.png?1381122847',
    'https://lh5.googleusercontent.com/-_ukxyc8gYIo/AAAAAAAAAAI/AAAAAAAAAJ0/fLYJaFe3GDg/w800-h800/photo.jpg',
    'http://www.jewornotjew.com/img/people/m/mr__krabs.jpg',
];


var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
module.exports = React.createClass({
  getInitialState() {
    return {
      posts: {},
      userList: {},
      userArr: [],
      userId: '',
      email: '',
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
      },
      viewOffset: new Animated.Value(0),
      annotations: []
    }
  },

  componentDidMount() {
    this.makeSubscription();
    this.makeULSubscription();
    // this.observePosts();
    this.observeUserList();
    DeviceEventEmitter.addListener('keyboardWillShow', (e) => {
      Animated.timing(this.state.viewOffset, {
        toValue: -300,
        duration: 100
      }).start();
    });

    DeviceEventEmitter.addListener('keyboardWillHide', (e) => {
      Animated.timing(this.state.viewOffset, {
        toValue: 0,
        duration: 100
      }).start();
    });

    this.location();
    // setInterval()
    // var changeLocation = window.setInterval(() => {this.location()}, 10000);
  },

  // observePosts() {
  //   // console.log('observing posts');
  //   AsyncStorage.getItem('userId', (err, result) => {
  //     this.setState({
  //       userId: result
  //     })
  //   })
  //   let observer = ddpClient.observe("posts");
  //   observer.added = (id) => {
  //     this.setState({posts: ddpClient.collections.posts})
  //   }
  //   observer.changed = (id, oldFields, clearedFields, newFields) => {
  //     this.setState({posts: ddpClient.collections.posts})
  //   }
  //   observer.removed = (id, oldValue) => {
  //     this.setState({posts: ddpClient.collections.posts})
  //   }
  // },

  observeUserList() {
    // console.log('observing userList');
    AsyncStorage.getItem('userId', (err, result) => {
      this.setState({
        userId: result
      })
    })
    let ulobserver = ddpClient.observe("userList");
    ulobserver.added = (id) => {
      this.setState({userList: ddpClient.collections.userList})
      // console.log('ddpClient.collections.userList', ddpClient.collections.userList);
      let userList = ddpClient.collections.userList;

      // set email
      // console.log('email', userList);
      var myEmail = '';
      for (var key in userList) {
        if (userList[key].userId==this.state.userId) {
          myEmail = userList[key].email;
          this.setState({
            email: myEmail.match(/(.+)@/)[1]
          })
        }
      }
      // console.log('email', myEmail);
      var userArr = [];
      var count = 0;
      for (var i in userList) {
        userList[i].index = count;
        userArr.push(userList[i]);
        count++;
      }
      this.setState({userArr: userArr});
      this.setState({dataSource: ds.cloneWithRows(userArr)});
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
    var annotations = this.state.userArr.map((val) => {
      return {
        latitude: val.latitude,
        longitude: val.longitude,
        title: val.email.match(/(.+)@/)[1]
      };
    });

    // this.setState({
    //   annotations: annotations
    // })

    let count = Object.keys(this.state.posts).length;

    return (
      <Animated.View style={[styles.container, {marginTop: this.state.viewOffset}]}>
        <StatusBar
          hidden={true}
        />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.signOut}
            onPress={this.handleSignOut}
            >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
          <View style={styles.userName}>
            <Text style={styles.userNameText}>{this.state.email}</Text>
          </View>
          <View style={styles.signOut}></View>
        </View>


        <MapView
          style={styles.map}
          annotations={
            annotations
          }
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
                  dataSource: ds.cloneWithRows(this.state.userArr.filter((val) => {
                    // var email = val.email;
                    var regex = new RegExp(text.toLowerCase());
                    return regex.test(val.email.toLowerCase());
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
    var email = row.email ? row.email.match(/(.+)@/)[1] : null;
    var picIndex = row.index < pics.length ? row.index : row.index %= pics.length;

    return (
      <View style={styles.row}>
       <Image
         source={{uri: pics[picIndex]}}
         style={styles.profilePic}
       />
       <View style={{flexDirection: 'column'}}>
         <Text style={styles.rowName}>
           {email}
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
  },
  header: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#272822'
  },
  signOut: {
    flex: 1,
    alignSelf: 'center',
  },
  signOutText: {
    fontSize: 16,
    color: '#757363',
    marginLeft: 5
  },
  userName: {
    flex: 2,
    justifyContent: 'center'
  },
  userNameText: {
    fontSize: 20,
    alignSelf: 'center',
    margin: 7,
    color: '#757363'
  },
  posText: {
    color: '#757363',
    marginLeft: 10
  },
  map: {
    flex: 10,
  },
  nav: {
    flex: 8,
    backgroundColor: '#272822',
  },
  search: {
    height: 50,
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
