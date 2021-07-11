//the database of the users
const users = { 
  
};

//the database of urls
const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "ewr65f"},
  "9sm5xK": {longURL:"http://www.google.com", userID: "jh8gf5"}
};

//returns the user corresponding to an email from a database
const getUserByEmail = function(email, database) {
  for (let user in database) {
    if (database[user]["email"] === email) {
      return user;
    }
  }
};

//generates a random six character length string
function generateRandomString() {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
    for (let i = 6; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

//gives the object containing the short urls for a user as the keys together
//with their corresponding long urls as values
function urlsForUser(id) {
  const obj = {};
  for (const sURL in urlDatabase) {
    if (urlDatabase[sURL]["userID"] === id) {
      obj[sURL] = urlDatabase[sURL]["longURL"];
    }
  }

  return obj;
}

module.exports = { getUserByEmail, generateRandomString, urlsForUser, urlDatabase, users };