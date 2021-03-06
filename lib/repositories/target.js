const cuid = require('cuid')
const redisClient = require('../redis')
const repoName = 'targets'

module.exports = { createTarget, getAll, getById, deleteAll, update }

/**
 * @description - Function to persist target
 *
 * @param {object} payload - Target data to save
 *
 * @param {function} cb - Callback function to execute both for error and success case
 *
 * @returns {object} - Returns the target created
 */
function createTarget (payload, cb) {
  const id = cuid()

  const _payload = {
    currentAccessCount: 0,
    lastAccessTimestamp: null
  }

  const data = JSON.stringify({ ...payload, ..._payload })

  redisClient.hset(repoName, id, data, (err, data) => {
    if (err) cb(err)

    cb(null, {
      id, ...payload
    })
  })
}

/**
 * @description - Function to return all targets from database
 *
 * @param {function} cb - Callback function to call on succes or failure
 *
 * @returns{Array<object>} - Returns array of targets found
 */
function getAll (cb) {
  redisClient.hgetall(repoName, (err, data) => {
    if (err) return cb(err)
    const response = []

    for (const key in data) {
      response.push({ id: key, ...(JSON.parse(data[key])) })
    }

    cb(null, response)
  })
}

/**
 * @description - Function to get single target by ID
 *
 * @param {number} id - ID of target to return
 *
 * @param {function} cb - Callback function to execute
 *
 * @param {object | null} - Returns object if found else null
 */
function getById (id, cb) {
  redisClient.hget(repoName, id, (err, data) => {
    if (err) return cb(err)
    if (!data) return cb()

    cb(null, { id, ...JSON.parse(data) })
  })
}

/**
 * @description - Function to empty target hash
 *
 * @param {function} cb - Callback function to call on success or error
 *
 * @returns {number} - Returns integer value indicating number records deleted
 */
function deleteAll (cb) {
  redisClient.del(repoName, (err, delCount) => {
    if (err) return cb(err)
    cb(null, delCount)
  })
}

/**
 * @description - Function for updating target
 *
 * @param {number} id - ID of target to update
 *
 * @param {object} payload - Data for updating
 *
 * @param {function} cb - Callback function to execute for success and failure case
 */
function update (id, payload, cb) {
  redisClient.hget(repoName, id, (err, data) => {
    if (err) return cb(err)
    if (!data) return cb()

    const { accept, ..._DBdata } = JSON.parse(data)

    const updatedData = {
      ..._DBdata,
      ...payload
    }

    const updatedDataStr = JSON.stringify(updatedData)

    redisClient.hset(repoName, id, updatedDataStr, (err, data) => {
      if (err) return cb(err)

      cb(null, {
        id, ...updatedData
      })
    })
  })
}
