var APIKEY = "fd44d5cd660dafd46ea7f989acba667720c17df3"
var emitMix = require('./../lib/APIemitter')(APIKEY)

emitMix.on('user', function (user) {
  console.log(user)
})

emitMix.on('error', function (data) {
  console.log('received error')
  console.log(data.status)
  console.log(data.errors)
})

emitMix.getUser('rustyspoons')

