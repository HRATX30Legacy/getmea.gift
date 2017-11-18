import React, { Component } from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import {
  Table,
  TableBody,
  TableRow,
  TableRowColumn,
  FlatButton,
  Dialog
} from 'material-ui';
import IconButton from 'material-ui/IconButton';
import Paper from 'material-ui/Paper';
import IconMenu from 'material-ui/IconMenu';
import NavigationExpandMoreIcon from 'material-ui/svg-icons/navigation/expand-more';
import MenuItem from 'material-ui/MenuItem';
import AppBar from 'material-ui/AppBar';
import Divider from 'material-ui/Divider';
import Delete from 'material-ui/svg-icons/action/delete';
import Visibility from 'material-ui/svg-icons/action/visibility';
import VisibilityOff from 'material-ui/svg-icons/action/visibility-off';
import Lock from 'material-ui/svg-icons/action/lock';
import Unlock from 'material-ui/svg-icons/action/lock-open';
import { Tabs, Tab } from 'material-ui/Tabs';
import Subheader from 'material-ui/Subheader';

import PersonAdd from 'material-ui/svg-icons/social/person-add';
import AddCircle from 'material-ui/svg-icons/content/add-circle';

import AddItem from './AddItem';
import AddList from './AddList';
import FriendsList from './FriendsList';
import BuyGiftModal from './BuyGiftModal';
import Share from './Share';
import EntryList from './EntryList';
import WishlistEntryGridList from './WishlistEntryGridList';

import axios from 'axios';

import giftImage from './img/gift.png';

import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';

const style = {

  backgroundStyle: {
    backgroundColor: '#ffffff',
    height: '110%',
    paddingBottom: 40
  },
  images: {
    maxHeight: 120,
    maxWidth: '100%'
  },
  username: {
    position: 'absolute',
    top: 0,
    fontSize: 16,
    fontWeight: 400,
  }
};

// const FriendsList = props => {
//   console.log(props.userData);
//
//
//
//   return (
//     <div className="friends-list">
//       <Paper>
//         <AppBar
//           title="Pending"
//           iconElementLeft={<div></div>}
//           />
//           <MenuItem key="1" primaryText="it's me" />
//           <MenuItem key="2" primaryText="hello" />
//           <Divider />
//           <MenuItem key="3" primaryText="it's me" />
//           <AppBar
//           title="All Friends"
//           iconElementLeft={<div></div>}
//           />
//           <MenuItem key="4" primaryText="hello" />
//           <Divider />
//           <MenuItem key="5" primaryText="it's me" />
//       </Paper>
//     </div>
//   );
// };

class WishListPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userData: null,
      currentList: null,
      currentListOwner: null,
      purchasedItems: [],
      wantedItems: [],
      deleteOpen: false,
      shareOpen: false,
      addListOpen: false,
      showPurchased: false
    }
  }

  componentDidMount() {
    this.getUserData();
  }

  // toggles list from private to public
  toggleListType() {
      axios.put('/api/lists/'+this.state.currentList._id, {
        secret: !this.state.currentList.secret
      }).then((res) => {
        this.setState({
          currentList: res.data
        })
      })
    }

  showPurchased() {
    this.setState({ showPurchased: true });
  }

  showWanted() {
    this.setState({ showPurchased: false });
  }

  // API call to fetch user data
  getUserData() {
    //get the username from the url
    var username = this.props.match.params.username;
    //get the list_id from the url
    var list_id = this.props.match.params.list_id;
    var currentList;

    //fetch the data of the username
    axios("/api/users/"+username)
    .then((res)=>{
      return res.data;
    })
    .then((res)=>{

      //if a list was requested try to find that list
      if (list_id){
        //find the specific list and set it to currentList
        currentList = res.wishlists.filter((list) => {
          return list._id === list_id;
        })[0];

        //if the requested list isn't found then redirect back to user
        if (!currentList) {
          this.props.history.push('/'+username)
        }
      } else {
        //if no list is specified just set currentList the first wishlist
        currentList = res.wishlists[0];
      }

      if (currentList) {
        // filter and push to wanted or purchasedItems arrays
        var wantedItems = currentList.items.filter( (item) => {
          return item.purchased === false;
        });

        var purchasedItems = currentList.items.filter( (item) => {
          return item.purchased === true;
        });

        //update the state
        this.setState({
          userData: res,
          currentList: currentList,
          currentListOwner: username,
          wantedItems: wantedItems,
          purchasedItems: purchasedItems
        });
      }

    })
    .catch((err) => {
      console.log(err);
    })
  }

  renderList() {
    if (this.state.currentList) {
      this.state.wantedItems = this.state.currentList.items.filter( (item) => {
        return item.purchased === false;
      });

      this.state.purchasedItems = this.state.currentList.items.filter( (item) => {
        return item.purchased === true;
      });
    }
    var isListOwner = false;
    if (this.state.currentList){
       isListOwner = this.props.currentUser._id === this.state.currentList.user_id;
    }
    var list = this.state.showPurchased ? this.state.purchasedItems : this.state.wantedItems;
    // if (list.length > 0) {

      return (
        <WishlistEntryGridList list={list} addItem={<AddItem list={this.state.currentList} getdata={this.getUserData.bind(this)} />} />


        // <div>
        //   <EntryList list={list} addListComponent={<AddItem list={this.state.currentList} getdata={this.getUserData.bind(this)}/>}/>
        //   {/* { /* Displays the AddItem button only if currentList belongs to currentUser
        //   isListOwner &&
        //   } */}
        // </div>
      );
      // )
                    //         list.map((row, index) => (
                    //   <TableRow hoverable={true} key={index}>
                    //     <TableRowColumn style={{fontSize: 18, width: '25%'}}>{row.title}</TableRowColumn>
                    //     <TableRowColumn  style={{fontSize: 18}}>${row.price}</TableRowColumn>
                    //     <TableRowColumn style={{color: 'white'}} >
                    //     {!row.purchased &&
                    //       <BuyGiftModal
                    //         primary={this.props.muiTheme.palette.primary1Color}
                    //         item={row}
                    //         index={index}
                    //         getUserData={this.getUserData.bind(this)}
                    //         isListOwner={isListOwner}
                    //         userData={this.state.userData}
                    //       />
                    //     }
                    //     </TableRowColumn>
                    //     <TableRowColumn hoverable={true} style={{ height: 140}}>
                    //       {
                    //         row.image_url && <Paper style={{marginTop: 10, maxHeight: 120, textAlign:'center'}} zDepth={1} >
                    //           <img alt={''} style={style.images} src={row.image_url}/>
                    //         </Paper>
                    //       }
                    //     </TableRowColumn>
                    //   </TableRow>
                    // ))

    // } else {
    //   return <div><img style={{height: 150, width: 150, padding: 20, paddingBottom: 0, filter: 'grayscale(100%)'}} src={giftImage} alt='none'/>
    //           <h4 style={{padding: 0, color: 'grey'}}>No Items Here</h4>
    //         </div>
    // }
  }

  renderMessages() {
    //changed just now
    if (this.state.currentList) {
      var username = this.props.match.params.username;

      if (this.state.currentList.items && this.state.currentList.items.length >= 0) {
        return (

          this.state.userData.wishlists.map((list, index) => {
            return (
              <MenuItem
                key={index}
                rightIcon={list.secret ? <VisibilityOff /> : <Visibility />}
                primaryText={list.title}
                onClick={ () => {
                  this.props.history.push('/'+username+'/'+list._id);
                  this.setState({currentList: list});
                }} />
            )})
          )
      }
    }
  }

  goToList(list_id) {
    this.props.history.push('/'+this.props.match.params.username+'/'+list_id);
  }

  handleDelete() {
    axios.delete('/api/lists/'+this.state.currentList._id)
    .then((res) => {
      console.log(res.data);
      this.setState({
        deleteOpen: false
      })
      this.props.history.push('/'+this.props.match.params.username)
    })
  }

  handleDeleteOpen() {
    this.setState({
      deleteOpen: true
    })
  }

  handleDeleteClose() {
    console.log(this);
    this.setState({
      deleteOpen: false
    })
  }

  handleShareOpen() {
    this.setState({
      shareOpen: true
    })
  }

  handleShareClose() {
    this.setState({
      shareOpen: false
    })
  }

  handleAddListOpen() {
    this.setState({
      addListOpen: true
    })
  }

  handleAddListClose() {
    this.setState({
      addListOpen: false
    })
  }

  render() {

    const showTitle = () => {
      if (this.state.currentList) {
        return (
          <div>
            <input
              type="text"
              value={this.state.currentList.title}
              onChange={(e) => {
                // Copy current list into a new one to set state of current list to new one.
                var newCurrentList = Object.assign({}, this.state.currentList);
                newCurrentList.title = e.target.value;
                // Iterate through user's wishlists and find the wishlist that matches the current one.
                for (var n = 0; n < this.state.userData.wishlists.length; n++) {
                  if (this.state.currentList._id === this.state.userData.wishlists[n]._id) {
                    break;
                  }
                }
                // Change the title of the wishlist on the user data by copying the object (not by reference) and changing the title.
                var newUserData = Object.assign({}, this.state.userData);
                newUserData.wishlists[n].title = e.target.value;
                this.setState({currentList: newCurrentList, userData: newUserData});
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  console.log(this.state.currentList.title);
                  console.log(this.state.currentList);
                  // Send new data to be changed to the database by interacting with the server.
                  axios.put('/api/lists/'+this.state.currentList._id, {
                    secret: !this.state.currentList.secret,
                    title: this.state.currentList.title
                  }).then((res) => {
                    this.setState({ currentList: res.data});
                  });
                }
              }}
              // Because this is an input text field, certain styles must be removed, and certain styles must be added to mimic the original title style.
              style = {{
                'textAlign': 'center',
                'outline': 'none',
                'background': 'none',
                'border': 'none',
                'fontFamily': 'Asap, sans-serif',
                'fontSize': '24px',
                'fontWeight': '400',
                'color': 'rgb(255, 255, 255)',
                'lineHeight': '64px',
                'width': 'auto',
                'minWidth':'2px'
              }}
              // After hitting 'enter', change the name in the database. Create character limit. Make it so that
            ></input>
            <br/>
            <div style={style.username}>{this.props.match.params.username.toUpperCase()}</div>
          </div>
        )
      }
    }

    if (this.state.currentList) {
      this.state.wantedItems = this.state.currentList.items.filter( (item) => {
        return item.purchased === false;
      });

      this.state.purchasedItems = this.state.currentList.items.filter( (item) => {
        return item.purchased === true;
      });
    }

    var isListOwner = false;
    if (this.state.currentList){
       isListOwner = this.props.currentUser._id === this.state.currentList.user_id;
    }

    const deleteActions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onClick={this.handleDeleteClose.bind(this)}
      />,
      <FlatButton
        label="Delete List"
        secondary={true}
        onClick={this.handleDelete.bind(this)}
      />,
    ];

    const topRightMenu = (
      this.state.currentList && <IconMenu iconButtonElement={
        <IconButton>
          <NavigationExpandMoreIcon />
        </IconButton>
      }>

        {/* Don't show unless user is list owner */}
        {isListOwner && <MenuItem rightIcon={this.state.currentList.secret ? <Unlock /> : <Lock />} onClick={()=>{this.toggleListType()}} primaryText={this.state.currentList.secret ? 'Make List Public' : 'Make List Private'} /> }
        {isListOwner && <MenuItem primaryText="Delete List" rightIcon={<Delete />} onClick={this.handleDeleteOpen.bind(this)} /> }
        {isListOwner && !this.state.currentList.secret && <MenuItem primaryText="Share" rightIcon={<PersonAdd />} onClick={this.handleShareOpen.bind(this)}/> }
        {isListOwner && <MenuItem primaryText="Create New List" rightIcon={<AddCircle />} onClick={this.handleAddListOpen.bind(this)}/> }
        <Divider />
        <Subheader>{this.state.currentListOwner}'s Other Wishlists </Subheader>

        {this.renderMessages()}

      </IconMenu>
    );

    var list = this.state.showPurchased ? this.state.purchasedItems : this.state.wantedItems;

    return (
      this.state.currentList && <div className="container" style={style.backgroundStyle}>
        <div className="startContainer"
        style={{
          'display':'flex',
          'flex-direction':'row',
          maxWidth: '1400px'
        }}>
          <div className="wishlist-list-sidebar"
          style={{
            'flex':'1'
          }}>
            <Paper className="leftSideWishlistPaper" style={{maxWidth: 400, marginTop: '50px', marginLeft:"10px"}}>
              <AppBar title={`${this.state.currentListOwner}'s Lists`}
                  style={{maxWidth: 400}}>
              </AppBar>
              <div className="wishlistsOnLeft">
                {this.renderMessages()}
              </div>
            </Paper>
          </div>
          <div className="wishlistContainer" style={{'flex':'4', textAlign: 'center', margin: 'auto', paddingTop: 50, maxWidth: 800, marginLeft: 10}} >
            <div>
              <AppBar title={showTitle()}
                iconElementRight={topRightMenu}
                iconElementLeft={
                  this.state.currentList.secret
                    ? (<IconButton tooltip="Private List" touch={true} tooltipPosition="bottom-center">
                      <VisibilityOff style={{padding: 12}}/>
                    </IconButton>)
                    : (<IconButton tooltip="Public List" touch={true} tooltipPosition="bottom-center">
                      <Visibility style={{padding: 12}} />
                    </IconButton>)
                }
              ></AppBar>
              <Tabs>
                <Tab onActive={this.showWanted.bind(this)} label="Wanted Items" />
                <Tab onActive={this.showPurchased.bind(this)} label="Purchased Items" />
              </Tabs>
            </div>


            <AddList
              list={this.state.currentList}
              getdata={this.getUserData.bind(this)}
              open={this.state.addListOpen}
              onRequestClose={this.handleAddListClose.bind(this)}
              handleClose={this.handleAddListClose.bind(this)}
              state={this.state}
            />

            <Share
              user={this.props.currentUser}
              list={this.state.currentList}
              open={this.state.shareOpen}
              onRequestClose={this.handleShareClose.bind(this)}
              handleClose={this.handleShareClose.bind(this)}
            />

            <Dialog
              actions={deleteActions}
              modal={false}
              open={this.state.deleteOpen}
              onRequestClose={this.handleDeleteClose.bind(this)}
            >
              Are you sure you want to delete this list?
            </Dialog>

            <div className="paperContainer">
              <Paper zDepth={2}>
                <Table>
                  <TableBody
                    displayRowCheckbox={false}
                  >
                    { this.renderList() }
                  </TableBody>
                </Table>
              </Paper>
            </div>
          </div>

          <div className="friends-container" style={{flex:'2', marginLeft: '10px', marginTop: '50px', marginRight: '10px'}}>
            <FriendsList userData={this.state.userData} refresh={this.getUserData.bind(this)}/>
          </div>


        </div>
      </div>
    );
  }
}

export default muiThemeable()(WishListPage);
