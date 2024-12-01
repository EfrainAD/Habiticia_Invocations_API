import asyncHandler from 'express-async-handler'
import { getHabiticaContentGear } from './habiticaAPI.js'

export const parseUserHighestGearByStat = (
   userClass,
   stat,
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
   if (typeof gearContent === 'object' && !gearContent.hasOwnProperty(stat)) {
      for (const key in gearContent) {
         results = parseUserHighestGearByStat(
            userClass,
            stat,
            ownedGear,
            gearContent[key],
            results
         )
      }
   } else {
      // Now have the last nested object
      // Check if
      // 1. The owner owns it
      // 2. If the gear is of the currect stat buff
      if (ownedGear.includes(gearContent.key) && gearContent[stat] > 0) {
         const { type, twoHanded } = gearContent
         // Add Class Bonus
         if (gearContent.klass === userClass) {
            gearContent[stat] *= 2
         }
         if (type === 'weapon') {
            if (twoHanded) {
               if (
                  results.weapon.twoHanded?.[stat] < gearContent[stat] ||
                  Object.keys(results.weapon.twoHanded).length === 0
               ) {
                  results = {
                     ...results,
                     weapon: { ...results.weapon, twoHanded: gearContent },
                  }
               }
            } else {
               if (
                  results.weapon.oneHanded?.[stat] < gearContent[stat] ||
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
               results[type][stat] < gearContent[stat] ||
               Object.keys(results[type]).length === 0
            ) {
               results = { ...results, [type]: gearContent }
            }
         }
      }
   }
   return results
}

// Check if user should use one handded weapon with shield, or a two handded weapon.
const getBestWeaponOption = ({ gear, stat }) => {
   // Option One - weapon and shield
   const oneHandedWeaponStat = gear.weapon.oneHanded?.[stat] || 0
   const shieldHandStat = gear.shield?.[stat] || 0

   const weaponAndShieldStat = oneHandedWeaponStat + shieldHandStat

   // Option Two - two handed weapon (No Shield)
   const twoHandedWeaponStat = gear.weapon.twoHanded?.[stat] || 0

   // Choose which option
   const isTwoHandedWeaponSetup = twoHandedWeaponStat > weaponAndShieldStat

   return isTwoHandedWeaponSetup
      ? {
           ...gear,
           weapon: gear.weapon.twoHanded,
           shield: {},
        }
      : {
           ...gear,
           weapon: gear.weapon.oneHanded,
           shield: gear.shield,
        }
}

export const getUserBestGearByStat = asyncHandler(
   async (userClass, stat, usersGear) => {
      const gearContent = await getHabiticaContentGear()

      const ownedHighestGearByStat = parseUserHighestGearByStat(
         userClass,
         stat,
         usersGear,
         gearContent
      )

      const optimalGearSetup = getBestWeaponOption({
         gear: ownedHighestGearByStat,
         stat: stat,
      })

      return optimalGearSetup
   }
)
