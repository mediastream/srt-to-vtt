var tape = require('tape')
var srt2vtt = require('../')
var concat = require('concat-stream')
var fs = require('fs')

tape('empty', function (t) {
  var convert = srt2vtt()
  convert.end()
  convert.pipe(concat(function (data) {
    t.same(data.toString(), 'WEBVTT FILE\r\n\r\n')
    t.end()
  }))
})

tape('one entry', function (t) {
  var convert = srt2vtt()
  convert.write('1\r\n00:00:10,500 --> 00:00:13,000\r\nthis is a test\r\n\r\n')
  convert.end()
  convert.pipe(concat(function (data) {
    t.same(data.toString(), 'WEBVTT FILE\r\n\r\n1\r\n00:00:10.500 --> 00:00:13.000\r\nthis is a test\r\n\r\n')
    t.end()
  }))
})

tape('one entry with position an8', function (t) {
  var convert = srt2vtt()
  convert.write('1\r\n00:00:35.490 --> 00:00:38.720\r\n{\\an8}<i><font color="#ffff00">hello\r\n\r\n')
  convert.end()
  convert.pipe(concat(function (data) {
    t.same(data.toString(), 'WEBVTT FILE\r\n\r\n1\r\n00:00:35.490 --> 00:00:38.720 align:center line:0% position:50% size:100%\r\n<i><font color="#ffff00">hello\r\n\r\n')
    t.end()
  }))
})

tape('two entries', function (t) {
  var convert = srt2vtt()
  convert.write('1\r\n00:00:10,500 --> 00:00:13,000\r\nthis is a test\r\n\r\n2\r\n00:00:14,500 --> 00:00:15,000\r\nthis is a test\r\n\r\n')
  convert.end()
  convert.pipe(concat(function (data) {
    t.same(data.toString(), 'WEBVTT FILE\r\n\r\n1\r\n00:00:10.500 --> 00:00:13.000\r\nthis is a test\r\n\r\n2\r\n00:00:14.500 --> 00:00:15.000\r\nthis is a test\r\n\r\n')
    t.end()
  }))
})

tape('latin1 encoding', function (t) {
  var convert = srt2vtt()
  fs.createReadStream('./test/data/latin1.srt').pipe(convert).pipe(concat(function (data) {
    t.same(data.toString(), 'WEBVTT FILE\r\n\r\n1\r\n00:01:04.440 --> 00:01:07.318\r\n<i>Todo está bien, hijo.</i>\r\n\r\n2\r\n00:01:08.611 --> 00:01:13.491\r\n<i>Ya sé que quieres\r\nque esto se acabe.</i>\r\n\r\n3\r\n00:01:19.997 --> 00:01:22.124\r\n<i>Estoy aquí contigo.</i>\r\n\r\n')
    t.end()
  }))
})

tape('missing file ending CRLF', function (t) {
  var convert = srt2vtt()
  convert.write('1\r\n00:00:10,500 --> 00:00:13,000\r\nthis is a test\r\n\r\n2\r\n00:00:14,500 --> 00:00:15,000\r\nthis is a test\r\n')
  convert.end()
  convert.pipe(concat(function (data) {
    t.same(data.toString(), 'WEBVTT FILE\r\n\r\n1\r\n00:00:10.500 --> 00:00:13.000\r\nthis is a test\r\n\r\n2\r\n00:00:14.500 --> 00:00:15.000\r\nthis is a test\r\n\r\n')
    t.end()
  }))
})

tape('alignments', function (t) {
  var convert = srt2vtt()
  fs.createReadStream('./test/data/align.srt').pipe(convert).pipe(concat(function (data) {
    t.same(data.toString(), 'WEBVTT FILE\r\n\r\n1\r\n00:00:00.000 --> 00:00:05.000 align:end line:0% position:100% size:100%\r\nTexto en la esquina superior derecha\r\n\r\n2\r\n00:00:05.100 --> 00:00:10.100 align:center line:0% position:50% size:100%\r\nTexto en el centro superior\r\n\r\n3\r\n00:00:10.200 --> 00:00:15.200 align:start line:0% position:0% size:100%\r\nTexto en la esquina superior izquierda\r\n\r\n4\r\n00:00:15.300 --> 00:00:20.300 align:end line:50% position:100% size:100%\r\nTexto en la esquina derecha del medio\r\n\r\n5\r\n00:00:20.400 --> 00:00:25.400 align:center line:50% position:50% size:100%\r\nTexto en el centro medio\r\n\r\n6\r\n00:00:25.500 --> 00:00:30.500 align:start line:50% position:0% size:100%\r\nTexto en la esquina izquierda del medio\r\n\r\n7\r\n00:00:30.600 --> 00:00:35.600 align:end line:100% position:100% size:100%\r\nTexto en la esquina inferior derecha\r\n\r\n8\r\n00:00:35.700 --> 00:00:40.700 align:center line:100% position:50% size:100%\r\nTexto en el centro inferior\r\n\r\n9\r\n00:00:40.800 --> 00:00:45.800 align:start line:100% position:0% size:100%\r\nTexto en la esquina inferior izquierda\r\n\r\n')
    t.end()
  }))
})

tape('alignments not at the start of the line', function (t) {
  var convert = srt2vtt()
  fs.createReadStream('./test/data/align2.srt').pipe(convert).pipe(concat(function (data) {
    t.same(data.toString(), 'WEBVTT FILE\r\n\r\n1\r\n00:00:00.000 --> 00:00:05.000 align:center line:50% position:50% size:100%\r\nLaraira\r\n\r\n2\r\n00:00:00.000 --> 00:00:05.000 align:center line:100% position:50% size:100%\r\n<b><i>Cualquier cosa 1<i></b>\r\n<b><i><u>Cualquier cosa 2</u><i></b>\r\n\r\n')
    t.end()
  }))
})
