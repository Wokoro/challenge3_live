process.env.NODE_ENV = 'test'

var test = require('ava')
var servertest = require('servertest')

var server = require('../lib/server')
var targetRepo = require('../lib/repositories/target')

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

    t.is(res.statusCode, 201)
    t.is(res.body.status, 'success')
    t.is(res.body.message, 'Target created successfully')

    t.end()
  }).end(JSON.stringify(payload))
})

test.serial.cb('targets return test', function (t) {
  var url = '/api/targets'
  var targetData = {
    url: 'http://target1.com',
    value: 20,
    maximumAcceptPerDay: 20,
    accept: { geoState: ['ng', 'ny'], hour: [4, 9] }
  }
  var opts = { encoding: 'json', method: 'GET' }

  targetRepo.createTarget(targetData, (err, data) => {
    t.falsy(err)

    servertest(server(), url, opts, (err, res) => {
      t.falsy(err)

      t.is(res.statusCode, 200)
      t.is(res.body.status, 'success')
      t.is(res.body.message, 'Targets returned successfully')

      const targets = res.body.data
      targets.forEach(target => {
        t.truthy(target.url)
        t.truthy(target.maximumAcceptPerDay)
        t.truthy(target.value)
        t.truthy(target.accept.geoState)
        t.truthy(target.accept.hour)
      })

      t.end()
    })
  })
})

test.serial.cb('target returned successful test', function (t) {
  var url = '/api/target/1'
  var opts = { encoding: 'json', method: 'GET' }
  var targetData = {
    url: 'http://target',
    value: 20,
    maximumAcceptPerDay: 30,
    accept: { geoState: ['ng', 'pk'], hour: [3, 5] }
  }

  targetRepo.createTarget(targetData, targetReturnHelper)

  function targetReturnHelper (err, data) {
    t.falsy(err)

    servertest(server(), url, opts, (err, res) => {
      t.falsy(err)

      t.is(res.statusCode, 200)
      t.is(res.body.status, 'success')
      t.is(res.body.message, 'Target return successfuly')

      const target = res.body.data
      t.truthy(target.url)
      t.truthy(target.value)
      t.truthy(target.maximumAcceptPerDay)
      t.truthy(target.accept.geoState)
      t.truthy(target.accept.hour)

      t.end()
    })
  }
})

test.serial.cb('target not found test', function (t) {
  var url = '/api/target/1'
  var opts = { encoding: 'json', method: 'GET' }

  targetRepo.deleteAll((err, data) => {
    t.falsy(err)

    servertest(server(), url, opts, (err, res) => {
      t.falsy(err)

      t.is(res.statusCode, 404)
      t.is(res.body.status, 'error')
      t.is(res.body.message, 'Target specified not found')

      t.end()
    })
  })
})
