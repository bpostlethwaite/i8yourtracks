var hyperglue = require('./hyperglue')
  , fs = require('fs')
  , mrow = fs.readFileSync('html/mixrow.html', {encoding:'utf8'})
  , mheader = fs.readFileSync('html/mixheader.html', {encoding:'utf8'})
  , Emitter = require('events').EventEmitter
  , CheckMates = require('checkmates')

module.exports = function (table) {
/*
 * Pass in the table body element where the
 * row results are to be appended and it will
 * return a function with add and removeall
 * and other methods to manipulate the table
 */

  var self = new Emitter
  self.checker = CheckMates("mix-checkbox")

  var tbody = document.createElement('tbody')

  function setHeaders() {
    /*
     * Append elems and add checkbox events
     */
    var thead = document.createElement('thead')
    var mixHeader = hyperglue(mheader)
                    .querySelector('.mix-header')
    thead.appendChild(mixHeader)
    table.appendChild(thead)

    var master = self.checker.master("master-checkbox")
    mixHeader.querySelector('.checkbox')
    .appendChild(master)

    /*
     * Don't forget to append table body element After
     * Header element !
     */
    table.appendChild(tbody)
  }

  function add (mix) {
    /*
     * Append elems and add checkbox events
     */
    var mixRow = hyperglue(mrow, {
      '.mix-title': trim(mix.name, 44)
    , '.mix-description': trim(mix.description, 82)
    , '.mix-tags': mix.tags
    , '.mix-date': dateString(mix.date)
    , '.mix-cover': {
      'src': mix.coverUrl
    }
    }).querySelector('.mix-row')

    var check = self.checker.checkbox(mix.id)
    mixRow.querySelector('.checkbox')
    .appendChild(check)

    tbody.appendChild(mixRow)
  }

  function removeAll() {
    tbody.innerHTML = ''
    self.checker.removeAll()
  }

  function trim (text, len) {
    if (text.length > len)
      return text.slice(0, len-3) + "..."
    else return text
  }

  function dateString (dateObj) {
    var month = dateObj.getUTCMonth()
    var day = dateObj.getUTCDate()
    var year = dateObj.getUTCFullYear()

    return year + "/" + month + "/" + day
  }

  self.add = add
  self.removeAll = removeAll
  self.setHeaders = setHeaders

  return self

}
