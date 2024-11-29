import asyncHandler from 'express-async-handler'
import { getHabiticaContentGear } from './habiticaAPI.js'

export const getUserHighestIntEquipment = (
   ownedGear,
   gearContent,
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
   if (typeof gearContent === 'object' && !gearContent.hasOwnProperty('int')) {
      for (const key in gearContent) {
         results = getUserHighestIntEquipment(
            ownedGear,
            gearContent[key],
            results
         )
      }
   } else {
      // Now have the last nested object
      // Check if owner owns it, and if gear is an int buff gear.
      if (ownedGear.includes(gearContent.key) && gearContent.int > 0) {
         const { type, twoHanded } = gearContent
         if (type === 'weapon') {
            if (twoHanded) {
               if (
                  results.weapon.twoHanded?.int < gearContent.int ||
                  Object.keys(results.weapon.twoHanded).length === 0
               ) {
                  results = {
                     ...results,
                     weapon: { ...results.weapon, twoHanded: gearContent },
                  }
               }
            } else {
               if (
                  results.weapon.oneHanded?.int < gearContent.int ||
                  Object.keys(results.weapon.oneHanded).length === 0
               ) {
                  results = {
                     ...results,
                     [type]: { ...results.weapon, oneHanded: gearContent },
                  }
               }
            }
         } else {
            // Every other gear that not type weapon
            if (
               results[type].int < gearContent.int ||
               Object.keys(results[type]).length === 0
            ) {
               results = { ...results, [type]: gearContent }
            }
         }
      }
   }
   return results
}

const getBestWeaponOption = ({ gear, attributes }) => {
   const oneHandedWeaponInt = gear.weapon.oneHanded?.[attributes] || 0
   const twoHandedWeaponInt = gear.weapon.twoHanded?.[attributes] || 0
   const shieldHandInt = gear.shield?.[attributes] || 0

   return oneHandedWeaponInt + shieldHandInt < twoHandedWeaponInt
}

export const calulateHiestint = asyncHandler(async (usersGear) => {
   const gearContent = await getHabiticaContentGear()
   const ownedHighestIntGear = getUserHighestIntEquipment(
      usersGear,
      gearContent
   )

   const isTwoHandedWeapon = getBestWeaponOption({
      gear: ownedHighestIntGear,
      attributes: 'int',
   })

   // Calculate the weapon setup should be two handed weapon or one in each hand
   const highestIntGearSetup = isTwoHandedWeapon
      ? {
           ...ownedHighestIntGear,
           weapon: ownedHighestIntGear.weapon.twoHanded,
           shield: {},
        }
      : {
           ...ownedHighestIntGear,
           weapon: ownedHighestIntGear.weapon.oneHanded,
           shield: ownedHighestIntGear.shield,
        }

   return highestIntGearSetup
})
