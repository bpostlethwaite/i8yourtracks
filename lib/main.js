var APIKEY = "fd44d5cd660dafd46ea7f989acba667720c17df3"
  , BASE = 'http://8tracks.com'
  , emitMix = require('./lib/mixEmitter')(APIKEY)
  , recorder = require('./lib/recordMix')(APIKEY)

emitMix.start('No0ne')

emitMix.on('mix', function (mix) {
  console.log(mix.name)
  recorder.record(mix)
})
