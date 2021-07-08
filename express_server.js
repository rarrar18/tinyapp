const express = require("express");
const app = express(); // creates application with express function
const morgan = require('morgan'); // this npm package gives relevant info in terminal
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
// data in the input field will be available in the req.body.longURL variable
// which we can store in our urlDatabase object

function generateRandomString() {
 let result = "";
 const inputChars = "Aa1BbCc2DdEe3FfGg4HhIi5JjKk6LlMm7NnOo8PpQq9RrSs0TyUuVvWeXcYyZz";
 const charStrLen = inputChars.length;
 for (i = 0; i < 6; i = i + 1) {
   result += inputChars.charAt(Math.floor(Math.random() * charStrLen));
 }
 return result;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL };
  // res.send("Ok"); // Respond with 'Ok' (we will replace this)
  res.redirect(`urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.use(morgan('dev'));

// set the view enging to ejs
app.set('view engine', 'ejs');

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  const templateVars = { shortURL: req.params.shortURL, longURL: longURL };
  res.render("urls_show", templateVars);
});



/*
// add endpoints (VERB + PATH)
// .get has two args, string and cb, which is path and action
app.get("/", (req, res) => {
  // .send acts as .write and .end in one package
  // res.send("Hello!");
  let mascots = [
    { name: 'Sammy', organization: "DigitalOcean", birth_year: 2012},
    { name: 'Tux', organization: "Linux", birth_year: 1996},
    { name: 'Moby Dock', organization: "Docker", birth_year: 2013}
  ];
  let tagline = "No programming concept is complete without a cute animal mascot.";

  res.render('pages/index', {
    mascots: mascots,
    tagline: tagline
  });
});

app.get('/about', (req, res) => {
  res.render('pages/about');
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
*/
// tell our app to listen on a port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});