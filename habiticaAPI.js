import asyncHandler from 'express-async-handler'
import axios from 'axios'

const headers = {
   'x-api-user': process.env.HABITICA_USER_ID,
   'x-api-key': process.env.HABITICA_API_KEY,
   'x-client': process.env.HABITICA_CLIENT,
}

export const getHabiticaContent = asyncHandler(async () => {
   const habiticaContent = await axios.get(
      'https://habitica.com/api/v3/content'
   )
   return habiticaContent
})

export const getHabiticaContentGear = asyncHandler(async () => {
   const habiticaContent = await axios.get(
      'https://habitica.com/api/v3/content'
   )
   return habiticaContent.data.data.gear.tree
})

export const getUserData = asyncHandler(async () => {
   const userData = await axios.get(
      'https://habitica.com/api/v3/user/anonymized',
      {
         headers,
      }
   )

   return userData.data.data.user
})

export const getTodaysDueDailies = asyncHandler(async () => {
   const res = await axios.get(
      'https://habitica.com/api/v3/tasks/user?type=dailys&isDue=true',
      { headers }
   )
   const todaysDailies = res.data.data

   // Filter to only have Dailies that still need to be done today
   const dueDailies = todaysDailies.filter(
      (task) => task.isDue && !task.completed
   )

   return dueDailies.length
})

export const runCron = asyncHandler(async () => {
   const res = await axios.post(
      'https://habitica.com/api/v3/cron',
      {},
      { headers }
   )
   return res.data
})

export const getHabiticaConnectionStatus = asyncHandler(async () => {
   const res = await axios.get('https://habitica.com/api/v3/status', {
      headers,
   })
   return res.data.data
})

export const equip = asyncHandler(async (gearKey) => {
   const res = await axios.post(
      `https://habitica.com/api/v3/user/equip/equipped/${gearKey}`,
      {},
      { headers }
   )
   return res.data
})
