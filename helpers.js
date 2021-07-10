// find the user by matching their email in the users database
const getUserByEmail = function(email, users) {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      //returns whole user object
      return user;
    }
  }
  return null;
};

const generateRandomString = function() {
  let result = "";
  const inputChars = "Aa1BbCc2DdEe3FfGg4HhIi5JjKk6LlMm7NnOo8PpQq9RrSs0TyUuVvWeXcYyZz";
  const charStrLen = inputChars.length;
  for (let i = 0; i < 6; i = i + 1) {
    result += inputChars.charAt(Math.floor(Math.random() * charStrLen));
  }
  return result;
};

// returns a new object that is the logged in user's own urlDatabase
const getUserURLs = function(userId, urlDatabase) {
  let userURLs = {};
  // loop through urlDatabase
  for (const url in urlDatabase) {
    // find all urls associated with userId
    let obj = urlDatabase[url];
    if (obj.userId === userId) {
      userURLs[url] = obj;
    }
  }
  // return new urlDatabase that has the keys filtered out
  return userURLs;
};

module.exports = { getUserByEmail, generateRandomString, getUserURLs };