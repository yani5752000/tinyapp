function generateRandomString() {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
    for (let i = 6; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

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
};
function lookUp(users, email) {
  for (let user in users) {
    if (users[user]["email"] === email) {
      return true;
    }
  }
  return false;
}

const express = require("express");
var cookieParser = require('cookie-parser')
const app = express();
app.use(cookieParser())
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { urls: urlDatabase, user: user };
  
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  //const templateVars = { urls: urlDatabase, username: req.cookies["username"], };
  
  
  res.render("urls_register");
});

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = {user: user };
  
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: user };
  
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  //const longURL = urlDatabase[req.params.shortURL];
  res.render("urls_login");
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls/");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls/");
});
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls/:" + shortURL);
  console.log(urlDatabase);
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  
  //console.log(req.body);
  res.redirect("/urls");
  
});

app.post("/logout", (req, res) => {
  
  
  res.clearCookie("username");
  
  res.redirect("/urls");
  
});


app.post("/register", (req, res) => {
  //urlDatabase[req.params.id] = req.body.longURL;
  //res.redirect("/urls/");
  
  if (req.body.email === "" || req.body.password === "") {
    res.send("404- Bad Request");
  } else if (lookUp(users, req.body.email)) {
    res.send("404- Bad Request");
  } else {
    const id = generateRandomString();
    res.cookie("user_id", id);

    const user = { id: id, email: req.body.email, password: req.body.password};
  
    users[id] = user;
    
    res.redirect("/urls/");
  }
  console.log(users);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
