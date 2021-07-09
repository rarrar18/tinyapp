const express = require('express');
const app = express(); // creates application with express function
const morgan = require('morgan'); // this npm package gives relevant info in terminal
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(morgan('dev'));
app.use(cookieParser());
app.set('view engine', 'ejs');

function generateRandomString() {
 let result = "";
 const inputChars = "Aa1BbCc2DdEe3FfGg4HhIi5JjKk6LlMm7NnOo8PpQq9RrSs0TyUuVvWeXcYyZz";
 const charStrLen = inputChars.length;
 for (i = 0; i < 6; i = i + 1) {
   result += inputChars.charAt(Math.floor(Math.random() * charStrLen));
 }
 return result;
};

// in-memory database to hold urls
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca" },
  "9sm5xK": { longURL: "http://www.google.com" }
};

// in-memory database to hold users
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const getUserByEmail = function(email) {
  const userArr = Object.values(users);
  for (const user of userArr) {
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

// Add POST /register -> Adds new user object to global users object
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password ) {
    return res.status(400).send("Empty email or password!")
  }
  if (getUserByEmail(email)) {
    return res.status(400).send("That email has already been used!")
  }
  const id = generateRandomString();
  const user = { id, email, password };
  users[id] = user;
  res.cookie("user_id", id);
  console.log(users);
  console.log(user);
  res.redirect('/urls');
});

// Add POST /login -> Login with a username in the text input
app.post("/login", (req, res) => {
  // should set a cookie named username to the value submitted in the request body via the login form
  // res.cookie("username", req.body.username);
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password ) {
    return res.status(400).send("Empty email or password!")
  }
  const user = getUserByEmail(email);
  if (!user) {
    return res.status(403).send("User email cannot be found!")
  }
  if (user.password !== password) {
    return res.status(403).send("Password does not match!")
  }
  
  res.cookie("user_id", user.id);
  res.redirect('/urls');
});

// Add POST /logout -> Clear user_id once logged out
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/urls');
});

// Add POST /urls -> Create a shortURL for a longURL input
app.post("/urls", (req, res) => {
  console.log(req.body);
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL };
  res.redirect(`urls/${shortURL}`);
});

// Delete POST /urls/:shortURL/delete -> Remove the shortURL property from the urls
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

// Browse GET /urls
app.get("/urls", (req, res) => {

  const id = req.cookies["user_id"];
  const user = users[id];

  const templateVars = { urls: urlDatabase, user };
  res.render('urls_index', templateVars);
});

// Read GET /urls/new -> Shows new url
app.get("/urls/new", (req, res) => {
  const id = req.cookies["user_id"];
  const user = users[id];
  res.render("urls_new", { user });
});

// Read GET /u/:shortURL -> Each short url when clicked, goes to the longURL's page
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// Read GET /urls/:shortURL -> Clicking on a shortURL on urls page displays it with its longURL on a new page
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[req.params.shortURL].longURL;
  const id = req.cookies["user_id"];
  const user = users[id];
  const templateVars = { shortURL: shortURL, longURL: longURL, user };
  res.render("urls_show", templateVars);
});

// tell our app to listen on a port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});