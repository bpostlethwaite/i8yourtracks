var request = require('request')
  , JSONStream = require('JSONStream')
  , Emitter = require('events').EventEmitter


module.exports = function (APIKEY) {
  var self = new Emitter

  function getMixes (user, extraTags) {
    var basereq = 'http://8tracks.com' + '/users/' + user + '/mixes.json'
    getPageMixes(basereq, 1, extraTags)
  }


  function getPageMixes (req, page, extraTags) {
    /*
     * Recursive function that gets all mixes on current
     * page, then calls itself with next page if available.
     */
    var tags = '?page=' + page + '&api_key=' + APIKEY
    if (extraTags)
      tags += '&' + extraTags

    var pstream = JSONStream.parse(true)
    request( req + tags ).pipe(pstream)

    pstream.on('data', function (data) {
      if (data.status === "200 OK") {
        var mixes = data.mixes
        var nextpage = data.next_page
        Object.keys(mixes).forEach( function (mix) {
          self.emit('mix', {
            name: mixes[mix].name
          , id: mixes[mix].id
          , description: mixes[mix].description
          , coverUrl: mixes[mix].cover_urls.sq56
          , tags: mixes[mix].tag_list_cache
          , date: new Date(mixes[mix].first_published_at)
          })
        })
        if (nextpage)
          getPageMixes(req, nextpage, extraTags)
        else self.emit('end')
      }
      else self.emit('error', data)
    })
  }


  function getUser(username) {
    var basereq = 'http://8tracks.com' + '/users/' + username + '.json'
    var tags = '?api_key=' + APIKEY
    var pstream = JSONStream.parse(true)
    request( basereq + tags ).pipe(pstream)

    pstream.on('data', function (data) {
      if (data.status === "200 OK") {
        var user = data.user
        self.emit('user', {
          name: user.slug
        , id: user.id
        , avatarURL: user.avatar_urls.sq56
        })
      } else {
        self.emit('error', data)
      }
    })
  }


  function getTracks(mix) {
    getPlayToken(function (playToken) {
      getTrack(playToken, mix, 'play')

    })
  }

  function getPlayToken (cb) {
    var pstream = JSONStream.parse(true)
    var playToken = 'http://8tracks.com/sets/new.json?api_key=' + APIKEY
    request(playToken).pipe(pstream)
    pstream.on('data', function (data) {
      if (data.status === "200 OK")
        cb(data.play_token)
      else self.emit('error', data)
    })
  }

  function getTrack (playToken, mix, cmd) {
    var pstream = JSONStream.parse(true)
    var startreq = 'http://8tracks.com' +
      '/sets/' + playToken+ '/' + cmd +
      '.json?mix_id=' + mix.id + '&api_key=' + APIKEY

    request(startreq).pipe(pstream)

    pstream.on('data', function (data) {
      var track = {
        artist: data.set.track.performer
      , trackName: data.set.track.name
      , mixID: mix.id
      , mixName: mix.name
      , stream: request(data.set.track.url)
      }
      self.emit('track', track)
      if (!data.set.at_last_track)
        getTrack(playToken, mix, 'next')
    })
  }

  self.getTracks = getTracks
  self.getMixes = getMixes
  self.getUser = getUser

  return self
}
