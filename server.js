import dotEnv from 'dotenv'
import { expand } from 'dotenv-expand'
expand(dotEnv.config())

import express from 'express'
import axios from 'axios'
import asyncHandler from 'express-async-handler'

const app = express()
const PORT = process.env.PORT || 8000
const headers = {
   'x-api-user': process.env.HABITICA_USER_ID,
   'x-api-key': process.env.HABITICA_API_KEY,
   'x-client': process.env.HABITICA_CLIENT,
}

app.get('/', (req, res) => {
   res.send(`Hello, world! ${process.env.HABITICA_CLIENT}`)
})

app.get(
   '/habitica',
   asyncHandler(async (req, res) => {
      const response = await axios.get('https://habitica.com/api/v3/status', {
         headers,
      })

      res.json({ Habitica_Response: response.data })
   })
)

app.use((error, req, res, next) => {
   res.status(500).json({
      message: error.message,
      errorObj: process.env.NODE_ENV === 'development' ? error : null,
   })
})

app.listen(PORT, () => {
   console.log(
      `Server is running on port ${PORT} ${
         process.env.NODE_ENV === 'development' ? 'in development' : ''
      }`
   )
})
