const express = require("express");
const morgan = require('morgan'); // this npm package gives relevant info in terminal
const app = express(); // creates application with express function
const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
/*
// all middleware uses .use that takes in req, res, and next
app.use((req, res, next) => {
  //  body parser
  // "username=raph&password=1234"
  req.body = {
    username: 'raph',
    password: '1234'
  };
  // res.send('stopped by the middleware');
  next();
});
// used to parse certain data and show in terminal
app.use(morgan('dev'));
*/

// set the view enging to ejs
app.set('view engine', 'ejs');

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
/*
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
*/
// tell our app to listen on a port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});