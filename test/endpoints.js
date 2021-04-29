process.env.NODE_ENV = 'test'

var test = require('ava')
var servertest = require('servertest')

var server = require('../lib/server')

test.serial.cb('healthcheck', function (t) {
  var url = '/health'
  servertest(server(), url, { encoding: 'json' }, function (err, res) {
    t.falsy(err, 'no error')

    t.is(res.statusCode, 200, 'correct statusCode')
    t.is(res.body.status, 'OK', 'status is ok')
    t.end()
  })
})

test.serial.cb('target creation test', function (t) {
  var url = '/api/targets'
  var payload = { url: 'http://sample.com', value: 20, maximumAcceptPerDay: 20, geoState: ['ca', 'ng'], hour: [2, 3] }
  var opts = { encoding: 'json', method: 'POST' }

  servertest(server(), url, opts, (err, res) => {
    t.falsy(err)

    t.is(res.statusCode, 200)
    t.is(res.body.status, 'success')
    t.is(res.body.message, 'Target created successfully')

    t.end()
  }).end(JSON.stringify(payload))
})
