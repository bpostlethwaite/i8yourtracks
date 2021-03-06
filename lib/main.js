var fs = require('fs')
  , APIKEY = fs.readFileSync('.apikey', {encoding: 'utf8'})
  , API = require('./lib/APIemitter')(APIKEY)
  , MixTable = require('./lib/mixtable')
  , gui = require('nw.gui')
  , win = gui.Window.get()
  , hyperglue = require('hyperglue/browser')
  , mkdirp = require('mkdirp')
  , path = require('path')
  , loginhtml = fs.readFileSync('html/user-login.html', {encoding:'utf8'})
  , downloadDirectory = path.join(process.env.HOME, "localstorage/music")

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

  var icon = document.createElement('i')
  icon.className = "icon-music"

  view.newView(icon, "default")
  view.show('default')

  var options = configureOptions(view)
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
    view.show('mixtable')
    API.getMixes(user, extraTags)
  })

  API.on('download-mixes', function () {
    Object.keys(mixtable.checker.checked).forEach( function (value) {
      API.getTracks(mixtable.mixes[value])
    })
    mixtable.checker.uncheckAll()
  })


  API.on('error', function (data) {
    /*
     * Want to update Screen with an error
     * That wrong user was supplied
     */
    console.log(Object.keys(data))
    view.show('default')
  })

  API.on('user', function (user) {
    navbar.setUser(user)
    sidebar.showLikedMixes(user.name)
  })

  API.on('user-logoff', function (user) {
    navbar.unsetUser(user)
    sidebar.hideLikedMixes()
    view.show('default')
  })

  API.on('track', function (track) {

    console.log(track.trackName)
    //return

    var trackname = safename(track.trackName + "_" + track.artist)  + '.mp3'
    var trackpath = safename(track.mixName)
    var dlpath = path.join(downloadDirectory,trackpath)

    mkdirp(dlpath, function (err) {
      if (err) {
        API.emit('error', {
          msg: "PROBLEM CREATING PATH " + trackpath
        })
      } else {
        var fstream = fs.createWriteStream(path.join(dlpath, trackname))
        track.stream.pipe(fstream)
      }
    })

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

  var modal = document.querySelector("#modal")

  var modalbg = document.querySelector(".modal-dialog-bg")

  var view = Views(userlogin)
  view.newView(userlogin.childNodes, "not-logged-in")

  userlogin.querySelector('.login')
  .addEventListener('click', function () {
    toggleClass(modal, "hidden", false)
    toggleClass(modalbg, "hidden", false)
  })

  var loginInput = modal.querySelector('.login-input')
  var loginButton = modal.querySelector("#modal-login")
  enterToClick(loginInput, loginButton)

  var closeInput = modal.querySelector('#close-login')
  closeInput.addEventListener('click', function () {
    toggleClass(modal, "hidden", true)
    toggleClass(modalbg, "hidden", true)
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
    toggleClass(downloadbutton, "hidden", false)
  }

  function hideDownloadButton() {
    toggleClass(downloadbutton, "hidden", true)
  }

  function setUser(user) {
    var elem = hyperglue(loginhtml, {
      '.username': "logged in as " + user.name
    , '.avatar' : {
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
  searchButton.addEventListener('click',  function () {
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
    toggleClass(likedMixes, "hidden", false)
    self.currentUser = username
  }

  self.showLikedMixes = showLikedMixes

  return self
}


function configureOptions(view) {

  var options = document.querySelector('.options-button')
    , op = optionConfigurer()
    , optionhtml = fs.readFileSync('html/options.html', {encoding:'utf8'})
    , downloadDirHTML = fs.readFileSync('html/downloadDirOption.html', {encoding:'utf8'})

  op.setOption("Set Download Directory", downloadDirHTML)

  var optionHTML = hyperglue(optionhtml, {
    '.option-row' : [
        { '.option-item-caption': 'T-REX', '.option-item-content': 'RAWR' },
        { '.option-item-caption': 'robot', '.option-item-content': 'beep boop' },
        { '.option-item-caption': 'Dr X', '.option-item-content': 'mwahaha' }
    ]
  })


  // var optionHTML = hyperglue(optionhtml, {
  //   '.option-row' : op.getOptions()
  // })


  // view.newView(optionHTML, "options")

  // options.addEventListener('click', function () {
  //   view.show('options')
  // })


  function optionConfigurer () {
    var optionArray = []
    return {
      setOption : function (optionName, optionHTML) {
        optionArray.push({
          '.option-item-caption': optionName
        , '.option-item-content': "{_html : optionHTML}"
        })
      }
    , getOptions : function () {
        return optionArray
      }
    }
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

function toggleClass (elem, className, bool) {
  var index = elem.className.indexOf(className)
  if ( (index >= 0) && (bool !== true) ) {
    elem.className = cut(elem.className, index, index + className.length)
    if (elem.className.slice(-1) === ' ')
      elem.className = elem.className.slice(0, -1)
  }
  else if ( (index < 0) && (bool !== false) )
    elem.className = elem.className ? (elem.className + " " + className) : className

  return elem
}


function cut(str, cutStart, cutEnd){
  return str.substr(0,cutStart) + str.substr(cutEnd+1);
}

function safename (s) {
  s = s.replace(/[^a-z0-9_\-]/gi, '_').toLowerCase()
  if (s[ s.length - 1] === '_')
    return s.slice(0, -1)
  else return s
}

