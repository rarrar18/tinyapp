const express = require('express');
const app = express(); // creates application with express function
const morgan = require('morgan'); // gives relevant info in terminal
const bcrypt = require('bcrypt'); // used to hash passwords
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(morgan('dev'));
app.use(cookieParser());
app.set('view engine', 'ejs');

function hashPassword(password) {
  bcrypt.genSalt(10, (err, salt) => {
    console.log('salt: ', salt);
    bcrypt.hash(password, salt, (err, hash) => {
      console.log('hash: ', hash);
    });
  });
}

function generateRandomString() {
 let result = "";
 const inputChars = "Aa1BbCc2DdEe3FfGg4HhIi5JjKk6LlMm7NnOo8PpQq9RrSs0TyUuVvWeXcYyZz";
 const charStrLen = inputChars.length;
 for (i = 0; i < 6; i = i + 1) {
   result += inputChars.charAt(Math.floor(Math.random() * charStrLen));
 }
 return result;
};
// returns a new object that is the logged in user's own urlDatabase
function getUserURLs(userId) {
  let userURLs = {};
  // loop through urlDatabase
  for (const url in urlDatabase) {
    // find all urls associated with userId
    let obj = urlDatabase[url];
    if (obj.userId === userId) {
      userURLs[url] = obj;
    }
  }
  // return new urlDatabase that has the keys filtered out
  return userURLs;
};

// in-memory database to hold urls
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userId: "one" },
  "9sm5xK": { longURL: "http://www.google.com", userId: "one" }
};

// in-memory database to hold users
const users = { 
  "one": {
    id: "one",
    email: "1@1.com", 
    password: hashPassword("1")
  },
 "two": {
    id: "two", 
    email: "2@2.com", 
    password: hashPassword("2")
  }
};

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
  const hash = hashPassword(password);
  // const hash = bcrypt.hashSync(password, 10);
  
      const user = {
        id: id,
        email: email,
        password: hash
      };
      users[id] = user;
 
  res.cookie("user_id", id);
  res.redirect('/urls');
});

// Add POST /login -> Login with a username in the text input
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hash = hashPassword(password);
  // const hash = bcrypt.hashSync(password, 10);
  if (!email || !password ) {
    return res.status(400).send("Empty email or password!")
  }
  const user = getUserByEmail(email);
  if (!user) {
    return res.status(403).send("User email cannot be found!")
  }
  if (!(bcrypt.compare(password, user.password))) {
    console.log('user pw', user.password);
    console.log('pw: ', password);
    console.log('hash: ', hash);
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
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userId: req.cookies["user_id"] };
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
  const user = req.cookies["user_id"];
  console.log('This is the user: ', user);
  console.log('User Database:', users[user]);
  let urlDatabase = getUserURLs(user);
  const templateVars = { urls: urlDatabase, user: users[user] };
  res.render('urls_index', templateVars);
});

// Read GET /urls/new -> Shows new url
app.get("/urls/new", (req, res) => {
  // const user = users["userId"];
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.user_id]
  }
  if (!templateVars.user) {
    res.redirect('/login');
  }
  res.render("urls_new", templateVars);
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
  const user = req.cookies["user_id"];
  const templateVars = { shortURL: shortURL, longURL: longURL, user: users[user] };
  res.render("urls_show", templateVars);
});

// tell our app to listen on a port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});