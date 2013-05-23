var APIKEY = "fd44d5cd660dafd46ea7f989acba667720c17df3"
var API = require('./../lib/APIemitter')(APIKEY)

API.on('mix', function (mix) {
  console.log(dateString(mix.date))

})

API.on('error', function (data) {
  console.log('received error')
  console.log(data.status)
  console.log(data.errors)
})

API.getAllMixes('no0ne')


function dateString (dateObj) {
  var month = dateObj.getUTCMonth()
  var day = dateObj.getUTCDate()
  var year = dateObj.getUTCFullYear()

  return year + "/" + month + "/" + day
}
