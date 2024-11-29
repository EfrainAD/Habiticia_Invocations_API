import asyncHandler from 'express-async-handler'
import { equip, getUserData } from './habiticaAPI.js'
import { calulateHiestint } from './parseDataUtils.js'

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

export const equipGearByHightestInt = asyncHandler(
   async (attribute = 'int') => {
      const userData = await getUserData()

      const ownedGear = Object.keys(userData.items.gear.owned)
      const highestIntGear = await calulateHiestint(ownedGear)

      const equippedGear = userData.items.gear.equipped

      await equipGears(highestIntGear, equippedGear)
      return {
         postEquipGear: equippedGear,
         newlyEquippedGear: highestIntGear,
      }
   }
)
