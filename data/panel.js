/**
+ * @license PaperHive Firefox Add-on v0.0.0
+ * (c) 2015 Nico Schlömer <nico@paperhive.org>
+ * License: GPL-3
+ */
'use strict';

(function() {

  self.port.on('article', function(data) {
    console.log(data);
  });

})();
