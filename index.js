var split = require('split2')
var pumpify = require('pumpify')
var through = require('through2')
var utf8 = require('to-utf-8')

const align = ['start', 'center', 'end']

function getAlignment (_, number) {
  const n = Number(number) - 1
  return [
    '',
    `align:${align[n % 3]}`,
    `line:${100 - (Math.floor(n / 3) * 50)}%`,
    `position:${Math.floor(n % 3) * 50}%`,
    'size:100%'
  ].join(' ')
}

module.exports = function () {
  var buf = []

  var convert = function () {
    return buf.join('\r\n')
      .replace(/\{\\([ibu])\}/g, '</$1>')
      .replace(/\{\\([ibu])1\}/g, '<$1>')
      .replace(/\{([ibu])\}/g, '<$1>')
      .replace(/\{\/([ibu])\}/g, '</$1>')
      .replace(/(\d\d:\d\d:\d\d),(\d{3})/g, '$1.$2')
      // Handle position tags, independent of where they are placed in the cue
      .replace(/(-->\s*\d\d:\d\d:\d\d\.\d{3})\s*\r\n(?=(?:.|\r\n)*\{\\an(\d)\})/, (_, m1, m2) => {
        return `${m1}${getAlignment(null, m2)}\r\n`
      })
      .replace(/\{\\an(\d)\}/g, '') +
      '\r\n\r\n'
  }

  var write = function (line, enc, cb) {
    if (line.trim()) {
      buf.push(line.trim())
      return cb()
    }

    line = convert()

    buf = []
    cb(null, line)
  }

  var flush = function (cb) {
    if (buf.length) this.push(convert())
    cb()
  }

  var parse = through.obj(write, flush)
  parse.push('WEBVTT FILE\r\n\r\n')
  return pumpify(utf8({newline: false, detectSize: 4095}), split(), parse)
}
