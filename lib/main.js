var APIKEY = "fd44d5cd660dafd46ea7f989acba667720c17df3"
  , BASE = 'http://8tracks.com'
  , hyperglue = require('./lib/hyperglue')
  , API = require('./lib/APIemitter')(APIKEY)
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

  var mainview = document.querySelector('#main-window')
  var mixtable = MixTable()
  mixtable.setHeaders()
  mainview.appendChild(mixtable.table)
  /*
   * Set API to handle mix events once
   * user asks for mixes.
   */
  API.on('mix', function (mix) {
    mixtable.add(mix)
  })
  API.on('error', function (data) {
    /*
     * Want to update Screen with an error
     * That wrong user was supplied
     */
    console.log(data.error)
  })

  /*
   * API handle user login events once login successful
   */
  API.on('user', function (user) {
    // SET LOGIN PANEL
    // PUT USER FAVOURITES AS A MIX OPTION IN SIDEBAR
  })

  /*
   * Configure Download Button
   */
  var downloadbutton = document.querySelector(".download-button")
  downloadbutton.onclick = function () {
    Object.keys(mixtable.checker.checked).forEach( function (key) {
      console.log("downloading " + key)
    })
    mixtable.checker.uncheckall()
  }

  /*
   * Configure User Login Button
   */
  var login = document.querySelector('#login')
  var modal = login.querySelector("#modal-outer")
  login.onclick = function () {
    modal.className = " "
  }

  var loginInput = login.querySelector('.login-input')
  loginInput.onkeypress = function (e) {
    var code = (e.keyCode ? e.keyCode : e.which)
    if (code === 13) {
      loginbutton.click()
    }
  }

  var closeInput = login.querySelector('#close-login')
  closeInput.addEventListener('click', function () {
    modal.className = "hidden"
    console.log(modal.className)
  })

  var loginbutton = login.querySelector("#modal-login")
  loginbutton.addEventListener('click', getUser(loginInput, closeInput))


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

  var searchq = document.querySelector('.search-query')
  searchq.onkeypress = function (e) {
    var code = (e.keyCode ? e.keyCode : e.which)
    if (code === 13) {
      searchUser.click()
    }
  }

  var searchUser = document.querySelector('.search-user-button')
  searchUser.addEventListener('click', getMixes(mixtable, searchq))

})

function getMixes(mixtable, inputEl) {

  return function() {
    var user = inputEl.value
    inputEl.value = ''
    /*
     * IF USER CORRECT  REMOVE CURRENT MIXBADGES
     * AND ADD NEW ONES
     */
    mixtable.removeAll()
    API.getAllMixes(user)
  }
}

function getUser(inputEl, closeEl) {
  return function() {
    var user = inputEl.value
    inputEl.value = ''
    /*
     * IF USER CORRECT  REMOVE CURRENT MIXBADGES
     * AND ADD NEW ONES
     */
    API.getUser(user)
    closeEl.click()
  }
}