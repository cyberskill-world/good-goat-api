import { generateModel, validate } from 'cyberskill/utils';
import mongoose from 'mongoose';

import config from '#config';
import { I_User } from './user.types';

export const UserModel = generateModel<I_User>({
    mongoose,
    name: config.DATABASE_COLLECTIONS.USER,
    pagination: true,
    schema: {
        email: {
            type: String,
            validate: [
                {
                    validator: validate.common.isEmptyValidator(),
                    message: 'Vui lòng nhập email cho người dùng',
                },
                {
                    validator: validate.common.isUniqueValidator(['email']),
                    message: 'Email bị trùng lặp',
                },
            ],
        },
        fullName: {
            type: String,
        },
        password: {
            type: String,
            validate: [
                {
                    validator: validate.common.isEmptyValidator(),
                    message: 'Vui lòng nhập mật khẩu cho người dùng',
                },
            ],
        },
        phone: {
            type: String,
        },
    },
});
