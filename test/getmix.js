var APIKEY = "fd44d5cd660dafd46ea7f989acba667720c17df3"
var emitMix = require('./../lib/mixEmitter')(APIKEY)

emitMix.on('mix', function (mix) {
  console.log(dateString(mix.date))

})

emitMix.on('error', function (data) {
  console.log('received error')
  console.log(data.status)
  console.log(data.errors)
})

emitMix.start('rustyspoons')


function dateString (dateObj) {
  var month = dateObj.getUTCMonth()
  var day = dateObj.getUTCDate()
  var year = dateObj.getUTCFullYear()

  return year + "/" + month + "/" + day
}
