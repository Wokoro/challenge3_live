const send = require('send-data/json')

module.exports = {
  sendSuccessResponse,
  sendErrorResponse,
  inputFilter,
  getHour,
  getAvailableTargets,
  sortTargetsByValue,
  dayElapsed,
  runScheduleTasks
}

/**
 * @description - Helper function to send data to client
 *
 * @param {object} req - HTTP request object
 *
 * @param {object} res - HTTP response object
 *
 * @param {object} data - Data to send to client
 *
 * @param {number} resCode - HTTP status code for response
 *
 * @param {string} message - Contextual message to send to client
 *
 * @returns {void} - Returns nothing
 */
function sendSuccessResponse (req, res, data = {}, resCode = 200, message = 'success') {
  send(req, res, {
    body: {
      status: 'success',
      code: resCode,
      message,
      data
    },
    statusCode: resCode
  })
}

/**
 *
 * @param {object} req - HTTP request object
 *
 * @param {object} res - HTTP response object
 *
 * @param {object} data - Data to send to client
 *
 * @param {number} resCode - HTTP status code to send
 *
 * @param {string} message - Error message to send to client
 *
 * @returns {void} - Returns nothing
 */
function sendErrorResponse (req, res, data = {}, resCode = 400, message = 'error') {
  send(req, res, {
    body: {
      status: 'error',
      code: resCode,
      message,
      data
    },
    statusCode: resCode
  })
}

/**
 * @description - Function to remove undefined attributes
 *
 * @param {object} object - Object to remove undefined attributes
 *
 * @returns {object} - Returns object with remove undefined attributes
 */
function inputFilter (object) {
  const _obj = {}

  for (const key in object) {
    if (object[key]) _obj[key] = object[key]
  }

  return _obj
}

/**
 * @description - Function to get hour in number from
 *
 * @param {string} timestamp - Timestamp string to get hour from
 *
 * @returns {string} - Returns hour value
 */
function getHour (timestamp) {
  const date = new Date(timestamp)
  const [,,,, time] = `${date.toUTCString()}`.split(' ')
  const hr = time.substr(0, 2)

  return hr
}

/**
 * @description - Function to get available targets
 *
 * @param {Array<object>} targets - Array of targets to sort
 *
 * @param {string} hr - Hour to check for
 *
 * @param {string} geoState - Geo state to check for
 *
 * @returns {array<>| array<object>} - Returns an array of objects or empty array
 */
function getAvailableTargets (targets, hr, geoState) {
  return targets.filter(target => {
    const canAccess = target.currentAccessCount < target.maximumAcceptPerDay
    const specifiedState = target.accept.geoState.includes(geoState)
    const specifiedHour = target.accept.hour.includes(Number(hr))

    return canAccess && specifiedState && specifiedHour
  })
}

/**
 * @description - Function to sort targets
 *
 * @param {Array<object>} targets - Array of targets to sort by value
 *
 * @returns <Array<object>| Array<> - Return sorted targets or empty array
 */
function sortTargetsByValue (targets) {
  return targets.sort((target1, target2) => target2 - target1)
}

/**
 * @description - Function to check d if a day has passed since timestamp
 *
 * @param {string} timestamp - Timestamp to check for
 */
function dayElapsed (timestamp) {
  const testTime = (new Date(timestamp)).getTime()
  const currentTime = (new Date()).getTime()

  return (((testTime - currentTime) / (1000 * 60 * 60)) >= 24)
}

/**
 * @description - Function to return scheduled tasks
 *
 * @param {Array<object>} tasks - Function to return schedule tasks
 *
 * @returns <void> Returns nothing
 */
function runScheduleTasks (tasks = []) {
  tasks.forEach(task => task.start())
}
