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
  Geolocation
} = require('react-native');

// var friends = [
//   {
//     name: 'Spongebob Squarepants',
//     picUrl: 'http://coolspotters.com/files/photos/910773/spongebob-squarepants-profile.jpg',
//     userID: '1'
//   },
//   {
//     name: 'Patrick Star',
//     picUrl: 'http://cdn.bleacherreport.net/images_root/users/photos/002/561/373/iloveyou_crop_150x150.png?1381122847',
//     userID: '1'
//   },
//   {
//     name: 'Squidward Tentacles',
//     picUrl: 'https://lh5.googleusercontent.com/-_ukxyc8gYIo/AAAAAAAAAAI/AAAAAAAAAJ0/fLYJaFe3GDg/w800-h800/photo.jpg',
//     userID: '1'
//   },
//   {
//     name: 'Eugene Krabs',
//     picUrl: 'http://www.jewornotjew.com/img/people/m/mr__krabs.jpg',
//     userID: '1'
//   }
// ];
var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

module.exports = React.createClass({
  propTypes: {
    data: React.PropTypes.object.isRequired
  },
  getInitialState: function() {
    var friends = [];
    //
    // for(var i in this.props.data) {
    //   friends.push(this.props.data[i]);
    // }

    return {
      dataSource: ds.cloneWithRows(friends),
      search: '',
      userLocation: {
        latitude: 37.773972,
        longitude: -122.431297,
      },
      mapRegion: {
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0,
        longitudeDelta: 0
      },
      viewOffset: new Animated.Value(0),
      friends: friends
    };
  },
  render: function() {
    var annotations = this.state.friends.map((val) => {
      return {
        latitude: val.latitude,
        longitude: val.longitude,
        title: val.email.match(/(.+)@/)[1]
      };
    });
    console.log('rendering');
    annotations[annotations.length] = this.state.userLocation;
    console.log('annotations', annotations);

    return (
      <Animated.View style={[styles.container, {marginTop: this.state.viewOffset}]}>
        <StatusBar
          hidden={true}
        />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.signOut}
            onPress={() => console.log('signing out')}
            >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
          <View style={styles.userName}>
            <Text style={styles.userNameText}>username</Text>
          </View>
          <View style={styles.signOut}></View>
        </View>

        <View style={{flex: 18}}>
          <MapView
            style={styles.map}
            annotations={annotations}
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
                    dataSource: ds.cloneWithRows(this.state.friends.filter((val) => {
                      var email = val.email;
                      var regex = new RegExp(text.toLowerCase());
                      return regex.test(email.toLowerCase());
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
        </View>
      </Animated.View>
    );
  },
  renderRow: function(row) {
    return (
      <View style={styles.row}>
        <Image
          source={{uri: 'http://coolspotters.com/files/photos/910773/spongebob-squarepants-profile.jpg'}}
          style={styles.profilePic}
        />
        <View style={{flexDirection: 'column'}}>
          <Text style={styles.rowName}>
            {row.email.match(/(.+)@/)[1]}
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
    );
  },
  componentDidMount: function() {
    _keyboardWillShowSubscription = DeviceEventEmitter.addListener('keyboardWillShow', () => {
      Animated.timing(this.state.viewOffset, {
        toValue: -300,
        duration: 100
      }).start();
    });
    _keyboardWillHideSubscription = DeviceEventEmitter.addListener('keyboardWillHide', () => {
      Animated.timing(this.state.viewOffset, {
        toValue: 0,
        duration: 100
      }).start();
    });
    this.location();
  },
  location() {
    navigator.geolocation.getCurrentPosition(
      location => {
        console.log('user lat', location.coords.latitude);

        this.setState({
          userLocation: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            tintColor: '#3399ff',
            animateDrop: true,
            title: 'You'
          },
          mapRegion: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.14,
            longitudeDelta: 0.14
          }
        });
      },
      error => {
        console.log('error', error);
      });
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
    flex: 1,
    justifyContent: 'center'
  },
  userNameText: {
    fontSize: 20,
    alignSelf: 'center',
    margin: 7,
    color: '#757363'
  },
  map: {
    flex: 10
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
