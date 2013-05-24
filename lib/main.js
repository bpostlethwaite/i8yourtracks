var APIKEY = "fd44d5cd660dafd46ea7f989acba667720c17df3"
  , API = require('./lib/APIemitter')(APIKEY)
  , MixTable = require('./lib/mixtable')
  , gui = require('nw.gui')
  , win = gui.Window.get()
  , hyperglue = require('hyperglue/browser')
  , fs = require('fs')
  , mkdirp = require('mkdirp')
  , path = require('path')
  , loginhtml = fs.readFileSync('html/user-login.html', {encoding:'utf8'})

global.document = document

win.on('loaded', function () {

  /*
   * Setup mixtable, pass in an EventEmitter to handle
   * events on the table (checkboxes for now)
   * type of events: checkclicked
   */

  var mixtable = MixTable()
  mixtable.setHeaders()

  var view = Views(document.querySelector('#main-window'))
  view.newView(mixtable.table, 'mixtable')
  view.show('mixtable')

  var navbar = configureNavbar()
  var sidebar = configureSidebar()

  /*
   * Set API to handle user actions
   */
  API.on('mix', function (mix) {
    mixtable.add(mix)
  })

  API.on('get-mixes', function (user, extraTags) {
    mixtable.removeAll()
    console.log(user, extraTags)
    API.getMixes(user, extraTags)
  })


  API.on('download-mixes', function () {
    Object.keys(mixtable.checker.checked).forEach( function (checkmate) {
      console.log("downloading " + checkmate.value)
      API.getTracks(mixtable.mixes[checkmate.value])
    })
    mixtable.checker.uncheckall()
  })


  API.on('track', function (mixID, stream) {
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
    navbar.setUser(user)
    sidebar.showLikedMixes(user.name)
  })

  API.on('user-logoff', function (user) {
    navbar.unsetUser(user)
    sidebar.hideLikedMixes()
  })

  /*
   * Setup events for the mixtable
   */
  mixtable.checker.on("checked", function (mixID) {
    navbar.showDownloadButton()
  })

  mixtable.checker.on("all-unchecked", function () {
    navbar.hideDownloadButton()
  })


  API.on('track', function (track, stream) {
    var trackname = safename(track.trackName + "_" + track.artist + '.mp3')
    var trackpath = safename(track.mixName)

    mkdirp(trackpath, function (err) {
      if (err) {
        API.emit('error', {
          msg: "PROBLEM CREATING PATH " + trackpath
        })
      } else {
        var fstream = fs.createWriteStream(path.join(trackpath, trackname))
        stream.pipe(fstream)
      }
    })

  })

})

function Views (root) {

  var self = {}
  self.views = {}

  function newView (nodes, viewname) {
    /*
     * pass in a node or array of nodes
     */
    self.views[viewname] = nodes
  }

  function show (viewname) {
    /*
     * pass in either the string from previously setting a named view
     * with newView or pass in an html element or array of nodes to
     * do an unnamed view immediately
     */
    if (typeof viewname === "object") {
      newView(viewname, "")
      viewname = ""
    }
    root.innerHTML = ''
    if (Array.isArray(self.views[viewname])) {
      self.views[viewname].forEach( function (node) {
        root.appendChild(node)
      })
    }
    else
      root.appendChild(self.views[viewname])
  }

  self.show = show
  self.newView = newView

  return self
}

function configureNavbar () {

  var self = {}

  var userlogin = document.querySelector('#user-login-container')

  var view = Views(userlogin)
  view.newView(userlogin.childNodes, "not-logged-in")

  userlogin.querySelector('.login')
  .addEventListener('click', function () {
    toggleClass(modal, "hidden")
  })

  var modal = document.querySelector("#modal-outer")

  var loginInput = modal.querySelector('.login-input')
  var loginButton = modal.querySelector("#modal-login")
  enterToClick(loginInput, loginButton)

  var closeInput = modal.querySelector('#close-login')
  closeInput.addEventListener('click', function () {
    toggleClass(modal, "hidden")
  })

  loginButton.addEventListener('click',   function() {
    var user = loginInput.value
    loginInput.value = ''
    if (user)
      API.getUser(user)
    closeInput.click()
  })

  var downloadbutton = document.querySelector(".download-button")
  downloadbutton.addEventListener('click', function () {
    API.emit('download-mixes')
  })

  function showDownloadButton() {
    toggleClass(downloadbutton, "hidden", "off")
  }

  function hideDownloadButton() {
    toggleClass(downloadbutton, "hidden", "on")
  }

  function setUser(user) {
    var elem = hyperglue(loginhtml, {
      '.username': "logged in as " + user.name
    , '.avatar': {
        'src': user.avatarURL
      }
    })
    view.show(elem)
  }

  function unsetUser() {
    view.show("not-logged-in")
  }


  self.showDownloadButton = showDownloadButton
  self.hideDownloadButton = hideDownloadButton
  self.setUser = setUser
  self.unsetUser = unsetUser


  return self
}


function configureSidebar () {

  var self = {}
  self.currentUser = ''

  var searchInput = document.querySelector('.search-input')
  var searchButton = document.querySelector('.search-user-button')
  searchButton.addEventListener('click',  function() {
    var user = searchInput.value
    searchInput.value = ''
    API.emit('get-mixes', user)
  })
  enterToClick(searchInput, searchButton)

  var likedMixes = document.querySelector('#liked-mixes')

  likedMixes.querySelector('.liked-mixes-button')
  .addEventListener('click', function () {
    API.emit('get-mixes', self.currentUser, "view=liked")
  })

  function showLikedMixes (username) {
    toggleClass(likedMixes, "hidden", "off")
    self.currentUser = username
  }

  self.showLikedMixes = showLikedMixes

  return self
}

function enterToClick(keyPressElem, clickElem) {
  keyPressElem.onkeypress = function (e) {
    var code = (e.keyCode ? e.keyCode : e.which)
    if (code === 13) {
      clickElem.click()
    }
  }
}

function toggleClass (elem, className, onoff) {
  var index = elem.className.indexOf(className)

  if ( (index >= 0) && (onoff !== "on") ) {
    elem.className = cut(elem.className, index, index + className.length)
    if (elem.className.slice(-1) === ' ')
      elem.className = elem.className.slice(0, -1)
  }
  else if ( (index < 0) && (onoff !== "off") )
    elem.className = elem.className ? (elem.className + " " + className) : className

  return elem
}


function cut(str, cutStart, cutEnd){
  return str.substr(0,cutStart) + str.substr(cutEnd+1);
}

function safename (s) {
  return s.replace(/[^a-z0-9_\-]/gi, '_').toLowerCase()
}
