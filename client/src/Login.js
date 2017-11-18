import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import axios from 'axios';
import Dropzone from 'react-dropzone';

/**
* A modal dialog can only be closed by selecting one of the actions.
*/
const style = {
  RightBtns: {
      marginTop: 5,
      marginRight: 5
    },
}
export default class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
      register: false,
      username: '',
      password: '',
      verifyPassword: '',
      firstName: '',
      lastName: '',
      email: '',
      fileReceived: false,
      fileName: '',
      files: null,
      profilePicURL: "https://support.plymouth.edu/kb_images/Yammer/default.jpeg"
    };

    this.setStore = (obj) => {
      this.setState(obj);
    }

    this.handleOpen = () => {
      this.setState({open: true});
    };

    this.handleClose = () => {
      this.setState({open: false});
    };

    this.toggleRegister = () => {
      this.setState({register: !this.state.register})
    };

    this.handleUsernameChange = (e, newValue) => {
      this.setState({username: newValue})
    };

    this.handlePasswordChange = (e, newValue) => {
      this.setState({password: newValue})
    };

    this.handleVerifyPasswordChange = (e, newValue) => {
      this.setState({verifyPassword: newValue})
    };

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

    this.handleRegisterSubmit = () => {
      axios.post('api/signup', {
        username: this.state.username,
        password: this.state.password,
        email: this.state.email,
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        profilePicURL: this.state.profilePicURL
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

    this.uploadFile = (e) => {
      e.preventDefault();
      const files = this.state.files;
      console.log('uploading file')
      //if the user has added a file
      if (files) {
        console.log('have a file in upload');
        /* map over all of the images, upload them, and post them to db
        (right now there is only 1 image, but can be
        changed later to accept and render multiple images) */
        files.map(file => {
          // Initial FormData
          const formData = new FormData();
          formData.append("file", file);
          formData.append("tags", `getmeagift`);
          formData.append("upload_preset", "n5n2w26w"); //preset is with account
          formData.append("api_key", "365845311351591"); //key is based on account
          formData.append("timestamp", (Date.now() / 1000) | 0);

          // Make an AJAX upload request using Axios
          // The url is provided by cloudinary
          return axios.post("https://api.cloudinary.com/v1_1/getmeagiftlegacy/image/upload", formData, {
            headers: { "X-Requested-With": "XMLHttpRequest" },
          })
          .then(response => {
            const data = response.data;
            //url of image in cloudinary
            console.log(data);
            const fileURL = data.secure_url
            console.log(fileURL);
            this.setState({profilePicURL: fileURL})
            this.handleRegisterSubmit()
          })
        });
      } else {
        (console.log('no file in upload'))
        this.handleRegisterSubmit();
        //if they don't have a file ready to be uploaded just post to database
      //  this.post()
      }
    }

    this.onDrop = (files) => {
      console.log('dropped')
      if(files) {
        this.setState({
          fileReceived: true,
          fileName: files[0].name,
          files: files
        });
    }
  }

    this.handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        if (this.state.register) {
          this.uploadFile(e);
        } else {
          this.handleLoginSubmit(e);
        }
      }
    }
  };

  render() {

    var username = this.props.user.username;

    const loginActions = [
      <FlatButton
        type="button"
        label="Cancel"
        primary={true}
        onClick={this.handleClose}
      />,
      <FlatButton
        type="Submit"
        label="Submit"
        primary={true}
        disabled={!this.state.username || !this.state.password}
        onClick={this.handleLoginSubmit}
      />
    ];

    const registerActions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onClick={() => {this.setStore({open: false, register: !this.state.register})}}
      />,
      <FlatButton
        label="Submit"
        primary={true}
        disabled={
          !this.state.username
          || !this.state.password
          || !this.state.firstName
          || !this.state.lastName
          || this.state.password !== this.state.verifyPassword
        }
        onClick={this.uploadFile}
      />
    ];

    var welcomeBack = (
      <RaisedButton secondary style={{color: 'white'}} className="LogoutBtn" label={"Logout, "+username} onClick={this.props.handleLogout} />
    );

    var loginDiv = (
      <div className="login">
        <RaisedButton className="LoginBtn" secondary label="Login/Signup" onClick={this.handleOpen} />
        <Dialog
          title="Login"
          actions={loginActions}
          modal={true}
          open={this.state.open}
        >
          <div style={{textAlign: 'center'}}>
            <form>
              <TextField
                onKeyPress={this.handleKeyPress}
                onChange={this.handleUsernameChange}
                hintText="username"
                floatingLabelText="username"
                value={this.state.username}
              /><br />
              <TextField
                onKeyPress={this.handleKeyPress}
                onChange={this.handlePasswordChange}
                hintText="password"
                floatingLabelText="password"
                type="password"
                value={this.state.password}
              /><br />
            </form>
            <p>Don't have an account? <span style={{cursor: "pointer", color: "blue"}} onClick={this.toggleRegister}>Sign up</span></p>
          </div>
        </Dialog>
      </div>
    );

    var registerDiv = (
      <div className="register">
        <Dialog
          title="Create an account"
          actions={registerActions}
          modal={true}
          open={this.state.open}
        >
          <div style={{textAlign: 'center'}}>
            <form onSubmit={this.handleSubmit}>
              <TextField
                onChange={this.handleUsernameChange}
                hintText="username"
                floatingLabelText="username"
                value={this.state.username}
              /><br />
              <TextField
                onChange={(e, newValue) => {this.setStore({firstName:newValue})}}
                hintText="first name"
                floatingLabelText="first name"
                value={this.state.firstName}
              /><br />
              <TextField
                onChange={(e, newValue) => {this.setStore({lastName:newValue})}}
                hintText="last name"
                floatingLabelText="last name"
                value={this.state.lastName}
              /><br />
              <TextField
                onChange={(e, newValue) => {this.setStore({email:newValue})}}
                hintText="email"
                floatingLabelText="email"
                value={this.state.email}
              /><br />
              <TextField
                onChange={this.handlePasswordChange}
                hintText="password"
                floatingLabelText="password"
                type="password"
                value={this.state.password}
                // errorText={this.state.password === this.state.verifyPassword ? '' : "Passwords do not match"}
                /><br />
              <TextField
                onChange={this.handleVerifyPasswordChange}
                hintText="verify password"
                floatingLabelText="verify password"
                type="password"
                value={this.state.verifyPassword}
                errorText={this.state.password === this.state.verifyPassword ? '' : "Passwords do not match"}
              /><br />
              <Dropzone disableClick={false} multiple={false} accept={'image/*'} onDrop={this.onDrop} style={{maxHeight: 50, maxWidth: 150}}>
                <FlatButton secondary label="Add Profile Picture"></FlatButton>
              </Dropzone>
              {this.state.fileReceived ? <span style={{color: 'blue', width: 150}}>{this.state.fileName}</span> : null}
            </form>
            <p>Already have an account? <span style={{cursor: 'pointer', color: "blue"}} onClick={this.toggleRegister}>Login</span></p>
          </div>
        </Dialog>
      </div>
    )

    if (this.state.open) {
      return this.state.register ? registerDiv : loginDiv
    } else {
      return (
        <div style={style.RightBtns}>
        {
          username ? welcomeBack : loginDiv
        }
        </div>
      )
    }
  }
}
