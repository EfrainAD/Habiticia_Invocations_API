// .env Setup
import dotEnv from 'dotenv'
import { expand } from 'dotenv-expand'
expand(dotEnv.config())

// Imports
import express from 'express'
import axios from 'axios'
import asyncHandler from 'express-async-handler'

// Variables
const app = express()
const PORT = process.env.PORT || 8000
const headers = {
   'x-api-user': process.env.HABITICA_USER_ID,
   'x-api-key': process.env.HABITICA_API_KEY,
   'x-client': process.env.HABITICA_CLIENT,
}

// Check that the server is running
app.get('/', (req, res) => {
   res.send(`Hello, world! This is ${process.env.HABITICA_CLIENT}`)
})

// Check connectiong to habitica
app.get(
   '/habitica',
   asyncHandler(async (req, res) => {
      const response = await axios.get('https://habitica.com/api/v3/status', {
         headers,
      })

      res.json({ Habitica_Response: response.data })
   })
)

app.get(
   '/run-cron-task',
   asyncHandler(async (req, res) => {
      // Get Dailies from Habitica
      const response = await axios.get(
         'https://habitica.com/api/v3/tasks/user?type=dailys&isDue=true',
         { headers }
      )

      // Filter to only have Dailies that still need to be done today
      const dueDailies = response.data.data.filter(
         (task) => task.isDue && !task.completed
      )
      const dueDailiesCount = dueDailies.length

      // Run cron
      if (dueDailiesCount === 0) {
         const cronResponse = await axios.post(
            'https://habitica.com/api/v3/cron',
            {},
            { headers }
         )
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
      message: error.message,
      errorObj: process.env.NODE_ENV === 'development' ? error : null,
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
