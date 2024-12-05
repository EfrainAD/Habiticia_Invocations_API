import asyncHandler from 'express-async-handler'
import { equip, getUserData } from './habiticaAPI.js'
import {
   getUserBestGearByStat,
   parseOwnedGear,
   parseUserClass,
   parseUserEquippedGear,
} from './parseDataUtils.js'

export const equipGears = asyncHandler(async (gearsToEquip, currentGears) => {
   const allGearTypes = Object.keys(gearsToEquip)

   for (const gearType of allGearTypes) {
      const gear = gearsToEquip[gearType]
      const currentGear = currentGears[gearType]

      if (gear !== currentGear) {
         await equip(gear)
      }
   }
})
// Notes: habatica toggles equiping and unequiping, so you need make sure if the gear is already equiped to not send the request for that gear.

export const equipBestGearForStat = asyncHandler(async (stat) => {
   const userData = await getUserData()

   const userClass = parseUserClass(userData)
   const ownedGear = parseOwnedGear(userData)

   const bestGearByStat = await getUserBestGearByStat(
      userClass,
      stat,
      ownedGear
   )

   const equippedGear = parseUserEquippedGear(userData)

   await equipGears(bestGearByStat, equippedGear)

   return {
      postEquipGear: equippedGear,
      equippedGear: bestGearByStat,
   }
})
