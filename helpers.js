/////HELPER FUNCTION
const generateRandomString = function () {
  let randomStr = "";
  randomStr = Math.random().toString(36).substring(2, 8);
  return randomStr;
};

const urlsForUser = function (id, urlDatabase) {
  let urlsThatUserOwns = {};
  for (const key in urlDatabase) {
    let databaseID = urlDatabase[key].userID;
    if (databaseID === id) {
      urlsThatUserOwns[key] = urlDatabase[key];
    }
  }
  return urlsThatUserOwns;
};

const getUserByEmail = function (email, users) {
  for (const userID in users) {
    if (users[userID].email === email) {
      return userID; 
    } 
  }
  return undefined; 
};

module.exports = { generateRandomString, urlsForUser, getUserByEmail };  