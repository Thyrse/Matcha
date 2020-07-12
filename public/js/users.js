const users = [];
const allUsers = [];

// Join user to chat
function userJoin(id, room) {
    const user = { id, room };
   
    users.push(user);
    return user;
}

function allAssignement(id, nickname) {
    const current = { id, nickname };
   
    allUsers.push(current);
    return current;
}

// Get current user

function getCurrentUser(id) {
    return users.find(user => user.id === id);
}

function userLeave(id) {
    const index = allUsers.findIndex(user => user.id === id);
  
    if (index !== -1) {
      return allUsers.splice(index, 1)[0];
    }
}

function retrieve(username) {
    return allUsers.find(user => user.nickname === username); 
}

function connected(username) {
    return allUsers.find(user => user.nickname == username);
}

module.exports = {
    userJoin,
    getCurrentUser,
    allAssignement,
    userLeave,
    retrieve,
    connected
};