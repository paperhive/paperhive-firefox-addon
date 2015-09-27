/**
+ * @license PaperHive Firefox Add-on v0.0.3
+ * (c) 2015 Nico Schlömer <nico@paperhive.org>
+ * License: GPL-3
+ */
'use strict';

(function() {
  var Request = require('sdk/request').Request;
  var tabs = require('sdk/tabs');
  var {ActionButton} = require('sdk/ui/button/action');
  var config = require('./config.json');

  var buttonData = {};
  var handleClick = function() {
    if (!buttonData[tabs.activeTab.id].url) {
      console.error('Invalid URL');
      return;
    }
    if (buttonData[tabs.activeTab.id].isAdded) {
      tabs.open(buttonData[tabs.activeTab.id].url);
    } else {
      button.state('tab', {
        disabled: true,
        icon: iconsColor,
        badge: undefined,
        label: 'Adding article on PaperHive...'
      });
      var addArticleRequest = new Request({
        url: config.apiUrl + '/articles/sources?handle=' +
          buttonData[tabs.activeTab.id].url,
        overrideMimeType: 'application/json',
        onComplete: function(response) {
          button.state('tab', {
            disabled: false,
            icon: iconsColor,
            badge: undefined,
            label: 'Open on PaperHive'
          });
          if (response.status === 200) {
            var article = response.json;
            // reset
            buttonData[tabs.activeTab.id] = {
              url: config.frontendUrl + '/articles/' + article._id,
              isAdded: true
            };
            tabs.open(buttonData[tabs.activeTab.id].url);
          } else {
            console.error('Could not add article to PaperHive (' +
                          response.status + ')');
          }
        }
      });
      addArticleRequest.post();
    }
  };

  var iconsColor = {
    '16': './icon-16.png',
    '32': './icon-32.png',
    '64': './icon-64.png'
  };
  var iconsGray = {
    '16': './icon-white-16.png',
    '32': './icon-white-32.png',
    '64': './icon-white-64.png'
  };

  var button = new ActionButton({
    id: 'paperhive-link',
    label: 'Page not supported by PaperHive',
    disabled: true,
    icon: iconsGray,
    onClick: handleClick
  });

  tabs.on('ready', function(tab) {
    // reset tab button
    button.state('tab', {
      disabled: true,
      icon: iconsGray,
      badge: undefined,
      label: 'Page not supported by PaperHive',
    });
    buttonData[tab.id] = {};

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
          console.error('Illegal response status (' + response.status + ').');
          return;
        }
        var article = response.json;

        if (article._id) {
          // set button link
          buttonData[tab.id] = {
            url: config.frontendUrl + '/articles/' + article._id,
            isAdded: true
          };
          // fetch discussions
          var discussionsRequest = new Request({
            url: config.apiUrl + '/articles/' + article._id + '/discussions/',
            overrideMimeType: 'application/json',
            onComplete: function(response) {
              if (response.status !== 200) {
                button.state('tab', {
                  disabled: false,
                  icon: iconsColor,
                  label: 'Open on PaperHive'
                });
                return;
              }
              var discussions = response.json;
              var badge;
              if (discussions.length > 0) {
                badge = discussions.length;
              }
              var label = 'Open on PaperHive';
              if (discussions.length === 1) {
                label = 'There is 1 discussion on PaperHive';
              } else if (discussions.length > 1) {
                label = 'There are ' + discussions.length +
                  ' discussions on PaperHive';
              }
              // set button
              button.state('tab', {
                disabled: false,
                icon: iconsColor,
                badge: badge,
                label: label
              });
            }
          });
          discussionsRequest.get();
        } else {
          // The article is whitelisted, but not yet added on PaperHive.
          buttonData[tab.id] = {
            url: tab.url,
            isAdded: false
          };
          button.state('tab', {
            disabled: false,
            icon: iconsColor,
            label: 'Open on PaperHive'
          });
        }
      }
    });
    articleRequest.get();
  });

})();
