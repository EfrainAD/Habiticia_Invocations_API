// Imports
import './envSetup.js'
import express from 'express'
import asyncHandler from 'express-async-handler'
import {
   getHabiticaConnectionStatus,
   getHabiticaContentGear,
   getTodaysDueDailies,
   getUserData,
   runCron,
} from './habiticaAPI.js'
import { equipBestGearForStat, equipGears } from './habiticaActions.js'
import { parseUserEquippedGear } from './parseDataUtils.js'
import { validateStat } from './utils.js'

// Variables
const app = express()
const PORT = process.env.PORT || 8000
const CRON_GEAR_STAT = 'int'

// Check that the server is running
app.get('/', (req, res) => {
   res.send(`Hello, world! This is ${process.env.HABITICA_CLIENT}`)
})

// Check connectiong to habitica
app.get(
   '/habitica',
   asyncHandler(async (req, res) => {
      const status = await getHabiticaConnectionStatus()

      res.json({ Habitica_Response: status })
   })
)

// Get Info
app.get(
   '/info/:type',
   asyncHandler(async (req, res) => {
      const type = req.params.type
      let payload = {}

      switch (type) {
         case 'gear':
            payload = await getHabiticaContentGear()
            break
         case 'user':
            payload = await getUserData()
            break
         case 'userequipgear':
            const user = await getUserData()
            payload = parseUserEquippedGear(user)
            break
         default:
            throw new Error(`Path ${type} not found`)
            break
      }

      res.send(payload)
   })
)

// change weapon to the highest Int
app.post(
   '/changeGear/:stat',
   asyncHandler(async (req, res) => {
      const stat = req.params.stat

      validateStat(stat)

      await equipBestGearForStat(stat)

      res.json({
         message: `Request was sent to change equipped gear to be the users highest ${stat} setup`,
      })
   })
)

// Custom cron "run-cron-task"
app.get(
   '/run-cron-task/:stat',
   asyncHandler(async (req, res) => {
      const dueDailiesCount = await getTodaysDueDailies()
      const gearStat = req.params.stat || CRON_GEAR_STAT

      validateStat(gearStat)

      if (dueDailiesCount === 0) {
         const { postEquipGear, equippedGear } = await equipBestGearForStat(
            gearStat
         )

         const cronResponse = await runCron()

         await equipGears(postEquipGear, equippedGear)

         res.json({
            message: `Gear with the highest ${gearStat} was used before cron`,
            habiticaResponse: cronResponse.data,
         })
      } else {
         res.json({
            message: `Canceled do to haveing ${dueDailiesCount} dailies not competed.`,
         })
      }
   })
)

// Error Handling Middleware
app.use((error, req, res, next) => {
   res.status(500).json({
      message: error.message || 'An unexpected error occurred',
      details: error.response?.data || null,
      stack: process.env.NODE_ENV === 'development' ? error.stack : null,
   })
})

// Start the server
app.listen(PORT, () => {
   console.log(
      `Server is running on port ${PORT} ${
         process.env.NODE_ENV === 'development' ? 'in development' : ''
      }`
   )
})
