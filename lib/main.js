var APIKEY = "fd44d5cd660dafd46ea7f989acba667720c17df3"
  , BASE = 'http://8tracks.com'
  , hyperglue = require('./lib/hyperglue')
  , emitMix = require('./lib/mixEmitter')(APIKEY)
  , recorder = require('./lib/recordMix')(APIKEY)
  , MixTable = require('./lib/mixtable')
  , gui = require('nw.gui')
  , win = gui.Window.get()
  , fs = require('fs')
  , ctrlhtml = fs.readFileSync('html/control.html', {encoding:'utf8'})


global.document = document

win.on('loaded', function () {
/*
 * Set up Control Pane
 */
  var ctrlel = document.querySelector('#control')
  ctrlel.appendChild(hyperglue(ctrlhtml))
/*
 * Setup mixtable, pass in an EventEmitter to handle
 * events on the table (checkboxes for now)
 * type of events: checkclicked
 */

  var table = document.querySelector('#mix-table')
  var mixtable = MixTable(table)
  mixtable.setHeaders()

  /*
   * Set emitMix to handle mix events once
   * user asks for mixes.
   */
  emitMix.on('mix', function (mix) {
    mixtable.add(mix)
  })
  emitMix.on('error', function (data) {
    /*
     * Want to update Screen with an error
     * That wrong user was supplied
     */
    console.log(data.error)
  })

  var downloadbutton = document.querySelector(".download-button")
  downloadbutton.onclick = function () {
    Object.keys(mixtable.checker.checked).forEach( function (key) {
      console.log("downloading " + key)
    })
    mixtable.checker.uncheckall()
  }

  /*
   * Setup events for the mixtable
   */
  mixtable.checker.on("checked", function () {
    downloadbutton.className = "download-button"
  })

  mixtable.checker.on("all-unchecked", function () {
    downloadbutton.className = "download-button hidden"
  })

  /*
   * Setup User Mix search to activate getMixes
   */
  var searchUser = document.querySelector('.search-user-button')
  searchUser.addEventListener('click', getMixes(mixtable))

  var searchq = document.querySelector('.search-query')
  searchq.onkeypress = function (e) {
    var code = (e.keyCode ? e.keyCode : e.which)
    if (code === 13) {
      searchUser.click()
    }
  }
})

function getMixes(mixtable) {

  var searchq = document.querySelector('.search-query')

  return function() {
    var user = searchq.value
    searchq.value = ''
    /*
     * IF USER CORRECT  REMOVE CURRENT MIXBADGES
     * AND ADD NEW ONES
     */
    mixtable.removeAll()
    emitMix.start(user)
  }
}
