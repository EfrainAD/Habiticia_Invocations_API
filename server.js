import dotEnv from 'dotenv'
import { expand } from 'dotenv-expand'
expand(dotEnv.config())

import express from 'express'
import axios from 'axios'

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

app.get('/habitica', async (req, res) => {
   try {
      const response = await axios.get('https://habitica.com/api/v3/status', {
         headers,
      })
      res.json({ Habitica_Response: response.data })
   } catch (error) {
      console.error('Error contacting Habitica API:', error)
      res.status(500).send('Error contacting Habitica API')
   }
})

app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`)
})
