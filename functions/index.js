// Cloud Functions for Firebase
const deleteUserAuth = require('./deleteUser');
const deleteUserData = require('./deleteUserData');

exports.deleteUserAuth = deleteUserAuth.deleteUserAuth;
exports.onUserDelete = deleteUserData.onUserDelete;

