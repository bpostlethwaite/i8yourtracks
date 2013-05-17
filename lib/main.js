var APIKEY = "fd44d5cd660dafd46ea7f989acba667720c17df3"
  , BASE = 'http://8tracks.com'
  , hyperglue = require('./lib/hyperglue')
  , emitMix = require('./lib/mixEmitter')(APIKEY)
  , recorder = require('./lib/recordMix')(APIKEY)
  , gui = require('nw.gui')
  , win = gui.Window.get()
  , fs = require('fs')
  , badgehtml = fs.readFileSync('html/mediabadge.html', {encoding:'utf8'})
  , ctrlhtml = fs.readFileSync('html/control.html', {encoding:'utf8'})

global.document = document

win.on('loaded', function () {

  var ctrlel = document.querySelector('#control')
  ctrlel.appendChild(hyperglue(ctrlhtml))

  var mixel = document.querySelector('#mixcontainer')
  var mixer = mixcontrol(mixel)

  emitMix.on('mix', function (mix) {
    mixer.add(mix)
  })

  var searchUser = document.querySelector('.searchUser')
  searchUser.addEventListener('click', getMixes(mixer))

  var searchq = document.querySelector('.search-query')
  searchq.onkeypress = function (e) {
    var code = (e.keyCode ? e.keyCode : e.which)
    if (code === 13) {
      searchUser.click()
    }
  }


})

function getMixes(mixer) {

  var searchq = document.querySelector('.search-query')

  return function() {
    var user = searchq.value
    searchq.value = ''
    /*
     * IF USER CORRECT  REMOVE CURRENT MIXBADGES
     * AND ADD NEW ONES
     */
    mixer.removeAll()
    emitMix.start(user)
  }
}


function mixcontrol (paneEl) {
  var self = paneEl
    , medialist = []


  function add (mix) {
    var mediabadge = createMediabadge(mix)
    mediabadge.className += mediabadge.className ? ' row' : 'row';
    mediabadge.addEventListener('click', badgeclick(mix))
    medialist.push(mediabadge)
    self.appendChild(mediabadge)
  }

  function removeAll() {
    medialist.forEach( function (media) {
      self.removeChild(media)
    })
    medialist = []
  }

  function createMediabadge (mix) {
    return hyperglue(badgehtml, {
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

  function badgeclick (mix) {
    return function () {
      console.log("recording " + mix.name)
      //recorder.record(mix)
    }
  }

  self.add = add
  self.removeAll = removeAll

  return self

}
