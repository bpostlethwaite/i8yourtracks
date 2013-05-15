var request = require('request')
  , JSONStream = require('JSONStream')
  , Emitter = require('events').EventEmitter


module.exports = function (APIKEY) {
  var self = new Emitter

  function start (user) {
    self.reqstr = 'http://8tracks.com' + '/users/' + user + '/mixes.json'
    getMixes(1)
  }

  function getMixes (page) {
    /*
     * Get all mixes on current page and then recurse onto next page
     */
    var tags = '?page=' + page + '&api_key=' + APIKEY
    var pstream = JSONStream.parse(true)
    request( self.reqstr + tags ).pipe(pstream)

    pstream.on('data', function (data) {
      Object.keys(data.mixes).forEach( function (mix) {
        self.emit('mix', {
          name: data.mixes[mix].name
        , id: data.mixes[mix].id
        , description: data.mixes[mix].description
        , numtracks: data.mixes[mix].tracks_count
        , coverUrl: data.mixes[mix].cover_urls.sq133
        , tags: data.mixes[mix].tag_list_cache
        , date: data.mixes[mix].first_published_at
        })
      })
      if (data.next_page)
        getMixes(data.next_page)
      else self.emit('end')
    })
  }

  self.start = start
  return self
}