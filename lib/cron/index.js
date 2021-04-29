const cron = require('node-cron')
const targetRepo = require('../repositories/target')
const { dayElapsed } = require('../utils')

const dailyTargetUpdateTask = cron.schedule('0 0 * * *', () => {
  console.log('Daily target update task started')

  targetRepo.getAll((err, targets) => {
    if (err) return console.log('Target update task error: ', err)

    targets.forEach(target => {
      const canUpdate = dayElapsed(target.lastAccessTimestamp)

      if (canUpdate) {
        const { id, ..._payload } = target
        const payload = { ..._payload, currentAccessCount: 0 }

        targetRepo.update(id, payload, (err, target) => {
          if (err) return console.log('Target update task error: ', err)
          console.log('Target updated successfully')
        })
      }
    })
  })
})

module.exports = [dailyTargetUpdateTask]
