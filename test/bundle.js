;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){

var html = '<table>'
           + '<tr class="mixrow">'+
'  <td><input type="checkbox" class="mixselector"></td>'+
'  <td><img class="media-object"></td>'+
'  <td class="media-heading"></td>'+
'  <td class="mixdescription"></td>'+
'  <td class="mixtags"></td>'+
'  <td class="numtracks"></td>'+
'  <td class="mixdate"></td>'+
'</tr>' + '</table>'


function createrow (mix) {
  return hyperglue(html, {
    '.mixselector': {
      'value': String(mix.id)
    },
    '.media-heading': mix.name,
    '.mixdescription': mix.description,
    '.mixtags': mix.tags,
    '.numtracks': mix.numtracks,
    '.mixdate': mix.date,
    '.media-object': {
      'src': mix.coverUrl,
      'alt': mix.name
    }
  })
}

var mix = {
  id: 1234
, name: "numa"
, description: "thawt"
, tags: "one two three"
, numtracks: 4
, date: 12334343
, coverUrl: "http//:ping"
}


var tbody = document.querySelector('#mixbody')
tbody.appendChild( createrow(mix).querySelector('.mixrow') )

function hyperglue(src, updates) {
  if (!updates) updates = {};
  var div = src;
  if (typeof div !== 'object') {
    div = document.createElement('div');
    div.innerHTML = src.replace(/^\s+|\s+$/g, '');
    console.log(div.innerHTML)

    if (div.childNodes.length === 1
      && div.childNodes[0] && div.childNodes[0].constructor
                           && div.childNodes[0].constructor.name !== 'Text') {
      div = div.childNodes[0];
    }
  }

  forEach(Object.keys(updates), function (selector) {
    var value = updates[selector];
    var nodes = div.querySelectorAll(selector);
    if (nodes.length === 0) return;
    for (var i = 0; i < nodes.length; i++) {
      bind(nodes[i], value);
    }
  });

  return div;
};

function bind(node, value) {
  if (isElement(value)) {
    node.innerHTML = '';
    node.appendChild(value);
  }
  else if (value && typeof value === 'object') {
    forEach(Object.keys(value), function (key) {
      if (key === '_text') {
        setText(node, value[key]);
      }
      else if (key === '_html' && isElement(value[key])) {
        node.innerHTML = '';
        node.appendChild(value[key]);
      }
      else if (key === '_html') {
        node.innerHTML = value[key];
      }
      else node.setAttribute(key, value[key]);
    });
  }
  else setText(node, value);
}

function forEach(xs, f) {
  if (xs.forEach) return xs.forEach(f);
  for (var i = 0; i < xs.length; i++) f(xs[i], i)
}

function isElement (e) {
  return e && typeof e === 'object' && e.childNodes
                                    && typeof e.appendChild === 'function'
      || typeof e.appendChild === 'object'
  ;
}

function setText (e, s) {
  e.innerHTML = '';
  var txt = document.createTextNode(s);
  e.appendChild(txt);
}
},{}]},{},[1])
;