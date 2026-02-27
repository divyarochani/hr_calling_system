import { format as dateFnsFormat, parseISO, addMinutes } from 'date-fns';

// IST is UTC+5:30
const IST_OFFSET_MINUTES = 330; // 5 hours 30 minutes

/**
 * Convert UTC date to IST and format
 * @param {string|Date} date - Date in UTC
 * @param {string} formatStr - Format string for date-fns
 * @returns {string} Formatted date in IST
 */
export const formatInIST = (date, formatStr = 'MMM dd, yyyy HH:mm') => {
  if (!date) return 'N/A';
  
  try {
    // Parse date if it's a string
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
    
    // Add IST offset (5 hours 30 minutes)
    const istDate = addMinutes(dateObj, IST_OFFSET_MINUTES);
    
    // Format
    return dateFnsFormat(istDate, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Get current time in IST
 * @returns {Date} Current date in IST
 */
export const getCurrentIST = () => {
  return addMinutes(new Date(), IST_OFFSET_MINUTES);
};

/**
 * Convert UTC to IST Date object
 * @param {string|Date} date - Date in UTC
 * @returns {Date} Date object in IST
 */
export const toIST = (date) => {
  if (!date) return null;
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
    return addMinutes(dateObj, IST_OFFSET_MINUTES);
  } catch (error) {
    console.error('Error converting to IST:', error);
    return null;
  }
};
