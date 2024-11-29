// Imports
import './envSetup.js'
import express from 'express'
import asyncHandler from 'express-async-handler'
import {
   getHabiticaConnectionStatus,
   getTodaysDueDailies,
   runCron,
} from './habiticaAPI.js'
import { calulateHiestint } from './parseDataUtils.js'
import { equipGearByHightestInt } from './habiticaActions.js'

// Variables
const app = express()
const PORT = process.env.PORT || 8000

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

// change weapon to the highest Int
app.post(
   '/changeWeaponInt',
   asyncHandler(async (req, res) => {
      await equipGearByHightestInt()

      res.json({
         message:
            'Request was sent to change equipped gear to be the users highest INT setup for a non INT based class',
      })
   })
)

// Custom cron "run-cron-task"
app.get(
   '/run-cron-task',
   asyncHandler(async (req, res) => {
      const dueDailiesCount = await getTodaysDueDailies()

      // Run cron
      if (dueDailiesCount === 0) {
         // Change weapon to hightest In, then wait.
         const cronResponse = await runCron()
         // Change back
         res.json(cronResponse.data)
      } else {
         res.json({
            message: ` Cancled do to haveing ${dueDailiesCount} dailies not competed.`,
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
