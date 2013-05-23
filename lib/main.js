var APIKEY = "fd44d5cd660dafd46ea7f989acba667720c17df3"
  , BASE = 'http://8tracks.com'
  , API = require('./lib/APIemitter')(APIKEY)
  , recorder = require('./lib/recordMix')(APIKEY)
  , MixTable = require('./lib/mixtable')
  , gui = require('nw.gui')
  , win = gui.Window.get()
  , fs = require('fs')


global.document = document

win.on('loaded', function () {

  /*
   * Setup mixtable, pass in an EventEmitter to handle
   * events on the table (checkboxes for now)
   * type of events: checkclicked
   */

  var mixtable = MixTable()
  mixtable.setHeaders()

  var view = createView(document.querySelector('#main-window'))
  view.show(mixtable.table)


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
  downloadbutton.addEventListener('click', function () {
    Object.keys(mixtable.checker.checked).forEach( function (key) {
      console.log("downloading " + key)
    })
    mixtable.checker.uncheckall()
  })

  /*
   * Configure User Login
   */
  document.querySelector('#login')
  .addEventListener('click', function () {
    toggleClass(modal, "hidden")
  })

  var modal = document.querySelector("#modal-outer")

  var loginInput = modal.querySelector('.login-input')
  var loginButton = modal.querySelector("#modal-login")
  loginButton.addEventListener('click', getUser(loginInput, closeInput))
  enterToClick(loginInput, loginButton)

  var closeInput = modal.querySelector('#close-login')
  closeInput.addEventListener('click', function () {
    toggleClass(modal, "hidden")
  })


  /*
   * Setup User Mix search to activate getMixes
   */
  var searchInput = document.querySelector('.search-query')
  var searchButton = document.querySelector('.search-user-button')
  searchButton.addEventListener('click', getMixes(mixtable, searchInput))
  enterToClick(searchInput, searchButton)


  /*
   * Setup events for the mixtable
   */
  mixtable.checker.on("checked", function () {
    downloadbutton.className =  "download-button"
  })

  mixtable.checker.on("all-unchecked", function () {
    downloadbutton.className =  "download-button hidden"
  })


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

function enterToClick(keyPressElem, clickElem) {
  keyPressElem.onkeypress = function (e) {
    var code = (e.keyCode ? e.keyCode : e.which)
    if (code === 13) {
      clickElem.click()
    }
  }
}

function toggleClass (elem, className) {
  var index = elem.className.indexOf(className)
  if (index >= 0) {
    elem.className = cut(elem.className, index, index + className.length)
    if (elem.className.slice(-1) === ' ')
      elem.className = elem.className.slice(0, -1)
  }
  else
    elem.className = elem.className ? (elem.className + " " + className) : className

  return elem
}


function cut(str, cutStart, cutEnd){
  return str.substr(0,cutStart) + str.substr(cutEnd+1);
}

function createView (root) {

  var self = {}

  function show (elem) {
    root.innerHTML = ''
    root.appendChild(elem)
  }

  self.show = show

  return self
}
