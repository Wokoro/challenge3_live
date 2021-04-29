const redisClient = require('../redis')
const repoName = 'targets'

module.exports = { createTarget }

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
