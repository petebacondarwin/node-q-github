var Q = require('q');
var _ = require('lodash');
var qequire = require('qequire');
var GitHubApi = require('github');
var url = require("url");

var PAGE_REGEX = /([&?])page=(\d+)/;
var PAGE_REPLACE = '$1page=';



function createGitHubApiObj(config) {
  var github = qequire.quire(new GitHubApi(config));

  github.getOtherPageLinks = function(response) {
    var lastPageLink = this.hasLastPage(response);
    var pageParamMatch = lastPageLink && PAGE_REGEX.exec(lastPageLink);
    if (!pageParamMatch) {
      // need to do recursive
      return;
    }

    // OK so we can get by page index
    var pageLinks = [];
    var count = pageParamMatch[2];
    for(var i=2;i<=count;i++) {
      pageLinks.push(lastPageLink.replace(PAGE_REGEX, PAGE_REPLACE + i));
    }
    return pageLinks;
  };

  github.getPageCount = function(link) {
    var lastPageLink = this.hasLastPage(link);
    var pageParamMatch = lastPageLink && PAGE_REGEX.exec(lastPageLink);
    if (pageParamMatch) {
      return pageParamMatch[2];
    } else { 
      return 1;
    }
  };

  github.getPageFromLink = function(link) {
    var api = github[github.version];
    var parsedUrl = url.parse(link, true);
    var block = {
        url: parsedUrl.pathname,
        method: "GET",
        params: parsedUrl.query
    };
    return github.httpSend(parsedUrl.query, block).then(function(response) {
      return response.data && JSON.parse(response.data);
    }, function(err) {
      return api.sendError(err, null, parsedUrl.query, callback);
    });
  };

  github.getOtherPages = function(firstPage) {
    var links = this.getOtherPageLinks(firstPage);
    var promises = [];
    for(var page=0;page<links.length;page++) {
      promises.push(github.getPageFromLink(links[page]));
    }
    return Q.all(promises);
  };

  github.getAllPages = function(response) {
    return github.getOtherPages(response).then(function(pages) {
      return response.concat(_.flatten(pages));
    });
  };
  return github;
}

module.exports = createGitHubApiObj;

