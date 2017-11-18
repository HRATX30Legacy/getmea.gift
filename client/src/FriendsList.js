import AppBar from 'material-ui/AppBar';
import Divider from 'material-ui/Divider';
import MenuItem from 'material-ui/MenuItem';
import DropDownMenu from 'material-ui/DropDownMenu';
import Paper from 'material-ui/Paper';
import React from 'react';
import axios from 'axios';

export default class FriendsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      friends: [],
      pending: []
    };
    this.retrieveFriends = this.retrieveFriends.bind(this);
    this.acceptFriendRequest = this.acceptFriendRequest.bind(this);
    this.denyFriendRequest = this.denyFriendRequest.bind(this);
  }

  componentWillMount() {
    this.retrieveFriends();
  }

  retrieveFriends() {
    let pending = [];
    let friends = [];
    let userDataFriends = this.props.userData.friends;
    for (let user in userDataFriends) {
      axios
        .post('api/search', {
          searchMethod: 'id',
          userInput: user
        })
        .then(foundUser => {
          if (userDataFriends[user].friendStatus === 'pending') {
            pending.push(foundUser.data);
          } else if (userDataFriends[user].friendStatus === 'friend') {
            friends.push(foundUser.data);
          }
          console.table(pending);
          this.setState({
            pending: pending,
            friends: friends
          });
        })
        .catch(err => {
          console.log('Handle search error: ', err);
        });
    }
  }

  acceptFriendRequest(e) {
    console.log('Accepted friend request');
    axios.post('/acceptFriendRequest', {
      acceptUser_id: this.props.userData._id,
      requestUser_id: e.target.value
    }).then((message) => {
      console.log('Message: ', message);
      this.forceUpdate();
    });
  }

  denyFriendRequest(e) {
    console.log('Denied friend request');
  }

  render() {
    return (
      <div className="friends-list">
        <Paper>
          <AppBar title="Pending" iconElementLeft={<div />} />
          {this.state.pending.map((pendingFriend, index) => {
            console.log(pendingFriend.firstName);
            return (
              <div>
                  <DropDownMenu
                  value={pendingFriend.firstName}
                  autoWidth={true}
                  style={{'width':'200px'}}
                >
                  <MenuItem
                    value={'add-friend'}
                    primaryText={'Add'}
                    onClick={this.acceptFriendRequest}
                  />
                </DropDownMenu>
              </div>
            );
          })}
          <AppBar title="All Friends" iconElementLeft={<div />} />
          {this.state.friends.map((friend, index) => {
            return (
              <MenuItem
                key={'friend-' + index}
                value={friend._id}
                primaryText={friend.firstName + ' ' + friend.lastName}
                rightIcon={<span><b>XXXX</b></span>}
              />
            );
          })}
        </Paper>
      </div>
    );
  }
}
