const {getUserByEmail, generateRandomString, urlsForUser, urlDatabase, users} = require("./helpers.js");





const cookieSession = require('cookie-session')
const express = require("express");
const bcrypt = require('bcrypt');

const app = express();

app.use(cookieSession({
  name: 'session',
  keys: ["secret"],

  
  maxAge: 24 * 60 * 60 * 1000 //24 hours
}))

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");


//say Hello! on root page
app.get("/", (req, res) => {
  res.send("Hello!");
});

//this parses the urlDatabase
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//this page sayas Hello
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


//this page either shows the user his/her urls if logged in  
//or redirects to login page if not logged in
app.get("/urls", (req, res) => {
  if (req.session.user_id) {
    const user = users[req.session.user_id];
    const urls = urlsForUser(req.session.user_id);
    const templateVars = { urls: urls, user: user };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

//this page either presents the registeration form if notregistered
//or gives error message if registered
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.render("urls_register");
  }
});


app.get("/urls/new", (req, res) => {
  
  if (req.session.user_id) {
    const user = users[req.session.user_id];
    const templateVars = {user: user };
    
    res.render("urls_new", templateVars);
  } else {
    
    res.redirect("/login");
  }
});



//this page presents the newly created short url together 
//with its correspondinglong url if loggedin else gives an appropriate message
app.get("/urls/:shortURL", (req, res) => {
  if (!req.session.user_id){
    res.render("urls_notlogged");
  } else if (!Object.keys(urlDatabase).includes(req.params.shortURL)) {
    res.render("urls_notvalid");
  } else if (Object.keys(urlsForUser(req.session.user_id)).includes(req.params.shortURL)) {
    const user = users[req.session.user_id];
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]["longURL"], user: user };
  
    res.render("urls_show", templateVars);
  } else {
    res.render("urls_notyours");
  }
  
});


// this page takes the short url in the url and redirects to the page for 
//corresponding long url  
//else, it gives appropriate message 
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL]["longURL"];
    res.redirect(longURL);
  } else {
    res.render("urls_notvalid");
  }
});

//this page presents the login form if not logged in
//else redirects to the urls page
app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.render("urls_login");
  }
});

//this makes it possible to update the long url corresponding to
//a short url if logged in, else, gives an appropriate message
app.post("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    res.render("urls_notlogged");
  } else if (!((Object.keys(urlDatabase)).includes(req.params.id))) {
    res.render("urls_notvalid");
  } else if (Object.keys(urlsForUser(req.session.user_id)).includes(req.params.id)) {
    const obj = {longURL: req.body.longURL, userID: req.session.user_id};
    urlDatabase[req.params.id] = obj;
    res.redirect("/urls/");
  } else {
    res.render("urls_notyours");
  }

  
});
 //this makes it possible to delete a short url if logged in
 // else it gives an appropriate message
app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.session.user_id) {
    res.render("urls_notlogged");
  } else if (!Object.keys(urlDatabase).includes(req.params.shortURL)) {
    res.render("urls_notvalid");
  } else if (Object.keys(urlsForUser(req.session.user_id)).includes(req.params.shortURL)) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls/");
  } else {
    res.render("urls_notyours");
  }
});

// this makes it possible to generate a short url if logged in
app.post("/urls", (req, res) => {
  if (req.session.user_id) {
      // Log the POST request body to the console
    const shortURL = generateRandomString();
    const obj = {longURL: req.body.longURL, userID: req.session.user_id};
    urlDatabase[shortURL] = obj;
    res.redirect("/urls/" + shortURL);
    
  } else {
    console.log("ERROR: you cannot post")
    res.redirect("/urls");
  }
});

// this makes it possible to login or else gives appropriate message
app.post("/login", (req, res) => {
  if (!getUserByEmail(req.body.email, users)) {
    res.render("urls_403");
  } else if (!bcrypt.compareSync(req.body.password, users[getUserByEmail(req.body.email, users)]["password"])) {
    res.render("urls_403.ejs");
  } else {
    req.session.user_id = users[getUserByEmail(req.body.email, users)]["id"];
    res.redirect("/urls");
  }
});

//this makes it possible to log out and destroys the session and redirects to urls
app.post("/logout", (req, res) => {
  req.session = null
  
  res.redirect("/urls");
});

//this makes it possible to register if not already registered
//or else gives an appropriate message
app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.render("urls_404");
  } else if (getUserByEmail(req.body.email, users)) {
    res.render("urls_404");
  } else {
    const id = generateRandomString();
    req.session.user_id = id;

    const password = req.body.password; 
    const hashedPassword = bcrypt.hashSync(password, 10);

    const user = { id: id, email: req.body.email, password: hashedPassword }
    users[id] = user;
    
    res.redirect("/urls/");
  }
});

//this keeps listening on port 8080
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
