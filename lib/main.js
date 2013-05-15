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
      '.mixtags': mix.tags,
      '.numtracks': mix.numtracks,
      '.mixdescription': mix.description,
      '.mixcoverUrl': mix.coverUrl,
      '.mixdate': mix.date,
      '.media-object': {
        'src': mix.coverUrl,
        'alt': mix.name
      }
    })
  }

})

var html =  '<div class="mixdetails">'
   + '<div class="media-heading"></div>'
   + '<div class="mixtags"></div>'
   + '<div class="numtracks">number of tracks: </div>'
   + '<div class="mixdate"></div>'
   + '<div class="mixdescription"></div>'
 + '</div>'
 + '<div class="actions"></div>'
 + '<div class="pull-left">'
   + '<img class="media-object">'
+ '</div>'

/*
 *
<div class="media">
  <a class="pull-left" href="#">
    <img class="media-object">
  </a>
  <div class="media-body">
    <h4 class="media-heading"></h4>
    <ul class="mixinfo">

  </div>
</div>
*/