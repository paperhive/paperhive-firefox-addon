/**
+ * @license PaperHive Firefox Add-on v0.0.0
+ * (c) 2015 Nico Schlömer <nico@paperhive.org>
+ * License: GPL-3
+ */
'use strict';

(function() {
  var Request = require('sdk/request').Request;
  var tabs = require('sdk/tabs');
  var { ToggleButton } = require('sdk/ui/button/toggle');
  var panels = require('sdk/panel');
  var self = require('sdk/self');

  function handleChange(state) {
    if (state.checked) {
      panel.show({
        position: button
      });
    }
  }

  var button = new ToggleButton({
    id: 'paperhive-link',
    label: 'Visit PaperHive',
    icon: {
      '16': './icon-16.png',
      '32': './icon-32.png',
      '64': './icon-64.png'
    },
    onChange: handleChange,
    disabled: true
  });

  function handleHide() {
    button.state('window', {checked: false});
  }

  var panel = panels.Panel({
    contentURL: self.data.url('panel.html'),
    onHide: handleHide,
    contentScriptFile: self.data.url('panel.js')
  });

  var apiUrl = 'https://paperhive.org/dev/backend/branches/master';
  var whitelistedHostnames = ['arxiv.org'];

  tabs.on('open', function(tab) {
    tab.on('ready', function(tab) {
      // We could actually check on every single page, but we don't want to put
      // the PaperHive backend under too much load. Hence, filter by hostname.
      var arr = tab.url.split('/');
      if (whitelistedHostnames.indexOf(arr[2]) < 0) {
        return;
      }

      // talk to paperhive
      var paperhiveRequest = new Request({
        url: apiUrl + '/articles/sources?handle=' + tab.url,
        overrideMimeType: 'application/json',
        onComplete: function(response) {
          if (response.status === 200) {
            button.disabled = false;
            var article = response.json;
            // send article to panel.js
            panel.port.emit('article', article);

            //if (article._id) {
            //  // fetch discussions
            //  var xhr = new XMLHttpRequest();
            //  xhr.open(
            //    'GET',
            //    config.apiUrl + '/articles/' + article._id + '/discussions/',
            //    true
            //  );
            //  xhr.responseType = 'json';
            //  xhr.onload = function() {
            //    if (this.status === 200) {
            //      tabToDiscussions[details.tabId] = xhr.response;
            //      callback(null, article, xhr.response);
            //    } else {
            //      callback('Unexpected return value');
            //    }
            //  };
            //  xhr.send(null);
            //}
          } else {
            console.error('Illegal response status.');
          }
        }
      });
      paperhiveRequest.get();
    });
  });

})();