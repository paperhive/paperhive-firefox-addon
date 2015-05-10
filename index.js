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
  var config = require('./config.json');

  var buttonHref;
  var handleClick = function(state) {
    console.log(state);
    if (buttonHref) {
      tabs.open(buttonHref);
    } else {
      console.error('Empty target URL.');
    }
  };

  var button = new ActionButton({
    id: 'paperhive-link',
    label: 'Page not supported by PaperHive',
    icon: {
      '16': './icon-16.png',
      '32': './icon-32.png',
      '64': './icon-64.png'
    },
    onClick: handleClick,
    disabled: true
  });

  tabs.on('ready', function(tab) {
    // reset tab button
    button.state('tab', {
      disabled: true,
      badge:  undefined,
      label: 'Page not supported by PaperHive',
    });
    buttonHref = undefined;

    // We could actually check on every single page, but we don't want to put
    // the PaperHive backend under too much load. Hence, filter by hostname.
    var arr = tab.url.split('/');
    if (config.whitelistedHostnames.indexOf(arr[2]) < 0) {
      return;
    }

    // talk to paperhive
    var articleRequest = new Request({
      url: config.apiUrl + '/articles/sources?handle=' + tab.url,
      overrideMimeType: 'application/json',
      onComplete: function(response) {
        if (response.status !== 200) {
          console.error('Illegal response status.');
          return;
        }
        var article = response.json;

        if (article._id) {
          // set button link
          buttonHref = config.frontentUrl + '/articles/' + article._id;
          // fetch discussions
          var discussionsRequest = new Request({
            url: config.apiUrl + '/articles/' + article._id + '/discussions/',
            overrideMimeType: 'application/json',
            onComplete: function(response) {
              if (response.status !== 200) {
                button.state('tab', {
                  disabled: false,
                  label: 'Open on PaperHive.'
                });
                return;
              }
              var discussions = response.json;
              var badge;
              if (discussions.length > 0) {
                badge = discussions.length;
              }
              var label;
              if (discussions.length === 1) {
                label = 'There is 1 discussion on PaperHive.';
              } else if (discussions.length > 1) {
                label = 'There are ' + discussions.length +
                  ' discussions on PaperHive.';
              }
              // set button
              button.state('tab', {
                disabled: false,
                badge: badge,
                label: label
              });
            }
          });
          discussionsRequest.get();
        } else {
          // The article is there, but not yet added on PaperHive.
          button.state('tab', {
            disabled: false,
            label: 'Open on PaperHive.'
          });
        }
      }
    });
    articleRequest.get();
  });

})();
