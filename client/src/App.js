import React, { Component } from 'react';
import axios from 'axios';
import {AppBar} from 'material-ui';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {
  Router,
  Route,
  Link
} from 'react-router-dom';
import createHistory from 'history/createBrowserHistory';
import Homepage from './Homepage';
import WishListPage from './WishListPage';
import Footer from './Footer';
import Login from './Login';
import Menu from 'material-ui/svg-icons/navigation/menu';
import AppDrawer from './AppDrawer';
import IconButton from 'material-ui/IconButton';
import FindUserButton from './FindUserButton';
import Options from './Options';
const history = createHistory();
//overwrite default theme
const muiTheme = getMuiTheme({
  palette: {
    primary1Color: '#ff5656',
    primary2Color: '#fff163',
    primary3Color: '#fff487',
    accent1Color: '#fd6464'
  }
});

const style = {
  logo: {
    color: 'white',
    textDecoration: 'none'
  }
}

class App extends Component {
  constructor() {
    super();

    this.state = {
      currentUser: true,
      drawerShow: false,
      optionsShow: false,
    };

    this.setCurrentUser = (user) => {
      this.setState({currentUser: user});
    }

    this.refresh = () => {
      this.setState({currentUser: this.state.currentUser})
    }
    this.getLoggedInUser = () => {
      axios.get('/api/me')
      .then((user) => {
        this.setState({
          currentUser: user.data
        })
      })
    }

    this.setCurrentList = (list) => {
      this.setState({
        currentList: list
      })
    }

    this.toggleDrawer = () => {
      this.setState({
        drawerShow: !this.state.drawerShow
      })
    }

    this.handleOptionsClick = () => {
      this.setState({
        optionsShow: !this.state.optionsShow
      })
    }

    this.handleLogout = (e) => {
      e.preventDefault();
      axios('/api/logout')
      .then((response) => {
        this.setCurrentUser({});
      })
      .catch(function (error) {
        console.log(error);
      });
    };

  }

  componentWillMount() {
    this.getLoggedInUser();
  }

  render() {
    return (
      <Router history={history}>
        <MuiThemeProvider muiTheme={muiTheme} >
          { this.state.currentUser && <div className='container'>
              <div className="App">
                <AppBar id='appBar'
                  title={<Link style={style.logo} to="/">Get Me A Gift</Link>}
                  iconElementLeft={<IconButton><Menu onClick={() => this.toggleDrawer()} /></IconButton>}
                  iconElementRight={
                    <div>
                      <div style={{display: "inline-block", margin:"2px"}}>
                        <FindUserButton refresh={this.refresh.bind(this)} history={history} />
                      </div>
                      <div style={{display:"inline-block", margin:"2px"}}>
                        <Login  history={history} handleLogout={this.handleLogout.bind(this)} setCurrentUser={this.setCurrentUser.bind(this)} user={this.state.currentUser} currentList={this.state.currentList}/>
                    </div>
                  </div>
                  }
                  zDepth={4}
                ></AppBar>
                <AppDrawer handleLogout={this.handleLogout.bind(this)} currentUser={this.state.currentUser} setCurrentList={this.setCurrentList.bind(this)} toggleDrawer={this.toggleDrawer.bind(this)} open={this.state.drawerShow} handleOptionsClick={this.handleOptionsClick.bind(this)} />
                <Route exact path="/" component={(props) => <Homepage history={history} setCurrentUser={this.setCurrentUser.bind(this)} />}/>
                <Route exact path="/:username" component={(props) => <WishListPage {...props} refresh={this.refresh.bind(this)} currentUser={this.state.currentUser} />} />
                <Route exact path="/:username/:list_id" component={(props) => <WishListPage {...props} refresh={this.refresh.bind(this)} currentUser={this.state.currentUser} />} />
                <Options appState={this.state} close={this.handleOptionsClick.bind(this)}/>
                <Footer />
              </div>
            </div>
          }

        </MuiThemeProvider>
      </Router>
    );
  }
}

export default App;
