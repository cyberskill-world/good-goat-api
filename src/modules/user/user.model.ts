import { generateModel, validate } from 'cyberskill/utils';
import mongoose from 'mongoose';

import config from '#config';
import { I_User } from './user.types';

export const UserModel = generateModel<I_User>({
    mongoose,
    name: config.DATABASE_COLLECTIONS.USERS,
    pagination: true,
    schema: {
        displayName: {
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
        email: {
            type: String,
            validate: [
                {
                    validator: (value: string) => {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        return emailRegex.test(value);
                    },
                    message: 'Định dạng email không hợp lệ',
                },
            ],
        },
        phone: {
            type: Number,
            validate: [
                {
                    validator: (value: string) => {
                        const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/;
                        return phoneRegex.test(value);
                    },
                    message: 'Định dạng email không hợp lệ',
                },
            ],
        },
        googleId: {
            type: String,
        },
        facebookId: {
            type: String,
        },
        score: {
            type: Number,
            validate: [
                {
                    validator: (value: number) => Number.isInteger(value) && value >= 0,
                    message: 'Điểm không hợp lệ',
                },
            ],
        },
        coin: {
            type: Number,
            validate: [
                {
                    validator: (value: number) => Number.isInteger(value) && value >= 0,
                    message: 'Số xu không hợp lệ',
                },
            ],
        },
        diamond: {
            type: Number,
            validate: [
                {
                    validator: (value: number) => Number.isInteger(value) && value >= 0,
                    message: 'Số kim cương không hợp lệ',
                },
            ],
        },
        settings: {
            type: Object,
        },
        avatar: {
            type: String,
        },
    },
});
