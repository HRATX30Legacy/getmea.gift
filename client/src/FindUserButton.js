import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import axios from 'axios';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import Search from './Search.js'
/**
* A modal dialog can only be closed by selecting one of the actions.
*/
const style = {
  RightBtns: {
      marginTop: 5,
      marginRight: 5
    },
}
export default class FindUserButton extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
      register: false,
      input: '',
      radioButton: 'name',
      foundUsers: [],
      usersFound: false
    };

    this.setStore = (obj) => {
      this.setState(obj);
    };

    this.setStore = this.setStore.bind(this)

    this.handleOpen = () => {
      this.setState({open: true});
    };

    this.handleClose = () => {
      this.setState({open: false});
    };
/*
    this.toggleRegister = () => {
      this.setState({register: !this.state.register})
    };
*/

    this.handleSearch = (e) => {
      e.preventDefault();
      console.log('in handleSearch: ', this.state.input, ' ::::' , this.state.radioButton)
      axios.post('api/search', {
        searchMethod:this.state.radioButton,
        userInput: this.state.input
      })
      .then((users) => {
        console.log('USERS FOUND IN FindUserButton: ', users.data);
        this.setState({foundUsers: users, usersFound: true})
      })
      .catch((err) => {
        console.log('Handle search error: ', err);
      })
    }

    this.handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        this.handleSearch(e);
      }
    }

/*
    this.handleLoginSubmit = (e) => {
      e.preventDefault();
      axios.post('/api/login', {
        username: this.state.username,
        password: this.state.password
      })
      .then((response) => {
        if (response.data) {
          this.props.setCurrentUser(response.data);
          this.setState({open: false});
          if (this.props.history.location.pathname === '/'){
            this.props.history.push('/'+this.state.username)
          }
        }
      })
      .catch(function (error) {
        console.log(error);
      });
    };

    this.handleRegisterSubmit = (e) => {
      e.preventDefault();
      axios.post('api/signup', {
        username: this.state.username,
        password: this.state.password
      })
      .then((response) => {
        if(response.data) {
          this.props.setCurrentUser(response.data);
          this.setState({open: false});
          if (this.props.history.location.pathname === '/'){
            this.props.history.push('/'+this.state.username)
          }
        } else {
          console.log(response);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
    };

*/

}

  render() {


    const findUserActions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onClick={this.handleClose}
      />,
      <FlatButton
        label="Search"
        primary={true}
        onClick={this.handleSearch}
      />
    ];

    const hintText = {
      name: 'ex: John Smith',
      username: 'ex: jSmith45',
      email: 'ex: jBaller45@hotmail.com'
    }


    var findUserForm = (
        <div className="findUser">
          <Dialog
            title="Search for Users by Name, Username, or email."
            actions={findUserActions}
            modal={true}
            open={this.state.open}
          >
            <div>
            <RadioButtonGroup name="status" defaultSelected="name" onChange={(e, value) => {this.setStore({radioButton: value})}}>
            <RadioButton style={{ display: 'inline-block', width: '100px' }} label="name" value="name" />
            <RadioButton style={{ display: 'inline-block', width: '100px', marginLeft: '50px' }} label="username" value="username" />
            <RadioButton style={{ display: 'inline-block', width: '100px', marginLeft: '50px' }} label="email" value="email" />

            </RadioButtonGroup>
            </div>
            <div style={{textAlign: 'center'}}>
              <form onSubmit={this.handleSubmit}>
                <TextField
                  onKeyPress={this.handleKeyPress}
                  onChange={(e, newValue) => {this.setStore({input: newValue})}}
                  hintText={hintText[this.state.radioButton]}
                  floatingLabelText={this.state.radioButton}
                  value={this.state.input}
                />
              </form>
            </div>
            {this.state.usersFound && <Search history={this.props.history} handleClose={()=>{this.setStore({open: false})}}users={this.state.foundUsers}/>}
          </Dialog>
        </div>
    )

    if (this.state.open){
      return findUserForm
    } else {
      return (
        <div className="findUser">
          <RaisedButton className="findUserBtn" secondary label="Find User" onClick={() => {this.handleOpen()}} />
        </div>
      )
    }
  }
}
