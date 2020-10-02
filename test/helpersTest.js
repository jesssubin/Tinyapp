const { assert } = require("chai");

const { urlsForUser, getUserByEmail } = require("../helpers.js");

const testUsers = {
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

const testDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" }
};

describe("getUserByEmail", function () {
  it("should return a user with valid email", function () {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });

  it("should return undefined if email is invalid", function () {
    const user = getUserByEmail("random@example.com", testUsers)
    const expectedOutput = undefined; 
    assert.equal(user, expectedOutput); 
  }); 
});

describe("urlsForUser", function () {
  it("should should return user urls with valid user id", function () {
    const userUrls = urlsForUser("userRandomID", testDatabase); // find all the URLs that belong to the FIRST user in testUsers
    assert.deepEqual(userUrls, {"b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"}});
  }); 
}); 