// .env Setup
import dotEnv from 'dotenv'
import { expand } from 'dotenv-expand'
expand(dotEnv.config())

// Imports
import express from 'express'
import asyncHandler from 'express-async-handler'
import {
   equip,
   getHabiticaConnectionStatus,
   getHabiticaContentGear,
   getTodaysDueDailies,
   getUserData,
   runCron,
} from './habiticaAPI.js'

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

      const userData = await getUserData()
      res.json({ userData })
      const equippedGear = userData.items.gear.equipped
      const ownedGear = Object.keys(userData.data.data.user.items.gear.owned)

      const habiticaGearContent = getHabiticaContentGear()

      const ownedHighestIntGear =
         getUserHighestIntEquipment(habiticaGearContent)

      // Pick the best weapon combo
      // Get the INT values to evaluate best weapon choice
      const oneHandedInt = ownedHighestIntGear.weapon.oneHanded?.int || 0
      const twoHandedInt = ownedHighestIntGear.weapon.twoHanded?.int || 0
      const shieldInt = ownedHighestIntGear.shield?.int || 0

      // Calculate the weapon setup to use that will give a higher INT value
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

      const gearTypes = Object.keys(highestIntGear)
      for (let i = 0; i < gearTypes.length; i++) {
         const type = gearTypes[i]
         if (
            highestIntGear[type].key &&
            highestIntGear[type].key !== equippedGear[type]
         ) {
            await equip(highestIntGear[type].key)
         }
      }

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
         const cronResponse = await runCron()
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
