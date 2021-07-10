const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    console.log('user: ', user);
    console.log('expected output: ', expectedOutput);
    assert.equal(user.id, expectedOutput);
  });
  it('should return null if there is no matching email', function() {
    const user = getUserByEmail("false@example.com", testUsers);
    const expectedOutput = null;
    console.log('user: ', user);
    console.log('expected output: ', expectedOutput);
    assert.equal(user, expectedOutput);
  });
});