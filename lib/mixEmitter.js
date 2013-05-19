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
      if (data.status === "200 OK") {
        var mixes = data.mix_set.mixes
        var nextpage = data.mix_set.pagination.next_page
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

  self.start = start
  return self
}
