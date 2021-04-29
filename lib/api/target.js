const jsonBody = require('body/json')
const targetRepo = require('../repositories/target')
const { sendErrorResponse, sendSuccessResponse } = require('../utils')

module.exports = {
  createTarget, getAllTargets
}

/**
 * @description - Controller function to create target
 *
 * @param {object} req -HTTP request object
 *
 * @param {object} res - HTTP response object
 *
 * @param {object} opts - Optional passed in parameters
 *
 * @returns {object} - Returns object created
 */
function createTarget (req, res, opts) {
  jsonBody(req, res, (err, data) => {
    if (err) {
      console.log('error: ', err)
      return sendErrorResponse(req, res, {}, 400, 'An error occured please try later')
    }

    const { url, value, maximumAcceptPerDay, geoState, hour } = data
    const _payload = { url, value, maximumAcceptPerDay, accept: { geoState, hour } }

    targetRepo.createTarget(_payload, (err, data) => {
      if (err) {
        console.log('error: ', err)
        return sendErrorResponse(req, res, {}, 400, 'An error occured please try later')
      }

      return sendSuccessResponse(req, res, data, 201, 'Target created successfully')
    })
  })
}

/**
 * @description - Controller functiono to return all targets
 *
 * @param {object} req -HTTP request object
 *
 * @param {object} res - HTTP response object
 *
 * @param {object} opts - Optional arguments passed
 *
 * @returns{Array<object>} - Returns array of targets
 */
function getAllTargets (req, res, opts) {
  targetRepo.getAll((err, data) => {
    if (err) return sendErrorResponse(req, res)

    sendSuccessResponse(req, res, data, 200, 'Targets returned successfully')
  })
}
