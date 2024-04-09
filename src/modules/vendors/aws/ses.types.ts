import { SendEmailRequest } from 'aws-sdk/clients/ses';

export type T_SendAutoEmail = (options: SendEmailRequest) => Promise<boolean>;
