var request = require('request')
  , JSONStream = require('JSONStream')
  , fs = require('fs')
//  , mkdirp = require('mkdirp')

module.exports = function (APIKEY) {

  var self = {}

  function record (mix) {
    getPlayToken(function (playToken) {
      getTrack(playToken, mix.id, 'play')

    })
  }

  function getPlayToken (cb) {
    var pstream = JSONStream.parse(true)
    var playToken = 'http://8tracks.com/sets/new.json?api_key=' + APIKEY
    request(playToken).pipe(pstream)
    pstream.on('data', function (data) {
      cb(data.play_token)
    })
  }

  function getTrack (playToken, mixId, cmd) {
    var pstream = JSONStream.parse(true)
    var startreq = 'http://8tracks.com' +
      '/sets/'+playToken+ '/' + cmd +
      '.json?mix_id='+mixId+'&api_key='+APIKEY

    request(startreq).pipe(pstream)

    pstream.on('data', function (data) {
      var fstream = fs.createWriteStream(data.set.track.name + '.mp3')
      request(data.set.track.url).pipe(fstream)

      fstream.on('close', function () {
        console.log('Done Streaming!')
        if (!data.set.at_last_track)
          getTrack(playToken, mixId, 'next')
      })
    })
  }

  self.record = record

  return self

}