import { generateModel } from 'cyberskill/utils/mongoose';
import mongoose from 'mongoose';

import config from '#config';
import { E_IdentityType } from '#shared/typescript';
import { I_UserVerification } from './user-verification.types';

export const UserVerificationModel = generateModel<I_UserVerification>({
    mongoose,
    name: config.DATABASE_COLLECTIONS.USER_VERIFICATION,
    schema: {
        identity: {
            type: String,
            required: true,
            maxlength: 255,
        },
        identityType: {
            type: String,
            enum: Object.values(E_IdentityType),
            required: true,
        },
        userId: {
            type: String,
            ref: 'User',
            required: true,
        },
        hitCount: {
            type: Number,
            required: true,
            default: 0,
        },
        isTempBlocked: {
            type: Boolean,
            required: true,
            default: false,
        },
        tempBlockTime: Date,
    },
});
