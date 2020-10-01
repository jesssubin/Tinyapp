const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session'); 
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");



/////HELPER FUNCTION
const generateRandomString = function () {
  let randomStr = "";
  randomStr = Math.random().toString(36).substring(2, 8);
  return randomStr;
};

const emailVerify = function (email) {
  for (const userID in users) {
    if (users[userID].email === email) {
      return users[userID];
    }
  }
  return false;
};

const urlsForUser = function (id) {
  let userDatabase = {};
  for (const key in urlDatabase) {
    let databaseID = urlDatabase[key].userID;
    if (databaseID === id) {
      userDatabase[key] = urlDatabase[key];
    }
  }
  return userDatabase;
};

/////DATA
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

// app.use((req, res, next) => {
//   const user_id = req.session.user_id;
//   const user = users[user_id];
//   req.user = user;
//   next();
// });

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))
//////////////////// GET //////////////////////

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
  console.log(req.session); 
  const templateVars = {
    user: users[req.session.user_id],
    urls: urlsForUser(req.session.user_id)
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  if (users[userId]) {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL],
      user: req.user
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
    res.redirect("/login");
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
    user: req.user
  };
  res.render("urls_registration", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    email: req.params.email,
    password: req.params.password,
    user: req.user
  };
  res.render("urls_login", templateVars);
});

////////////////// POST /////////////////////


app.post("/urls", (req, res) => {
  let shortUrl = generateRandomString();
  urlDatabase[shortUrl] = { longURL: req.body.longURL, userID: req.session.user_id };
  res.redirect(`/urls/${shortUrl}`);
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
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

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let hashedPassword = bcrypt.hashSync(password, 10);
  let user = emailVerify(email);
  console.log("user.password:", user.password); 
  console.log("password", password); 
  if ((!email) || (!password)) {
    res.status(400).send("Please provide valid email and password");
  } else if (user) {
    console.log("user", user); 
    if (bcrypt.compareSync(password, user.password)) {
      console.log("password match"); 
      req.session.user_id = user.id;
      res.redirect("/urls");
    } else {
      res.status(403).send("Please check your password");
    }
  } else {
    res.status(403).send("User not found");
  }

});

app.post("/logout", (req, res) => {
  user = req.user;
  req.session = null;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let hashedPassword = bcrypt.hashSync(password, 10);
  if ((!email) || (!password)) {
    res.status(400).send("Please provide valid email and password");
  } else if (emailVerify(email)) {
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
    console.log(users);
    res.redirect("/urls");
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});