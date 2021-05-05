module.exports = {
  getAvailableTargets
}

/**
 * @description - Function to filter targets based on dynamic fields
 *
 * @param {Array<object>} targets - Array of targets to filter
 *
 * @param {object} criteria - object of criteria to filter
 *
 * @returns{Array<object>} - Returns array of targets found else empty array
 */
function getAvailableTargets (targets, criteria) {
  const criteriaKeys = Object.keys(criteria)
  const results = []
  let isPresent = true
  let canAccess = false
  let isHourAllowed = true

  for (let j = 0; j < targets.length; j++) {
    const target = targets[j]

    isPresent = true
    canAccess = target.currentAccessCount < target.maximumAcceptPerDay

    if (!canAccess) continue

    for (let i = 0; i < criteriaKeys.length; i++) {
      if (criteriaKeys[i] === 'timestamp') {
        isHourAllowed = target.accept.hour && target.accept.hour.includes(Number(getHour(criteria[criteriaKeys[i]])))

        if (!isHourAllowed) break

        continue
      }

      if (!target.accept[criteriaKeys[i]] || (!target.accept[criteriaKeys[i]].includes(criteria[criteriaKeys[i]]))) {
        isPresent = false

        break
      }
    }

    if (isPresent && isHourAllowed) results.push(target)
  }

  return results
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
