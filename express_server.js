const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const cookieSession = require('cookie-session');
app.use(cookieSession({ name: 'session', keys: ['key1', 'key2']}));
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const bcrypt = require('bcrypt');
const { generateRandomString, urlsForUser, getUserByEmail } = require('./helpers');


////////////////// DATA /////////////////

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher"
  }
};

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" }
};

//////////////////// GET ROUTES //////////////////////

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
  const templateVars = {
    user: users[req.session.user_id],
    urls: urlsForUser(req.session.user_id, urlDatabase)
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  if (users[userId]) {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL],
      user: users[req.session.user_id]
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: users[req.session.user_id]
    };
    res.render("urls_show", templateVars);
  } else {
    const templateVars1 = {
      user: users[req.session.user_id]
    }
    res.render("404", templateVars1); 
  }
}); 

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.session.user_id]
  };
  res.render("urls_registration", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    email: req.params.email,
    password: req.params.password,
    user: users[req.session.user_id]
  };
  res.render("urls_login", templateVars);
});

////////////////// POST ROUTES /////////////////////


app.post("/urls", (req, res) => {
  let shortUrl = generateRandomString();
  urlDatabase[shortUrl] = { longURL: req.body.longURL, userID: req.session.user_id };
  res.redirect(`/urls/${shortUrl}`);
});

app.post("/urls/:shortURL", (req, res) => { 
  
  urlDatabase[req.params.shortURL] = { longURL: req.body.longURL, userID: req.session.user_id };
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let hashedPassword = bcrypt.hashSync(password, 10);
  //if email or password is empty
  if ((!email) || (!password)) {
    res.status(400).send("Please provide valid email and password");
  } else if (getUserByEmail(email, users)) {
    res.status(400).send("Email already exists. Please use other email.");
  } else {
    const userId = generateRandomString();
    const userInfo = {
      id: userId,
      email: req.body.email,
      password: hashedPassword
    };
    //adding in new userInfo
    users[userId] = userInfo;
    req.session.user_id = userId;
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;1
  let hashedPassword = bcrypt.hashSync(password, 10);
  let user = getUserByEmail(email, users);
  if ((!email) || (!password)) {
    res.status(400).send("Please provide valid email and password");
  } else if (user) {
    if (bcrypt.compareSync(password, users[user].password)) {
      req.session.user_id = users[user].id;
      res.redirect("/urls");
    } else {
      res.status(403).send("Please check your password");
    }
  } else {
    res.status(403).send("User not found");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});