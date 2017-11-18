const router = require('express').Router();
const User = require('../../app/models/user');

const List = require('../../app/models/list');
const Item = require('../../app/models/item');
const helpers = require('./helpers');
const passport = require('passport');/* http://www.passportjs.org/docs */


//get all users
//We actually won't need this for our app, but good for testing db
router.get('/users', (req, res) => {
  User.find().exec((err, users) => {
    res.send({users})
  })
})
//get all users in the DB
router.get('/allUsers'), (req, res) => {
  helpers.getAllUsers()
  .then((users) => {
    res.status(201).send(users)
  })
}

//get user
router.get('/users/:username', (req, res) => {
  var loggedInUserId = req.session.user_id;
  //we want to send in the logged in user's id
  //so we can determine if we should send back secret wishlists
  helpers.getUser(req.params.username, loggedInUserId)
  .then((user) => {
    res.json(user);
  })
  .catch((err) => {
    res.status(401).send({err});
  })
})

//add new user
/* Example POST data
{
	"username": "newuser",
	"password": (hashed via bcrypt)
}
*/
router.post('/signup', (req, res) => {
  passport.authenticate('local-signup', (err, user) => {
    if (err) {
      res.status(401).send({err: err});
    } else {
      req.session.user_id = user._id;
      // user.email = req.body.email
      //create a default list for the new user
      helpers.createList({
        title: 'Wishlist',
        secret: false,
        user_id: user._id
      })
      .then((list) => {
        //get the user again which should now have the wishlist
        return helpers.getUserById(user._id);
      })
      .then((user) => {
        user.email = req.body.email.toLowerCase()
        user.firstName = req.body.firstName.toLowerCase()
        user.lastName = req.body.lastName.toLowerCase()
        user.profilePicURL = req.body.profilePicURL
        return user.save()
      })
      .then((user) => {
        res.send(user);
      })
      .catch((err) => {
        res.status(401).send({err});
      });
    }
  })(req, res);
});

//user login
/* Example POST data
{
	"username": "newuser",
	"password": (hashed via bcrypt)
}
*/
router.post('/login', (req, res) => {

  passport.authenticate('local-login', (err, user) => {
    if (err) {
      res.status(401).send({err: err});
    } else {
      req.session.user_id = user._id;
      helpers.friendRequest(user._id, '5a0e53ec0c40584f51eb2b2e')
      helpers.denyRequest(user._id, '5a0e53ec0c40584f51eb2b2e')
      res.send(user);
      helpers.getUserById(user._id)
    }
  })(req, res);
});

//Logs the user out by clearing the session
router.get('/logout', (req, res) => {
  delete req.session.user_id;
  res.send('success')
});

//Sends back the logged in user's info
//We use this in the react app
router.get('/me', (req, res) => {
  console.log('Getting me');
  var user_id = req.session.user_id;
  helpers.getUserById(user_id)
  .then((user) => {
    res.send(user);
  })
  .catch((err) => {
    res.send({});
  });
});
//search for a User by nameSearch
/* Example POST data
{
  userInput: 'whatever the user types in the search field'
  searchMethod: name OR username OR email //indicate your search method
}
*/
router.post('/search', (req, res) => {
  var searchMethod = req.body.searchMethod;
  if(searchMethod === 'name') {
    helpers.getUserByName(req.body.userInput)
    .then((foundUsers) => {
      //foundUsers is an array of users that met the search requirements
      res.status(201).send(foundUsers)
    })
    .catch((err) => {
      res.status(500).send(err)
    })
  } else if ( searchMethod === 'username' ) {
    helpers.getUserByUsername(req.body.userInput)
    .then((foundUsers) => {
      //foundUsers is an array of users that met the search requirements
      res.status(201).send(foundUsers)
    })
    .catch((err) => {
      res.status(500).send(err)
    })
  } else if ( searchMethod === 'email' ) {
    console.log('SERVER EMAIL SEARCH');
    helpers.getUserByEmail(req.body.userInput)
    .then((foundUsers) => {
      //foundUsers is an array of users that met the search requirements
      res.status(201).send(foundUsers)
    })
    .catch((err) => {
      res.status(500).send(err)
    })
  } else if ( searchMethod === 'id' ) {
    helpers.getUserById(req.body.userInput)
    .then((foundUsers) => {
      //foundUsers is an array of users that met the search requirements
      res.status(201).send(foundUsers)
    })
    .catch((err) => {
      res.status(500).send(err)
    })
  }
})


