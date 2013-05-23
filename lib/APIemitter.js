var request = require('request')
  , JSONStream = require('JSONStream')
  , Emitter = require('events').EventEmitter


module.exports = function (APIKEY) {
  var self = new Emitter

  function getAllMixes (user, extraTags) {
    var basereq = 'http://8tracks.com' + '/users/' + user + '/mixes.json'
    getMixes(basereq, 1, extraTags)
  }

  function getMixes (req, page, extraTags) {
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
          getMixes(nextpage)
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
        , avatar: user.avatar_urls.sq100
        })
      } else {
        self.emit('error', data)
      }
    })
  }

  self.getAllMixes = getAllMixes
  self.getUser = getUser

  return self
}
