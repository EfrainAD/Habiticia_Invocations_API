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

// Test "test" NO CALL
function run(obj, results = {}) {
   if (typeof obj === 'object' && !obj.hasOwnProperty('int')) {
      for (const key in obj) {
         results = run(obj[key], results)
      }
   } else {
      console.log('yo', obj)
      console.log(results.int, obj.int)
      if (results.int < obj.int || results.int === undefined) {
         console.log(results.int, '<', obj.int)
         results = obj
      }
   }
   return results
}
const testObj = {
   a: { int: 2, key: 'c oool' },
   b: {
      b1: { b12: { key: 'by12', int: 30 }, b11: { key: 'by11', int: 2 } },
      b2: { key: 'by2', int: 23 },
   },
   c: { key: 'bat', int: 0 },
}
// console.log(run(testObj))
const runAxios = asyncHandler(async () => {
   const respons = await axios.get(
      'https://habitica.com/api/v3/user/anonymized',
      {
         headers,
      }
   )
   const ownedItems = Object.keys(respons.data.data.user.items.gear.owned)
   console.log({ ownedItems })
})
// runAxios()
// Test "test"
app.get(
   '/test',
   asyncHandler(async (req, res) => {
      const getUserHighestIntEquipment = (
         obj,
         results = {
            weapon: { oneHanded: {}, twoHanded: {} },
            armor: {},
            head: {},
            shield: {},
            back: {},
            body: {},
            headAccessory: {},
            eyewear: {},
         }
      ) => {
         // Drill to last object
         if (typeof obj === 'object' && !obj.hasOwnProperty('int')) {
            for (const key in obj) {
               results = getUserHighestIntEquipment(obj[key], results)
            }
         } else {
            // Now have the last nested object
            // Check if owner owns it, and if gear is an int buff gear.
            if (ownedGear.includes(obj.key) && obj.int > 0) {
               const { type, twoHanded } = obj
               if (type === 'weapon') {
                  if (twoHanded) {
                     if (
                        results.weapon.twoHanded?.int < obj.int ||
                        Object.keys(results.weapon.twoHanded).length === 0
                     ) {
                        results = {
                           ...results,
                           weapon: { ...results.weapon, twoHanded: obj },
                        }
                     }
                  } else {
                     if (
                        results.weapon.oneHanded?.int < obj.int ||
                        Object.keys(results.weapon.oneHanded).length === 0
                     ) {
                        results = {
                           ...results,
                           [type]: { ...results.weapon, oneHanded: obj },
                        }
                     }
                  }
               } else {
                  // Every other gear that not type weapon
                  if (
                     results[type].int < obj.int ||
                     Object.keys(results[type]).length === 0
                  ) {
                     results = { ...results, [type]: obj }
                  }
               }
            }
         }
         return results
      }

      const respons = await axios.get(
         'https://habitica.com/api/v3/user/anonymized',
         { headers }
      )

      const postCronGear = respons.data.data.user.items.gear.equipped
      // const ownedGear = Object.keys(respons.data.data.user.items.gear.owned)

      // const habiticaContent = await axios.get(
      //    'https://habitica.com/api/v3/content'
      // )
      // const habiticaGearInfo = habiticaContent.data.data.gear.tree
      // const ownedHighestIntGear = getUserHighestIntEquipment(habiticaGearInfo)

      // Pick one hand weapon or two handed weapon
      // Get the INT values to evaluate best weapon choice
      // const oneHandedInt = ownedHighestIntGear.weapon.oneHanded?.int || 0
      // const twoHandedInt = ownedHighestIntGear.weapon.twoHanded?.int || 0
      // const shieldInt = ownedHighestIntGear.shield?.int || 0

      // Calculate the weapon setup to use at cron
      // const cronGear =
      //    oneHandedInt + shieldInt > twoHandedInt
      //       ? {
      //            ...ownedHighestIntGear,
      //            weapon: ownedHighestIntGear.weapon.oneHanded,
      //            shield: ownedHighestIntGear.shield,
      //         }
      //       : {
      //            ...ownedHighestIntGear,
      //            weapon: ownedHighestIntGear.weapon.twoHanded,
      //            shield: {},
      //         }

      res.json({
         // cronGear: cronGear,
         postCronGear: postCronGear,
         // todaysDropCount: respons.data.data.user.items.lastDrop.count,
         // siteData: habiticaGearInfo,
      })
   })
)

