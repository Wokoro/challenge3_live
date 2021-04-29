const send = require('send-data/json')

module.exports = {
  sendSuccessResponse,
  sendErrorResponse
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
