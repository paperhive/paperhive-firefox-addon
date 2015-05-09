'use strict';

(function() {
  var Request = require('sdk/request').Request;
  var tabs = require('sdk/tabs');
  var buttons = require('sdk/ui/button/action');

  var button = buttons.ActionButton({
    id: 'paperhive-link',
    label: 'Visit PaperHive',
    icon: {
      '16': './icon-16.png',
      '32': './icon-32.png',
      '64': './icon-64.png'
    },
    onClick: handleClick,
    badge: 24
  });

  function handleClick(state) {
    tabs.open('https://www.paperhive.org/');
  }

  var apiUrl = 'https://paperhive.org/dev/backend/branches/master';
  var whitelistedHostnames = ['arxiv.org'];

  tabs.on('open', function(tab){
    tab.on('ready', function(tab){
      console.log(tab.url);
      // We could actually check on every single page, but we don't want to put
      // the PaperHive backend under too much load. Hence, filter by hostname.
      var arr = tab.url.split('/');
      if (whitelistedHostnames.indexOf(arr[2]) < 0) {
        console.log('illegal');
        return;
      }
      console.log('legal');

      // talk to paperhive
      var Request = require('sdk/request').Request;
      var paperhiveRequest = new Request({
        url: apiUrl + '/articles/sources?handle=' + tab.url,
        onComplete: function (response) {
          if (response.status === 200) {
            console.log(response.text);
          } else {
            console.error('Illegal response status.');
          }
        }
      });
      paperhiveRequest.get();
    });
  });

})();