// change weapon to the highest Int
app.post(
   '/changeWeaponInt',
   asyncHandler(async (req, res) => {
      const getUserHighestIntEquipment = (
         obj,
         results = {
            weapon: { oneHanded: {}, twoHanded: {} },
            armor: {},
            head: {},
            shield: {},
            back: {},
            body: {},
            headAccessory: {},
            eyewear: {},
         }
      ) => {
         // Drill to last object
         if (typeof obj === 'object' && !obj.hasOwnProperty('int')) {
            for (const key in obj) {
               results = getUserHighestIntEquipment(obj[key], results)
            }
         } else {
            // Now have the last nested object
            // Check if owner owns it, and if gear is an int buff gear.
            if (ownedGear.includes(obj.key) && obj.int > 0) {
               const { type, twoHanded } = obj
               if (type === 'weapon') {
                  if (twoHanded) {
                     if (
                        results.weapon.twoHanded?.int < obj.int ||
                        Object.keys(results.weapon.twoHanded).length === 0
                     ) {
                        results = {
                           ...results,
                           weapon: { ...results.weapon, twoHanded: obj },
                        }
                     }
                  } else {
                     if (
                        results.weapon.oneHanded?.int < obj.int ||
                        Object.keys(results.weapon.oneHanded).length === 0
                     ) {
                        results = {
                           ...results,
                           [type]: { ...results.weapon, oneHanded: obj },
                        }
                     }
                  }
               } else {
                  // Every other gear that not type weapon
                  if (
                     results[type].int < obj.int ||
                     Object.keys(results[type]).length === 0
                  ) {
                     results = { ...results, [type]: obj }
                  }
               }
            }
         }
         return results
      }

      const userData = await axios.get(
         'https://habitica.com/api/v3/user/anonymized',
         { headers }
      )
      const currentGear = userData.data.data.user.items.gear.equipped
      const ownedGear = Object.keys(userData.data.data.user.items.gear.owned)

      const habiticaContent = await axios.get(
         'https://habitica.com/api/v3/content'
      )
      const habiticaGearInfo = habiticaContent.data.data.gear.tree

      const ownedHighestIntGear = getUserHighestIntEquipment(habiticaGearInfo)

      // Pick one hand weapon or two handed weapon
      // Get the INT values to evaluate best weapon choice
      const oneHandedInt = ownedHighestIntGear.weapon.oneHanded?.int || 0
      const twoHandedInt = ownedHighestIntGear.weapon.twoHanded?.int || 0
      const shieldInt = ownedHighestIntGear.shield?.int || 0

      // Calculate the weapon setup to use at cron
      const highestIntGear =
         oneHandedInt + shieldInt > twoHandedInt
            ? {
                 ...ownedHighestIntGear,
                 weapon: ownedHighestIntGear.weapon.oneHanded,
                 shield: ownedHighestIntGear.shield,
              }
            : {
                 ...ownedHighestIntGear,
                 weapon: ownedHighestIntGear.weapon.twoHanded,
                 shield: {},
              }

      const keys = Object.keys(highestIntGear)
      for (let i = 0; i < keys.length; i++) {
         const key = keys[i]
         if (
            highestIntGear[key].key &&
            highestIntGear[key].key !== currentGear[key]
         ) {
            const res = await axios.post(
               `https://habitica.com/api/v3/user/equip/equipped/${highestIntGear[key].key}`,
               {},
               { headers }
            )
         }
      }

      res.json({
         message: 'Request was sent',
      })
   })
)

// Custom cron "run-cron-task"
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
