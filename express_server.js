const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser()); 
app.set("view engine", "ejs");


function generateRandomString() {
  let randomStr = "";
  randomStr = Math.random.toString(36).substring(2, 8);
  return randomStr;
}

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
  const templateVars = { 
    username: req.cookies["username"],
    urls: urlDatabase
  }; 
  res.render("urls_index", templateVars); 
})

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"]};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const shortUrl = generateRandomString(); 
  urlDatabase[shortUrl] = req.body.longURL;
  // console.log(shortUrl);  
  // console.log(urlDatabase); 
  // console.log(req.body);  // Log the POST request body to the console
  res.redirect(`/urls/:${shortUrl}`);         // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect(`/urls/${req.params.shortURL}`); 
  }); 

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]; 
    res.redirect("/urls");
})

app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls"); 
})

app.post("/logout", (req, res) => {
  const username  = req.body.username; 
  res.clearCookie("username", username); 
  res.redirect("/urls"); 
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

