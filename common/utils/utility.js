import { get as _get } from 'lodash';

const Utility = {
  /**
   * Returns false if value is a string with a length greater than zero,
   * otherwise true.
   */
  isNullOrEmpty(value) {
    return (
      undefined === value ||
      null === value ||
      ('string' === typeof value && 0 === value.length)
    );
  },

  /**
   * Helper function to extract message from Error object.
   * @param {Error} error
   */
  _getErrorMessage(error) {
    // Initialise with status code error.
    let message;
    if (!error.response) {
      message = 'Network Error: Unable to reach server.';
    } else {
      // Check all expected properties for an error message.
      const message1 = _get(error, 'response.data.error', null);
      const message2 = _get(error, 'response.data.Message', null);
      const message3 = _get(error, 'response.data.message', null);

      message = message1 || message2 || message3;
    }
    return message;
  },
  timeToSeconds(value) {
    const time = value.split(':');
    return time[0] * 3600 + time[1] * 60;
  },
  getTimeStringFromSeconds(seconds) {
    const sign = seconds < 0 ? '-' : '';
    seconds = Math.abs(seconds);
    const hours = Math.floor(seconds / 3600);
    const mints = Math.floor((seconds % 3600) / 60);
    return `${sign} ${hours} hrs ${mints > 0 ? mints + ' mins' : ''}`;
  },
  stringToHslColor(text, saturation, lightness) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${hash % 360}, ${saturation}%, ${lightness}%)`;
  },
};

export default Utility;
