import * as AWS from 'aws-sdk';
import message from 'aws-sdk/lib/maintenance_mode_message.js';

import config from '#config';
import { T_SendAutoEmail } from './ses.types';

message.suppress = true;

const SES_CONFIG = {
    apiVersion: config.AWS.SES.API_VERSION,
    accessKeyId: config.AWS.SES.ACCESS_KEY_ID,
    secretAccessKey: config.AWS.SES.SECRET_ACCESS_KEY,
    region: config.AWS.SES.REGION,
} as const;

const AWSSendEmailService = new AWS.SES(SES_CONFIG);

export const sendAutoEmail: T_SendAutoEmail = async (options) => {
    try {
        await AWSSendEmailService.sendEmail(options).promise();
        return true;
    } catch (err) {
        return false;
    }
};
