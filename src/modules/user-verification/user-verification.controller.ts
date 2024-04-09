import { SendEmailRequest } from 'aws-sdk/clients/ses';
import { MongooseController } from 'cyberskill/controllers';
import { I_Return, T_FilterQuery, T_PopulateOptions } from 'cyberskill/typescript';
import { throwResponse } from 'cyberskill/utils';

import config from '#config';
import { T_SmsOptions, sendAutoEmail, sendAutoSMS } from '#modules/vendors';
import { E_IdentityType, I_Request } from '#shared/typescript';
import { UserVerificationModel } from './user-verification.model';
import {
    I_Input_Create_UserVerification,
    I_Input_Update_UserVerification,
    I_UserVerification,
} from './user-verification.types';

interface I_UserVerificationCtr {
    getUserVerification: (
        _,
        args: T_FilterQuery<I_UserVerification>,
        populate?: T_PopulateOptions,
    ) => Promise<I_Return<I_UserVerification>>;
    createUserVerification: (_, args: I_Input_Create_UserVerification) => Promise<I_Return<I_UserVerification>>;
    updateUserVerification: (
        req: I_Request,
        args: I_Input_Update_UserVerification,
    ) => Promise<I_Return<I_UserVerification>>;
    generateTempPassword: () => string;
    sendTempPassword: (identityType: string, identity: string, tempPassword: string) => Promise<string>;
    calculateTimeDifference: (otpResendTime: number, createdAt: Date) => number;
}

const mongooseCtr = new MongooseController<I_UserVerification>(UserVerificationModel);

export const userVerificationCtr: I_UserVerificationCtr = {
    getUserVerification: async (_, args, populate) => {
        return mongooseCtr.findOne(args, {}, {}, populate);
    },
    createUserVerification: async (_, args) => {
        const userVerificationCreated = await mongooseCtr.createOne(args);

        if (!userVerificationCreated.success) {
            throwResponse({
                message: userVerificationCreated.message,
            });
        }

        return userVerificationCreated;
    },
    updateUserVerification: async (req, args) => {
        const { id, ...rest } = args;

        const userVerificationFound = await userVerificationCtr.getUserVerification(req, { id });

        if (!userVerificationFound.success) {
            throwResponse({
                message: 'Không tìm thấy thông tin xác thực người dùng.',
            });
        }

        return mongooseCtr.updateOne(
            { id },
            {
                ...rest,
            },
        );
    },
    calculateTimeDifference: (otpResendTime: number, createdAt: Date) => otpResendTime - createdAt.getTime() / 1000,
    generateTempPassword: () => {
        const TEMP_PASSWORD_BASE_ON_ENV = {
            DEVELOPMENT: '12345678',
            STAGING: '12345678',
            PRODUCTION: Math.floor(1000 + Math.random() * 9000).toString(),
        };

        return TEMP_PASSWORD_BASE_ON_ENV[config.getCurrentEnvironment()];
    },
    sendTempPassword: async (identityType: string, identity: string, tempPassword: string) => {
        switch (identityType) {
            case E_IdentityType.PHONE: {
                const phonePayload: T_SmsOptions = {
                    to: identity,
                    body: `Mật khẩu mới của bạn là: ${tempPassword}`,
                };
                const isSendTempPasswordSuccess = await sendAutoSMS(phonePayload);
                if (!isSendTempPasswordSuccess) return 'error';
                return 'success';
            }
            case E_IdentityType.EMAIL: {
                const emailPayload: SendEmailRequest = {
                    Source: 'no-reply@good-goat.vn',
                    Destination: {
                        ToAddresses: [identity],
                    },
                    ReplyToAddresses: [''],
                    Message: {
                        Body: {
                            Html: {
                                Charset: 'UTF-8',
                                Data: `Mật khẩu mới của bạn là ${tempPassword}!`,
                            },
                        },
                        Subject: {
                            Charset: 'UTF-8',
                            Data: 'Yêu cầu đổi mật khẩu!',
                        },
                    },
                };
                const isSendTempPasswordSuccess = await sendAutoEmail(emailPayload);

                if (!isSendTempPasswordSuccess) {
                    return 'error';
                }

                return 'success';
            }
            default: {
                return 'error';
            }
        }
    },
};
