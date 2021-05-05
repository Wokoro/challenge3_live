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
  var payload = { url: 'http://sample.com', value: 20, maximumAcceptPerDay: 20, accept: { geoState: ['ca', 'ng'], hour: [2, 3] } }
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
  var url = '/api/target'
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

    servertest(server(), `${url}/${data.id}`, opts, (err, res) => {
      t.falsy(err)

      t.is(res.statusCode, 200)
      t.is(res.body.status, 'success')
      t.is(res.body.message, 'Target return successfully')

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
  var url = '/api/target/cko5s0a2n0004oojv2u9n4v4p'
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

test.serial.cb('target update successful test', function (t) {
  var url = '/api/target'
  var opts = { encoding: 'json', method: 'POST' }
  var updateData = {
    value: 22,
    url: 'http://updatetarget.com',
    maximumAcceptPerDay: 21,
    accept: {
      geoState: ['ny'],
      hour: [1, 4, 5]
    }
  }
  var targetData = {
    url: 'http://target.com',
    value: 20,
    maximumAcceptPerDay: 24,
    accept: { geoState: ['ng', 'ny'], hour: [1, 5] }
  }

  targetRepo.createTarget(targetData, targetUpdateHelper)

  function targetUpdateHelper (err, newTarget) {
    t.falsy(err)

    servertest(server(), `${url}/${newTarget.id}`, opts, (err, res) => {
      t.falsy(err)

      t.is(res.statusCode, 200)
      t.is(res.body.status, 'success')
      t.is(res.body.message, 'Target updated successfully')

      const updatedTarget = res.body.data
      t.is(updatedTarget.id, newTarget.id)
      t.is(updatedTarget.value, updateData.value)
      t.is(updatedTarget.maximumAcceptPerDay, updateData.maximumAcceptPerDay)
      t.deepEqual(updatedTarget.accept, updateData.accept)

      t.end()
    }).end(JSON.stringify(updateData))
  }
})

test.serial.cb('target update not found test', function (t) {
  var url = '/api/target/cko5s0a2n0004oojv2u9n4v4w'
  var opts = { encoding: 'json', method: 'POST' }
  var updateData = {
    value: 22,
    url: 'http://updatetarget.com',
    maximumAcceptPerDay: 21,
    accept: {
      geoState: ['ny'],
      hour: [1, 4, 5]
    }
  }

  targetRepo.deleteAll(targetUpdateHelper)

  function targetUpdateHelper (err, newTarget) {
    t.falsy(err)

    servertest(server(), url, opts, (err, res) => {
      t.falsy(err)

      t.is(res.statusCode, 404)
      t.is(res.body.status, 'error')
      t.is(res.body.message, 'Specified target not found')
      t.end()
    }).end(JSON.stringify(updateData))
  }
})

test.serial.cb('url return test 1', function (t) {
  var url = '/api/route'
  var opts = { encoding: 'json', method: 'POST' }
  var requestData = {
    geoState: 'ca',
    timestamp: '2018-07-19T05:28:59.513Z',
    publisher: 'abc'
  }
  var targetData = {
    value: 32,
    url: 'http://custom1.com',
    maximumAcceptPerDay: 5,
    accept: { geoState: ['ca', 'ny'], hour: [1, 5] }
  }

  targetRepo.deleteAll(() => {
    targetRepo.createTarget(targetData, targetPopulate)
  })

  function targetPopulate (err, data) {
    if (err) t.falsy(err)

    targetRepo.createTarget({ ...targetData, value: 40, url: 'http://custom1a.com' }, urlReturnHelper)
  }

  function urlReturnHelper (err, data) {
    t.falsy(err)

    servertest(server(), url, opts, (err, res) => {
      t.falsy(err)

      t.is(res.statusCode, 200)
      t.is(res.body.status, 'success')
      t.is(res.body.message, 'URL returned successfully')
      t.is(res.body.data.url, 'http://custom1a.com')

      t.end()
    }).end(JSON.stringify(requestData))
  }
})

test.serial.cb('url return test 2', function (t) {
  var url = '/api/route'
  var opts = { encoding: 'json', method: 'POST' }
  var requestData = {
    team: 5,
    country: 'ng',
    publisher: 'abc'
  }
  var targetData = {
    value: 32,
    url: 'http://custom2.com',
    maximumAcceptPerDay: 5,
    accept: { team: [3, 5, 2], country: ['ng', 'ny'] }
  }

  targetRepo.deleteAll(() => {
    targetRepo.createTarget(targetData, targetPopulate)
  })

  function targetPopulate (err, data) {
    if (err) t.falsy(err)

    targetRepo.createTarget({ ...targetData, value: 40, url: 'http://custom2a.com' }, urlReturnHelper)
  }

  function urlReturnHelper (err, data) {
    t.falsy(err)

    servertest(server(), url, opts, (err, res) => {
      t.falsy(err)

      t.is(res.statusCode, 200)
      t.is(res.body.status, 'success')
      t.is(res.body.message, 'URL returned successfully')
      t.is(res.body.data.url, 'http://custom2a.com')

      t.end()
    }).end(JSON.stringify(requestData))
  }
})

test.serial.cb('url return test 3', function (t) {
  var url = '/api/route'
  var opts = { encoding: 'json', method: 'POST' }
  var requestData = {
    lang: 'fr',
    timestamp: '2018-07-19T04:28:59.513Z',
    publisher: 'abc'
  }
  var targetData = {
    value: 32,
    url: 'http://custom3.com',
    maximumAcceptPerDay: 5,
    accept: { lang: ['en', 'fr'], hour: [1, 3, 4] }
  }

  targetRepo.deleteAll(() => {
    targetRepo.createTarget(targetData, targetPopulate)
  })

  function targetPopulate (err, data) {
    if (err) t.falsy(err)

    targetRepo.createTarget({ ...targetData, value: 40, url: 'http://custom3a.com' }, urlReturnHelper)
  }

  function urlReturnHelper (err, data) {
    t.falsy(err)

    servertest(server(), url, opts, (err, res) => {
      t.falsy(err)

      t.is(res.statusCode, 200)
      t.is(res.body.status, 'success')
      t.is(res.body.message, 'URL returned successfully')
      t.is(res.body.data.url, 'http://custom3a.com')

      t.end()
    }).end(JSON.stringify(requestData))
  }
})

test.serial.cb('url request error returned test', function (t) {
  var url = '/api/route'
  var opts = { encoding: 'json', method: 'POST' }
  var requestData = {
    geoState: 'ca',
    timestamp: '2018-07-19T05:28:59.513Z',
    publisher: 'abc'
  }

  targetRepo.deleteAll(urlReturnHelper)

  function urlReturnHelper (err, data) {
    t.falsy(err)

    servertest(server(), url, opts, (err, res) => {
      t.falsy(err)

      t.is(res.statusCode, 403)
      t.is(res.body.status, 'error')
      t.is(res.body.message, 'Unable to return URL')

      t.end()
    }).end(JSON.stringify(requestData))
  }
})
