var Q = require('q');
var _ = require('lodash');
var qequire = require('qequire');
var GitHubApi = require('github');


GitHubApi.prototype.getAllPages = function(requestFn, options) {
  var github = this;

  var PAGE_REGEX = /[&?]page=(\d+)/;
  function getPageCount(response) {
    var lastPageLink = github.hasLastPage(response);
    if ( lastPageLink ) {
      return PAGE_REGEX.exec(lastPageLink)[1];
    } else { 
      return 1;
    }
  }

  return requestFn(options).then(function(firstPage) {
    var pageIndex = 2;
    var pageCount = getPageCount(firstPage);
    pagePromises = [];

    function makeRequest(pageIndex) {
      return requestFn(_.defaults({ page: pageIndex }, options)).then(function(response) {
        return response;
      });
    }

    console.log('page count', pageCount);
    while(pageIndex <= pageCount) {
      pagePromises.push(makeRequest(pageIndex));
      pageIndex += 1;
    }

    return Q.all(pagePromises).then(function(pages) {
      var totalPages = firstPage.concat(_.flatten(pages));
      return totalPages;
    });

  });
};


module.exports = function(config) {
  return qequire.quire(new GitHubApi(config));
};