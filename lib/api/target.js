const jsonBody = require('body/json')
const targetRepo = require('../repositories/target')
const { sendErrorResponse, sendSuccessResponse, inputFilter, sortTargetsByValue } = require('../utils')
const { getAvailableTargets } = require('../utils/filters')
const { validate } = require('../utils/validation')

module.exports = {
  createTarget, getAllTargets, getTarget, updateTarget, requestPost
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
      return sendErrorResponse(req, res, {}, 400, 'An error occurred please try later')
    }

    const errors = validate(data, ['url', 'value', 'maximumAcceptPerDay', 'accept'])
    if (errors.length !== 0) return sendErrorResponse(req, res, errors, 406)

    targetRepo.createTarget(data, (err, data) => {
      if (err) {
        console.log('error: ', err)
        return sendErrorResponse(req, res, {}, 400, 'An error occurred please try later')
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

  const errors = validate(params, ['id'])
  if (errors.length !== 0) return sendErrorResponse(req, res, errors, 406)

  targetRepo.getById(id, (err, data) => {
    if (err) return sendErrorResponse(req, res)

    if (!data) return sendErrorResponse(req, res, [], 404, 'Target specified not found')

    sendSuccessResponse(req, res, data, 200, 'Target return successfully')
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
      return sendErrorResponse(req, res, {}, 400, 'An error occurred please try later')
    }

    const { id } = params

    const payload = inputFilter(data)

    const errors = validate({ id, ...payload }, ['id', ...Object.keys(payload)])
    if (errors.length !== 0) return sendErrorResponse(req, res, errors, 406)

    targetRepo.update(id, payload, (err, data) => {
      if (err) {
        console.log('error: ', err)
        return sendErrorResponse(req, res, {}, 400, 'An error occurred please try later')
      }
      if (!data) return sendErrorResponse(req, res, [], 404, 'Specified target not found')

      sendSuccessResponse(req, res, data, 200, 'Target updated successfully')
    })
  })
}

/**
 * @description - Function to return post decision

 * @param {object} req - HTTP request object
 *
 * @param {object} res - HTTP response object
 *
 * @param {object} opts - Optional request options
 *
 * @returns {object} - Returns request decision
 */
function requestPost (req, res, opts) {
  jsonBody(req, res, (err, data) => {
    if (err) return sendErrorResponse(req, res)

    const { publisher, ...search } = data

    const errors = validate(data, [])
    if (errors.length !== 0) return sendErrorResponse(req, res, errors, 406)

    targetRepo.getAll((err, data) => {
      if (err) return sendErrorResponse(req, res)

      const availTargets = getAvailableTargets(data, search)

      const [highestTarget] = sortTargetsByValue(availTargets)

      if (!highestTarget) return sendErrorResponse(req, res, { decision: 'rejected' }, 403, 'Unable to return URL')

      const { id, ..._payload } = highestTarget

      const targetUpdateData = {
        ..._payload,
        currentAccessCount: _payload.currentAccessCount + 1,
        lastAccessTimestamp: (new Date()).toISOString()
      }

      targetRepo.update(id, targetUpdateData, (err, data) => {
        if (err) return sendErrorResponse(req, res)

        sendSuccessResponse(req, res, { url: highestTarget.url }, 200, 'URL returned successfully')
      })
    })
  })
}
