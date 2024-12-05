const STAT_TYPES = ['str', 'int', 'con', 'per']

export const isValidStat = (stat) => STAT_TYPES.includes(stat)

export const validateStat = (stat) => {
   if (!isValidStat(stat)) {
      throw new Error(`Invalid stat: '${stat}' is not a stat.`)
   }
}
