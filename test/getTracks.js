var APIKEY = "fd44d5cd660dafd46ea7f989acba667720c17df3"
  , API = require('./../lib/APIemitter')(APIKEY)
  , fs = require('fs')
  , path = require('path')
  , mkdirp = require('mkdirp')

var mixes = {}

API.on('mix', function (mix) {
  mixes[mix.id] = mix
  if(mix.name === "Fourteen Songs") {
    console.log(mix.name)
    API.getTracks(mix)
  }
})

API.on('track', function (track) {
  var trackname = safename(track.trackName + "_" + track.artist + '.mp3')
  var trackpath = safename(track.mixName)

  mkdirp(trackpath, function (err) {
    if (err) {
      API.emit('error', {
        msg: "PROBLEM CREATING PATH " + trackpath
      })
    } else {
      var fstream = fs.createWriteStream(path.join(trackpath, trackname))
      track.stream.pipe(fstream)
    }
  })

})


function safename (s) {
  return s.replace(/[^a-z0-9_\-]/gi, '_').toLowerCase()
}


API.on('error', function (data) {
  console.log('received error')
  console.log(data.status)
  console.log(data.errors)
})

API.getMixes('rustyspoons')


function dateString (dateObj) {
  var month = dateObj.getUTCMonth()
  var day = dateObj.getUTCDate()
  var year = dateObj.getUTCFullYear()

  return year + "/" + month + "/" + day
}
