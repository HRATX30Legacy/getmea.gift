import AppBar from 'material-ui/AppBar';
import Divider from 'material-ui/Divider';
import MenuItem from 'material-ui/MenuItem';
import Menu from 'material-ui/Menu';
import DropDownMenu from 'material-ui/DropDownMenu';
import Paper from 'material-ui/Paper';
import React from 'react';
import axios from 'axios';

export default class FriendsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { friends: [], pending: [] };
    this.retrieveFriends = this.retrieveFriends.bind(this);
    this.acceptFriendRequest = this.acceptFriendRequest.bind(this);
    this.denyFriendRequest = this.denyFriendRequest.bind(this);
  }

  componentWillMount() {
    this.retrieveFriends();
  }

  retrieveFriends() {
    // console.log('User data after: ', this.props.userData);
    let pending = [];
    let friends = [];
    let userDataFriends = this.props.userData.friends;
    // console.log('My user data: ', this.props.userData);
    for (let user in userDataFriends) {
      axios
        .post('/api/search', { searchMethod: 'id', userInput: user })
        .then(foundUser => {
          if (userDataFriends[user].friendStatus === 'pending' && userDataFriends[user].initiated === false) {
            pending.push(foundUser.data);
          } else if (userDataFriends[user].friendStatus === 'friend') {
            friends.push(foundUser.data);
          }
          // console.table(pending);
          this.setState({ pending: pending, friends: friends });
        })
        .catch(err => {
          console.log('Handle search error: ', err);
        });
    }
  }

  acceptFriendRequest(requestUser_id) {
    console.log('Accepted friend request');
    console.log('Target value: ', requestUser_id);
    axios
      .post('/api/acceptFriendRequest', {
        acceptUser_id: this.props.userData._id,
        requestUser_id: requestUser_id
      })
      .then(message => {
        console.log('Message: ', message);
        console.log('User data before: ', this.props.userData);
        this.props.refresh();
        setTimeout(this.retrieveFriends, 50);
      });
  }

  denyFriendRequest(requestUser_id) {
    console.log('Denied friend request');
    console.log('Client: Denying user id: ', this.props.userData._id, ' Requested user id: ', requestUser_id);
    axios
      .post('/api/denyFriendRequest', {
        denyUser_id: this.props.userData._id,
        requestUser_id: requestUser_id
      })
      .then(message => {
        console.log('Message: ', message);
        console.log('User data before: ', this.props.userData);
        this.props.refresh();
        setTimeout(this.retrieveFriends, 500);
      });
  }

  render() {
    return (
      <div className="friends-list">
        <Paper>
          <AppBar title="Pending" iconElementLeft={<div />} />
          <Menu desktop={true}>
            {this.state.pending.map((pendingFriend, index) => {
              return (
                <MenuItem
                  key={pendingFriend._id + 'top'}
                  primaryText={pendingFriend.firstName + ' ' + pendingFriend.lastName}
                  leftIcon={<div><img style={{maxWidth: 20, maxHeight: 20}} src={pendingFriend.profilePicURL || "http://static1.squarespace.com/static/522a22cbe4b04681b0bff826/t/581cc65fe4fcb5a68ecd940c/1478280803080/hrhq-avatar.png?format=1000w"}/></div>}
                  menuItems={[
                    <MenuItem
                      value={pendingFriend._id}
                      primaryText="Add"
                      onClick={this.acceptFriendRequest.bind(this, pendingFriend._id)}
                    />,
                    <MenuItem
                      value={pendingFriend._id}
                      primaryText="Reject"
                      onClick={this.denyFriendRequest.bind(this, pendingFriend._id)}
                    />
                  ]}
                />
              );
            })}
          </Menu>
          <AppBar title="All Friends" iconElementLeft={<div />} />
          <Menu desktop={true}>
            {this.state.friends.map((friend, index) => {
              return (
                <MenuItem
                  key={'friend-' + index}
                  value={friend._id}
                  primaryText={friend.firstName + ' ' + friend.lastName}
                  leftIcon={<div><img style={{maxWidth: 50, maxHeight: 20}} src={friend.profilePicURL || "http://static1.squarespace.com/static/522a22cbe4b04681b0bff826/t/581cc65fe4fcb5a68ecd940c/1478280803080/hrhq-avatar.png?format=1000w"}/></div>}
                  rightIcon={<span>X</span>}
                />
              );
            })}
          </Menu>
        </Paper>
      </div>
    );
  }
}
