const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser()); 
app.set("view engine", "ejs");


/////HELPER FUNCTION 
const generateRandomString = function () {
  let randomStr = "";
  randomStr = Math.random().toString(36).substring(2, 8);
  return randomStr;
}

const emailVerify = function (email) {
  for (const user in users) {
    if(users[user].email === email) {
      return user;
    }
  }
  return false; 
}

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
    password: "dishwasher-funk"
  }
}

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" } 
};

app.use((req, res, next) => {
  const user_id = req.cookies["user_id"]  
  const user = users[user_id];  
  req.user = user  
  next();
})

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
  
  const templateVars = { 
    user: req.user, 
    urls: urlDatabase
  }; 
  res.render("urls_index", templateVars); 
})

app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"]; 
  if (users[userId]){
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
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL], 
    user: req.user 
  };
  console.log(req.params.shortURL); 
  res.render("urls_show", templateVars);
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
  }
  res.render("urls_registration", templateVars)
}); 

app.get("/login", (req, res) => {
  const templateVars = {
    email: req.params.email,
    password: req.params.password,
    user: req.user
  }
  res.render("urls_login", templateVars); 
})

////////////////// POST /////////////////////


app.post("/urls", (req, res) => {
  let shortUrl = generateRandomString(); 
  urlDatabase[shortUrl] = req.body.longURL;
  res.redirect(`/urls/${shortUrl}`);         
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect(`/urls`); 
  }); 

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]; 
    res.redirect("/urls");
})

app.post("/login", (req, res) => {
  let email = req.body.email; 
  let password = req.body.password; 
  let user = emailVerify(email); 
  if ((!email) || (!password)) {
    res.status(400).send("Please provide valid email and password");
  } else if (user) {
    if(users[user].password === password){
    res.cookie("user_id", user); 
    res.redirect("/urls"); 
    } else {
      res.status(403).send("Please check your password"); 
    }
  } else {
    res.status(403).send("User not found");
  }
  
})

app.post("/logout", (req, res) => {
  user = req.user; 
  res.clearCookie("user_id", user); 
  res.redirect("/urls"); 
}); 

app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  if ((!email) || (!password)) {
    res.status(400).send("Please provide valid email and password"); 
  } else if(emailVerify(email)) {
    res.status(400).send("Email already exists. Please use other email.")
  } else {
  const userId = generateRandomString();
  const userInfo = {
    id: userId,
    email: req.body.email,
    password: req.body.password
  }
  //adding in new userInfo
  users[userId] = userInfo;
  res.cookie("user_id", userId);
  
  res.redirect("/urls")
 }
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

