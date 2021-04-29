const redisClient = require('../redis')
const repoName = 'targets'

module.exports = { createTarget, getAll, getById, deleteAll }

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
  redisClient.hlen(repoName, (err, length) => {
    if (err) return cb(err)

    const id = length + 1

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
