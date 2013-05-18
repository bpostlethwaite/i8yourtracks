var APIKEY = "fd44d5cd660dafd46ea7f989acba667720c17df3"
  , BASE = 'http://8tracks.com'
  , hyperglue = require('./lib/hyperglue')
  , emitMix = require('./lib/mixEmitter')(APIKEY)
  , recorder = require('./lib/recordMix')(APIKEY)
  , gui = require('nw.gui')
  , win = gui.Window.get()
  , fs = require('fs')
  , mheader = fs.readFileSync('html/mixheader.html', {encoding:'utf8'})
  , mrow = fs.readFileSync('html/mixrow.html', {encoding:'utf8'})
  , ctrlhtml = fs.readFileSync('html/control.html', {encoding:'utf8'})

global.document = document

win.on('loaded', function () {

  var ctrlel = document.querySelector('#control')
  ctrlel.appendChild(hyperglue(ctrlhtml))

  var tbody = document.querySelector('tbody')
  var mixer = mixcontrol(tbody)

  emitMix.on('mix', function (mix) {
    mixer.add(mix)
  })

  emitMix.on('error', function (data) {
    console.log(data)
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


function mixcontrol (tableBody) {
  var self = tableBody
    , medialist = []


  function add (mix) {
    var mediaRow = createrow(mix).querySelector('.mixrow')
    mediaRow.addEventListener('click', mixclick(mix))
    medialist.push(mediaRow)
    self.appendChild(mediaRow)
  }

  function removeAll() {
    medialist.forEach( function (media) {
      self.removeChild(media)
    })
    medialist = []
  }

  function createrow (mix) {
    return hyperglue(mrow, {
      '.mixselector': {
        'value': String(mix.id)
      },
      '.media-heading': mix.name,
      '.mixdescription': mix.description,
      '.mixtags': mix.tags,
      '.numtracks': mix.numtracks,
      '.mixdate': mix.date,
      '.media-object': {
        'src': mix.coverUrl,
        'alt': mix.name
      }
    })
  }

  function mixclick (mix) {
    return function () {
      console.log("recording " + mix.name)
      //recorder.record(mix)
    }
  }

  self.add = add
  self.removeAll = removeAll

  return self

}
