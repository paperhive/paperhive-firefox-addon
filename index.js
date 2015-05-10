/**
+ * @license PaperHive Firefox Add-on v0.0.0
+ * (c) 2015 Nico Schlömer <nico@paperhive.org>
+ * License: GPL-3
+ */
'use strict';

(function() {
  var Request = require('sdk/request').Request;
  var tabs = require('sdk/tabs');
  var { ActionButton } = require('sdk/ui/button/action');

  var buttonHref;
  var handleClick = function() {
    if (buttonHref) {
      tabs.open(buttonHref);
    } else {
      console.error('Empty target URL.');
    }
  };

  var button = new ActionButton({
    id: 'paperhive-link',
    label: 'Open in PaperHive',
    icon: {
      '16': './icon-16.png',
      '32': './icon-32.png',
      '64': './icon-64.png'
    },
    onClick: handleClick,
    disabled: true
  });

  var apiUrl = 'https://paperhive.org/dev/backend/branches/master';
  var frontentUrl = 'https://paperhive.org/';
  var whitelistedHostnames = ['arxiv.org'];


  tabs.on('open', function(tab) {
    console.log('tab open');
  });

  tabs.on('ready', function(tab) {
    console.log('tab ready');
  });

  tabs.on('activate', function(tab) {
    console.log('tab activate');
  });

  tab.on('ready', function(tab) {
    // We could actually check on every single page, but we don't want to put
    // the PaperHive backend under too much load. Hence, filter by hostname.
    var arr = tab.url.split('/');
    if (whitelistedHostnames.indexOf(arr[2]) < 0) {
      return;
    }

    // talk to paperhive
    var articleRequest = new Request({
      url: apiUrl + '/articles/sources?handle=' + tab.url,
      overrideMimeType: 'application/json',
      onComplete: function(response) {
        if (response.status === 200) {
          button.disabled = false;
          var article = response.json;
          //// send article to panel.js
          //panel.port.emit('article', article);

          if (article._id) {
            // set button link
            button.disabled = false;
            buttonHref = frontentUrl + '/articles/' + article._id;
            // fetch discussions
            var discussionsRequest = new Request({
              url: apiUrl + '/articles/' + article._id + '/discussions/',
              overrideMimeType: 'application/json',
              onComplete: function(response) {
                if (response.status === 200) {
                  var discussions = response.json;
                  // set badge
                  if (discussions.length > 0) {
                    button.badge = discussions.length;
                  }
                  // set label text
                  if (discussions.length === 1) {
                    button.label = 'There is 1 discussion on PaperHive.';
                  } else if (discussions.length > 1) {
                    button.label = 'There are ' + discussions.length +
                      ' discussions on PaperHive.';
                  }
                }
              }
            });
            discussionsRequest.get();
          } else {
            button.disabled = true;
            buttonHref = undefined;
          }
        } else {
          console.error('Illegal response status.');
        }
      }
    });
    articleRequest.get();
  });

})();
