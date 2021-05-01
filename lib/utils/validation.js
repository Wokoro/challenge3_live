const URL_REGEX = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}/
const TIMESTAMP_REGEX = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/

const validators = {
  idValidator,
  valueValidator,
  maximumAcceptPerDayValidator,
  timestampValidator,
  urlValidator,
  geoStateValidator,
  hourValidator
}

module.exports = {
  validate,
  idValidator,
  valueValidator,
  maximumAcceptPerDayValidator,
  timestampValidator,
  urlValidator,
  geoStateValidator,
  hourValidator
}

function validate (payload, fields = []) {
  const errors = []
  let check = {}

  for (const field of fields) {
    check = validators[`${field}Validator`] && validators[`${field}Validator`](payload)

    if (!check) throw new Error(`Validator: "${field} isn't supported`)
    if (!check.isValid) errors.push(check.msg)
  }

  return errors.flat(1)
}

function hourValidator (payload = {}) {
  let isValid = true
  const msg = []

  if (!payload.hour) {
    isValid = false
    msg.push('"hour" value, must be provided')

    return { isValid, msg }
  }

  if (!Array.isArray(payload.hour)) {
    msg.push('"hour" array can not be empty')
    isValid = false

    return { isValid, msg }
  }

  if (payload.hour.length === 0) {
    msg.push('"hour" array can not be empty')
    isValid = false

    return { isValid, msg }
  }

  let notHour = false

  for (let i = 0; i < payload.hour.length; i++) {
    notHour = (!Number(payload.hour[i]) && Number(payload.hour[i]) !== 0) ||
    Number(payload.hour[i]) > 23 ||
    Number(payload.hour[i]) < 0

    if (notHour) {
      msg.push(`invalid hour: "${payload.hour[i]}", hour must be between "0 - 23"`)
      isValid = false
    }
  }

  return { isValid, msg }
}

function geoStateValidator (payload = {}) {
  let isValid = true
  let msg = []

  if (!payload.geoState) {
    isValid = false
    msg = '"geoState" value, must be provided'

    return { isValid, msg }
  }

  if (payload.geoState.length === 0) {
    msg = '"geoState" array can not be empty'
    isValid = false

    return { isValid, msg }
  }

  if (!Array.isArray(payload.geoState)) {
    msg = `Invalid "geoState" value must be an array got: ${typeof payload.geoState}`
    isValid = false

    return { isValid, msg }
  }

  for (let i = 0; i < payload.geoState.length; i++) {
    if (!/[a-zA-Z]{2}/.test(payload.geoState[i])) {
      msg = `"geoState" contains an invalid geoState: "${payload.geoState[i]}"`
      isValid = false
    }
  }

  return { isValid, msg }
}

function urlValidator (payload = {}) {
  let isValid = true
  let msg = ''

  if (!payload.url) {
    isValid = false
    msg = '"url" value, must be provided'

    return { isValid, msg }
  }

  if (!URL_REGEX.test(payload.url)) {
    msg = `Invalid "url", value must be a valid url got: ${payload.url}`
    isValid = false
  }

  return { isValid, msg }
}

function timestampValidator (payload = {}) {
  let isValid = true
  let msg = ''

  if (!payload.timestamp) {
    isValid = false
    msg = '"timestamp" value, must be provided'

    return { isValid, msg }
  }

  if (!TIMESTAMP_REGEX.test(payload.timestamp)) {
    msg = `Invalid "timestamp", got: ${payload.timestamp}, e.g 2018-07-19T03:28:59.513Z`
    isValid = false
  }

  return { isValid, msg }
}

function maximumAcceptPerDayValidator (payload = {}) {
  let isValid = true
  let msg = ''

  if (!payload.maximumAcceptPerDay) {
    isValid = false
    msg = '"maximumAcceptPerDay" value, must be provided'

    return { isValid, msg }
  }

  if (!Number(payload.maximumAcceptPerDay)) {
    msg = `Invalid "maximumAcceptPerDay", value must be an integer got: "${payload.maximumAcceptPerDay}"`
    isValid = false
  }

  return { isValid, msg }
}

function idValidator (payload = {}) {
  let isValid = true
  let msg = ''

  if (!payload.id) {
    isValid = false
    msg = '"ID" value, must be provided'

    return { isValid, msg }
  }

  if (payload.id.length !== 25) {
    isValid = false
    msg = 'Invalid "ID" value, ID must be a valid cuid e.g: "cko5s0a2n0004oojv2u9n4v4w"'
  }

  return { isValid, msg }
}

function valueValidator (payload = {}) {
  let isValid = true
  let msg = ''

  if (!payload.value) {
    msg = '"value" value, must be provided'
    isValid = false
    return { isValid, msg }
  }

  if (!Number(payload.value)) {
    msg = `Invalid "value", value must be an integer got: "${payload.value}"`
    isValid = false
  }

  return { isValid, msg }
}
