var createGitHubApi = require('../index');
var Q = require('q');

describe('q-github', function() {
  var github;

  beforeEach(function() {
    github = createGitHubApi({
      version: "3.0.0"      
    });
  });

  describe('getPageCount', function() {
    it('should parse the last page URL to get the page count', function() {
      var link = '<https://api.github.com/repositories/460078/issues?state=open&per_page=100&page=10>;rel="last"';
      expect(github.hasLastPage(link)).toEqual('https://api.github.com/repositories/460078/issues?state=open&per_page=100&page=10');
      expect(github.getPageCount(link)).toEqual('10');
    });
  });

  describe('getOtherPageLinks', function() {
    it('should return undefined if there is no last page link', function() {
      var link = '<https://api.github.com/repositories/460078/issues>;rel="next"';
      expect(github.getOtherPageLinks(link)).toBeUndefined();
    });

    it('should return undefined if there is no page param in the last page link', function() {
      var link = '<https://api.github.com/repositories/460078/issues>;rel="last"';
      expect(github.getOtherPageLinks(link)).toBeUndefined();
    });

    it('should return a list of links, if there is a numerical "page" parameter in the "last page" link', function() {
      var link = '<https://api.github.com/repositories/460078/issues?state=open&per_page=100&page=10>;rel="last"';
      expect(github.getOtherPageLinks(link)).toEqual([
        'https://api.github.com/repositories/460078/issues?state=open&per_page=100&page=2',
        'https://api.github.com/repositories/460078/issues?state=open&per_page=100&page=3',
        'https://api.github.com/repositories/460078/issues?state=open&per_page=100&page=4',
        'https://api.github.com/repositories/460078/issues?state=open&per_page=100&page=5',
        'https://api.github.com/repositories/460078/issues?state=open&per_page=100&page=6',
        'https://api.github.com/repositories/460078/issues?state=open&per_page=100&page=7',
        'https://api.github.com/repositories/460078/issues?state=open&per_page=100&page=8',
        'https://api.github.com/repositories/460078/issues?state=open&per_page=100&page=9',
        'https://api.github.com/repositories/460078/issues?state=open&per_page=100&page=10'
      ]);
    });
  });

  describe('getPageFromLink', function() {
    it('should make a call to github.httpSend()', function() {
      spyOn(github, 'httpSend').andReturn(Q.when({}));
      github.getPageFromLink('https://api.github.com/repositories/460078/issues?state=open&per_page=100&page=2');
      expect(github.httpSend).toHaveBeenCalled();
    });
  });

  describe('getOtherPages', function() {

  });

  describe("getAllPages", function() {
    
  });
});