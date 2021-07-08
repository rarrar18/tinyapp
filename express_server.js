const express = require('express');
const app = express(); // creates application with express function
const morgan = require('morgan'); // this npm package gives relevant info in terminal
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
app.use(express.urlencoded({ extended: false }));
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

// in-memory database
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca" },
  "9sm5xK": { longURL: "http://www.google.com" }
};
// Add POST /login -> Login with a username
app.post("/login", (req, res) => {
  // should set a cookie named username to the value submitted in the request body via the login form
  res.cookie("username", req.body.username);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
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

// Browse GET /urls
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render('urls_index', templateVars);
});

// Read GET /urls/new -> Shows new url
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
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
  const templateVars = { shortURL: shortURL, longURL: longURL };
  res.render("urls_show", templateVars);
});

// tell our app to listen on a port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});