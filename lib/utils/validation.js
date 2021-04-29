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
    check = validators[`${field}Validator`]?.(payload)
    if (!check) throw new Error(`Validator: "${field} isn't supported`)
    if (!check.isValid) errors.push(check.msg)
  }

  return errors.flat(1)
}

function hourValidator (payload) {
  let isValid = true
  const msg = ['Valid']

  if (!payload?.hour) {
    isValid = false
    msg.push('"hour" value, must be provided')
  } else {
    if (!Array.isArray(payload.hour)) {
      msg.push('"hour" array can be empty')
    } else {
      if (payload.hour.length === 0) {
        msg.push(`Invalid "hour" value must be an array got: ${typeof payload.hour}`)
      } else {
        for (let i = 0; i < payload.hour.length; i++) {
          if (!Number(payload.hour[i]) || Number(payload.hour[i]) > 23 || Number(payload.hour[i]) < 0) {
            msg.push(`"hour" contains an invalid hour: "${payload.hour[i]}", hour must be an integer and between "0 - 23"`)
          }
        }
      }
    }
  }

  return { isValid, msg }
}

function geoStateValidator (payload) {
  let isValid = true
  let msg = ['Valid']

  if (!payload?.geoState) {
    isValid = false
    msg = '"geoState" value, must be provided'
  } else {
    if (!Array.isArray(payload.geoState)) {
      msg = `Invalid "geoState" value must be an array got: ${typeof payload.geoState}`
    } else {
      if (payload.geoState.length === 0) {
        msg = '"geoState" array can be empty'
      } else {
        for (let i = 0; i < payload.geoState.length; i++) {
          if (/[a-zA-Z]{2}/.test(payload.geoState[i])) {
            msg = `"geoState" contains an invalid geoState: "${payload.geoState[i]}"`
          }
        }
      }
    }
  }

  return { isValid, msg }
}

function urlValidator (payload) {
  let isValid = true
  let msg = 'Valid'

  if (!payload?.url) {
    isValid = false
    msg = '"url" value, must be provided'
  } else {
    if (!/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}/.test(payload.url)) {
      msg = `Invalid "url", value must be a valid url got: ${payload.url}`
      isValid = false
    }
  }

  return { isValid, msg }
}

function timestampValidator (payload) {
  let isValid = true
  let msg = 'Valid'

  if (!payload?.timestamp) {
    isValid = false
    msg = '"timestamp" value, must be provided'
  } else if (payload.timestamp) {
    if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(payload.timestamp)) {
      msg = `Invalid "timestamp", value must be a timestamp got: ${payload.timestamp}, e.g 2018-07-19T03:28:59.513Z`
      isValid = false
    }
  }

  return { isValid, msg }
}

function maximumAcceptPerDayValidator (payload) {
  let isValid = true
  let msg = 'Valid'

  if (!payload?.maximumAcceptPerDay) {
    isValid = false
    msg = '"maximumAcceptPerDay" value, must be provided'
  } else if (payload.maximumAcceptPerDay) {
    if (!Number(payload.maximumAcceptPerDay)) {
      msg = `Invalid "maximumAcceptPerDay", value must be an integer got: "${payload.maximumAcceptPerDay}"`
      isValid = false
    }
  }

  return { isValid, msg }
}

function idValidator (payload) {
  let isValid = true
  let msg = 'Valid'

  if (!payload?.id) {
    isValid = false
    msg = '"ID" value, must be provided'
  } else if (!Number(payload?.id)) {
    isValid = false
    msg = `Invalid "ID" value, ID must be an integer got: "${payload.id}"`
  }

  return { isValid, msg }
}

function valueValidator (payload) {
  const isValid = true
  let msg = 'Valid'

  if (!payload.value) {
    msg = '"value" value, must be provided'
  } else if (payload.value) {
    if (!Number(payload.value)) {
      msg = `Invalid "value", value must be an integer got: "${payload.value}"`
    }
  }

  return { isValid, msg }
}
