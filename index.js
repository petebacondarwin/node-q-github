var qequire = require('qequire');
var GitHubApi = require('github');

module.exports = function(config) {
  return qequire.quire(new GitHubApi(config));
};