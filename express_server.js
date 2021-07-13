const express = require('express');
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const helpers = require('./helpers');

const app = express();
const PORT = 8080;

app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(morgan('dev'));
app.use(cookieSession({
  name: 'cookie',
  keys: ['key1', 'key2']
}));
app.set('view engine', 'ejs');

// in-memory database to hold registered urls
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userId: "one" },
  "9sm5xK": { longURL: "http://www.google.com", userId: "one" }
};

// in-memory database to hold registered users
const users = {
  "one": {
    id: "one",
    email: "1@1.com",
    password: bcrypt.hashSync("1", 10)
  },
  "two": {
    id: "two",
    email: "2@2.com",
    password: bcrypt.hashSync("2", 10)
  }
};

// Add POST /register -> Adds new user object to global users object
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send("Empty email or password!");
  }
  // find out if email is already registered
  const user = helpers.getUserByEmail(email, users);
  if (user) {
    return res.status(400).send("That email has already been used!");
  }
  // add the new user to our users object
  const id = helpers.generateRandomString();
  // hash the user's password
  const hash = bcrypt.hashSync(password, 10);
  // assign values to the new user object
  users[id] = {
    id,
    email,
    password: hash
  };
  console.log('users: ', users);
  req.session["user_id"] = id;
  res.redirect('/urls');
});

// Add POST /login -> Login with a username in the text input
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // check if there is an email and password in the login inputs
  if (!email || !password) {
    return res.status(400).send("Empty email or password!");
  }
  // find the user based on email
  const user = helpers.getUserByEmail(email, users);
  // check if there is a registered email
  if (!user) {
    return res.status(403).send("User email cannot be found!");
  }
  // compare the input password with the user's password
  bcrypt.compare(password, user.password, (err, result) => {
    if (!result) {
      return res.status(403).send("Password does not match!");
    }
    // if there is a match, login as user and show their urls
    req.session["user_id"] = user.id;
    res.redirect('/urls');
  });
});

// Add POST /logout -> Clear user_id cookie once logged out
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// Add POST /urls -> Create a shortURL for a longURL input
app.post("/urls", (req, res) => {
  const shortURL = helpers.generateRandomString();
  // assign each new shortURL its matching longURL and userId in the urlDatabase
  urlDatabase[shortURL] = { longURL: req.body.longURL, userId: req.session["user_id"] };
  res.redirect(`urls/${shortURL}`);
});

// Delete POST /urls/:shortURL/delete -> Remove the shortURL property from the urlDatabase
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// Edit POST /urls/:shortURL -> Assigns current longURL to a newLongURL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.newLongURL;
  res.redirect('/urls');
});

// Read GET /register -> Shows registration page
app.get("/register", (req, res) => {
  res.render("register", { user: null });
});

// Read GET /login -> Shows login page
app.get("/login", (req, res) => {
  res.render("login", { user: null });
});

// Read GET / -> Redirects to login when connected to localhost
app.get("/", (req, res) => {
  res.redirect('/login');
});

// Browse GET /urls -> Show the matching user their own urlDatabase
app.get("/urls", (req, res) => {
  // current user should have cookies while logged in
  const user = req.session["user_id"];
  // find the logged in user's urls by matchig userId to urls
  let userURLs = helpers.getUserURLs(user, urlDatabase);
  // output the user's personal url database and userId
  const templateVars = { urls: userURLs, user: users[user] };
  res.render('urls_index', templateVars);
});

// Read GET /urls/new -> Shows page for creating new url
app.get("/urls/new", (req, res) => {
  // current user should have cookies while logged in
  const user = req.session["user_id"];
  const templateVars = { urls: urlDatabase, user: users[user] };
  // checks if user is logged in
  if (!templateVars.user) {
    // if not, send user to login page
    res.redirect('/login');
  }
  res.render("urls_new", templateVars);
});

// Read GET /u/:shortURL -> Each short url when clicked, goes to the longURL's page
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// Read GET /urls/:shortURL -> Clicking on shortURL on urls page displays it with its longURL on new page
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[req.params.shortURL].longURL;
  const user = req.session["user_id"];
  const templateVars = { shortURL: shortURL, longURL: longURL, user: users[user] };
  res.render("urls_show", templateVars);
});

// tell our app to listen on a port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});