var APIKEY = "fd44d5cd660dafd46ea7f989acba667720c17df3"
  , BASE = 'http://8tracks.com'
  , emitMix = require('./lib/mixEmitter')(APIKEY)
  , recorder = require('./lib/recordMix')(APIKEY)

global.document = document
var hyperglue = require('./lib/hyperglue')
var gui = require('nw.gui')
// Get the current window
var win = gui.Window.get()

win.on('loaded', function () {


  var mixel = document.querySelector('#mixlist')

  emitMix.start('rustyspoons')

  emitMix.on('mix', function (mix) {
    var mdiv = document.createElement('div')
    mdiv.id = mix.id
    mixel.appendChild(createMix(mix))

  })


  function createMix (mix) {
    return hyperglue(html, {
      '.media-heading': mix.name,
      '.mixdescription': mix.description,
      '.mixtags': mix.tags,
      '.numtracks': "Number of tracks: " + mix.numtracks,
      '.mixdate': "Created on " + mix.date,
      '.media-object': {
        'src': mix.coverUrl,
        'alt': mix.name
      }
    })
  }

})

var html =
 '<div class="media">'
+  '<a class="pull-left" href="#">'
+    '<img class="media-object">'
+  '</a>'
+  '<div class="media-body">'
+    '<h4 class="media-heading"></h4>'
+    '<ul class="mixinfo">'
+      '<li class="mixdescription"></li>'
+      '<li class="mixtags"></li>'
+      '<li class="numtracks"></li>'
+      '<li class="mixdate"></li>'
+    '</ul>'
+    '<div class="actions"></div>'
+  '</div>'
+'</div>'
