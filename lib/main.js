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
    mixel.appendChild(createMix(mix))

  })


  function createMix (mix) {
    return hyperglue(html, {
      '.mixname': mix.name,
      '.mixtags': mix.tags,
      '.numtracks': mix.numtracks,
      '.mixdescription': mix.description,
      '.mixcoverUrl': mix.coverUrl,
      '.mixdate': mix.date,
      '.artwork img': {
        src: mix.coverUrl,
        alt: mix.name
      }
    })
  }

})

var html =  '<div class="mixdetails">'
   + '<div class="mixname"></div>'
   + '<div class="mixtags"></div>'
   + '<div class="numtracks">number of tracks: </div>'
   + '<div class="mixdate"></div>'
   + '<div class="mixdescription"></div>'
 + '</div>'
 + '<div class="actions"></div>'
 + '<div class="artwork">'
   + '<img>'
+ '</div>'