//add new list to user
/* Example POST data
{
	"title": "Secret List",
	"secret": true
}
*/
router.post('/lists', (req, res) => {
  var title = req.body.title;
  var secret = req.body.secret;
  var user_id = req.session.user_id;

  helpers.createList({
    title: title,
    secret: secret,
    user_id: user_id
  })
  .then((list) => {
    res.send(list);
  })
  .catch((err) => {
    res.status(401).send({err});
  });
});


//delete list
router.delete('/lists/:id', (req, res) => {
  var list_id = req.params.id;
  var user_id = req.session.user_id;

  helpers.deleteList(user_id, list_id)
  .then((id) => {
    res.send(`Deleted Wishlist: ${id}`);
  })
  .catch((err) => {
    res.status(401).send({err});
  });
});


//update list
/* Example POST data
{
	"title": "New List Name"
}
or
{
	"secret": false
}
*/
router.put('/lists/:id', (req, res) => {
  var list_id = req.params.id;
  var listUpdates = req.body;
  var user_id = req.session.user_id;

  console.log(req.body);

  helpers.updateList(user_id, list_id, listUpdates)
  .then((list) => {
    res.send(list);
  })
  .catch((err) => {
    res.status(401).send({err});
  });
});


//add an item to the list (specific to the user)
/* Example POST data
{
	"title": "New Balance - 247 Classic",
  "price": 79.99,
  "comments": "I wear a size 10.5",
  "url": "http://www.newbalance.com/pd/247-classic/MRL247-C.html?dwvar_MRL247-C_color=Navy&default=true#color=Navy&width=D",
  "image_url": "http://nb.scene7.com/is/image/NB/mrl247rb_nb_02_i?$dw_temp_default_gallery$",
  "list_id": "59cab05eec5719b45039976b"
}
*/
router.post('/items', (req, res) => {
  var user_id = req.session.user_id;

  var item = {};
  item.title = req.body.title;
  item.price = req.body.price;
  item.comments = req.body.comments;
  item.url = req.body.url;
  item.image_url = req.body.image_url;
  item.list_id = req.body.list_id;
  item.user_id = user_id;

  helpers.addItem(user_id, item)
  .then((newItem) => {
    res.send(newItem);
  })
  .catch((err) => {
    res.status(401).send({err});
  });
})

//toggle item purchased
/* Example PUT data
{
	"purchased": true
}
*/
router.put('/setPurchased/:id', (req, res) => {
  var item_id = req.params.id;
  var updates = {purchased: req.body.purchased};

  helpers.updateItem(item_id, updates)
  .then((list) => {
    res.send(list);
  })
  .catch((err) => {
    res.status(401).send({err});
  });
});

//delete item
router.delete('/items/:id', (req, res) => {
  var item_id = req.params.id;
  var user_id = req.session.user_id;

  helpers.deleteItem(user_id, item_id)
  .then((id) => {
    res.send(`Deleted Item: ${id}`);
  })
  .catch((err) => {
    res.status(401).send({err});
  });
});

router.post('/friendRequest', (req, res) => {
  var initiatingUser_id = req.session.user_id;
  var requestedUser_id = req.body.requestedUser_id;
  if(!initiatingUser_id) {
    console.log('NOT SIGNED IN');
    return false;
  }
  helpers.friendRequest(initiatingUser_id, requestedUser_id)
  .then((data) => {
    res.send(`Success: ${data}`)
  })
  .catch((err) => {
    res.status(400).send({err});
  });
});

router.post('/acceptFriendRequest', (req, res) => {
  var acceptUser_id = req.body.acceptUser_id;
  var requestUser_id = req.body.requestUser_id;
  helpers.addFriend(acceptUser_id, requestUser_id)
  .then((data) => {
    res.send(`Success: ${data}`)
  })
  .catch((err) => {
    res.status(400).send({err});
  });
});

router.post('/denyFriendRequest', (req, res) => {
  var denyUser_id = req.body.denyUser_id;
  var requestUser_id = req.body.requestUser_id;
  helpers.addFriend(denyUser_id, requestUser_id)
  .then((data) => {
    res.send(`Success: ${data}`)
  })
  .catch((err) => {
    res.status(400).send({err});
  });
});




module.exports = router;
