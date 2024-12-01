import asyncHandler from 'express-async-handler'
import { equip, getUserData } from './habiticaAPI.js'
import { getUserBestGearByStat } from './parseDataUtils.js'

const equipGears = asyncHandler(async (gearToEquip, currentGear) => {
   const allGearTypes = Object.keys(gearToEquip)
   for (const gearType of allGearTypes) {
      const gear = gearToEquip[gearType]

      if (gear.key && gear.key !== currentGear[gearType]) {
         await equip(gear.key)
      }
   }
})
// Notes: habatica toggles equiping and unequiping, so you need make sure if the gear is already equiped to not send the request for that gear.

export const equipBestGearForStat = asyncHandler(async (stat) => {
   const userData = await getUserData()

   const userClass = userData.stats.class
   const ownedGear = Object.keys(userData.items.gear.owned)
   const bestGearByStat = await getUserBestGearByStat(
      userClass,
      stat,
      ownedGear
   )

   const equippedGear = userData.items.gear.equipped

   await equipGears(bestGearByStat, equippedGear)

   return {
      postEquipGear: equippedGear,
      newlyEquippedGear: bestGearByStat,
   }
})
