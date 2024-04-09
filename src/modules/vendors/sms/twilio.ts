import { Twilio } from 'twilio';

import config from '#config';
import { T_SendAutoSMS } from './twilio.types';

export const sendAutoSMS: T_SendAutoSMS = async (options) => {
    const transport = new Twilio(config.SMS.TWILIO.ACCOUNT_SID, config.SMS.TWILIO.AUTH_TOKEN, {
        lazyLoading: true,
    });

    try {
        await transport.messages.create({ ...options, from: options?.from || config.SMS.TWILIO.SENDER_PHONE });
        return true;
    } catch (error) {
        return false;
    }
};
