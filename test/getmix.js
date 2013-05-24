var APIKEY = "fd44d5cd660dafd46ea7f989acba667720c17df3"
  , API = require('./../lib/APIemitter')(APIKEY)
  , fs = require('fs')
  , path = require('path')
  , mkdirp = require('mkdirp')

var mixes = {}

API.on('mix', function (mix) {
    console.log(mix.name)
})


API.on('error', function (data) {
  console.log('received error')
  console.log(data.status)
  console.log(data.errors)
})

API.getMixes('PumperNuts', "view=liked")


function dateString (dateObj) {
  var month = dateObj.getUTCMonth()
  var day = dateObj.getUTCDate()
  var year = dateObj.getUTCFullYear()

  return year + "/" + month + "/" + day
}
