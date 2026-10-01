/**
 * Format estimated wait time in minutes.
 * If wait time is > 30 minutes, converts to hours (e.g. 45 mins -> 0.75 hr / 1 hr 15 mins).
 *
 * @param {number|string} minutes Estimated wait time in minutes
 * @param {function} t i18next translation function
 * @returns {string} Formatted wait time string
 */
export const formatWaitTime = (minutes, t) => {
  const mins = parseInt(minutes, 10) || 0;
  if (mins <= 0) {
    const minsUnit = t ? t('common.mins', { defaultValue: 'mins' }) : 'mins';
    return `0 ${minsUnit}`;
  }

  if (mins >= 60) {
    const wholeHours = Math.floor(mins / 60);
    const remMins = mins % 60;
    const singleHrUnit = t ? t('common.hr', { defaultValue: 'hr' }) : 'hr';
    const multiHrUnit = t ? t('common.hrs', { defaultValue: 'hrs' }) : 'hrs';
    const hrUnit = wholeHours === 1 ? singleHrUnit : multiHrUnit;
    const minsUnit = t ? t('common.mins', { defaultValue: 'mins' }) : 'mins';

    // If exact hour multiple (e.g. 60 min -> 1 hr, 120 min -> 2 hrs)
    if (remMins === 0) {
      return `${wholeHours} ${hrUnit}`;
    }

    // If over 60 mins with remaining mins (e.g. 104 mins -> 1 hr 44 mins)
    return `${wholeHours} ${singleHrUnit} ${remMins} ${minsUnit}`;
  }

  const minsUnit = t ? t('common.mins', { defaultValue: 'mins' }) : 'mins';
  return `${mins} ${minsUnit}`;
};
