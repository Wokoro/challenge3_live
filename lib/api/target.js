const jsonBody = require('body/json')
const targetRepo = require('../repositories/target')
const { sendErrorResponse, sendSuccessResponse, inputFilter } = require('../utils')

module.exports = {
  createTarget, getAllTargets, getTarget, updateTarget
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
 * @description - Controller function to return all targets
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

/**
 * @description - Controller function to get single target
 *
 * @param {object} req - HTTP request object
 *
 * @param {object} res - HTTP response object
 *
 * @param {object} opts - Optional parameter passed to request
 *
 * @returns{object} - Returns object found if any
 */
function getTarget (req, res, { params }) {
  const { id } = params

  targetRepo.getById(id, (err, data) => {
    if (err) return sendErrorResponse(req, res)

    if (!data) return sendErrorResponse(req, res, {}, 404, 'Target specified not found')

    sendSuccessResponse(req, res, data, 200, 'Target return successfuly')
  })
}

/**
 * @description - Controller function to update target
 *
 * @param {object} req - HTTP request object
 *
 * @param {object} res - HTTP response object
 *
 * @param {object} opts - Optional parameter to pass to request
 *
 * @returns {object} - Returns updated target
 */
function updateTarget (req, res, { params }) {
  jsonBody(req, res, (err, data) => {
    if (err) {
      console.log('error: ', err)
      return sendErrorResponse(req, res, {}, 400, 'An error occured please try later')
    }

    const { id } = params
    const payload = inputFilter(data)

    targetRepo.update(id, payload, (err, data) => {
      if (err) {
        console.log('error: ', err)
        return sendErrorResponse(req, res, {}, 400, 'An error occured please try later')
      }
      if (!data) return sendErrorResponse(req, res, {}, 404, 'Specified target not found')

      sendSuccessResponse(req, res, data, 200, 'Target updated succesfully')
    })
  })
}
