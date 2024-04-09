import bcrypt from 'bcrypt';
import { RESPONSE_STATUS } from 'cyberskill/constants';
import { throwResponse } from 'cyberskill/utils';
import jwt from 'jsonwebtoken';
import omit from 'lodash/omit';

import config from '#config';
import { userCtr } from '#modules/user';
import { userVerificationCtr } from '#modules/user-verification';
import { I_Request } from '#shared/typescript';
import { PasswordEncrypt } from '#shared/utils/encrypt/password.encrypt';
import {
    I_Input_ChangePassword,
    I_Input_CheckAuth,
    I_Input_CheckToken,
    I_Input_GenerateToken,
    I_Input_Login,
    I_Input_Register,
    I_Input_RequestPasswordReset,
    I_Response_Auth,
} from './auth.types';

const TEMP_PASSWORD_RESEND_TIME_IN_SECONDS = 60;
const TEMP_PASSWORD_EXPIRATION_TIME_IN_MS = 3 * 60 * 1000;

interface I_AuthCtr {
    generateToken: (req: I_Request, { id }: I_Input_GenerateToken) => string;
    checkToken: (req: I_Request, args: I_Input_CheckToken) => Promise<I_Response_Auth>;
    checkAuth: (req: I_Request, args?: I_Input_CheckAuth) => Promise<I_Response_Auth>;
    login: (req: I_Request, args: I_Input_Login) => Promise<I_Response_Auth>;
    register: (req: I_Request, args: I_Input_Register) => Promise<I_Response_Auth>;
    logout: (req: I_Request) => Promise<I_Response_Auth>;
    requestPasswordReset: (req: I_Request, args: I_Input_RequestPasswordReset) => Promise<I_Response_Auth>;
    changePassword: (req: I_Request, args: I_Input_ChangePassword) => Promise<I_Response_Auth>;
}

export const authCtr: I_AuthCtr = {
    generateToken: (req, { id }) => {
        return jwt.sign({ iat: Date.now(), userId: id }, req.SECRET, {
            expiresIn: config.SESSION.MAX_AGE,
        });
    },
    checkToken: async (req, args) => {
        const { token } = args;
        const { userId, exp } = jwt.decode(token);

        const userFound = await userCtr.getUser(req, {
            id: userId,
        });

        if (!userFound.success || Date.now() > new Date(exp).getTime()) {
            throwResponse({
                message: 'Token không hợp lệ hoặc hết hạn.',
                status: RESPONSE_STATUS.UNAUTHORIZED,
            });
        }

        return {
            success: true,
        };
    },
    checkAuth: async (req, args) => {
        if (req?.session?.user) {
            const userFound = await userCtr.getUser(req, {
                id: req.session.user.id,
            });

            if (!userFound.success) {
                throwResponse({
                    message: 'Token không hợp lệ hoặc hết hạn.',
                    status: RESPONSE_STATUS.UNAUTHORIZED,
                });
            }

            return {
                success: true,
            };
        }

        if (args?.token) {
            return authCtr.checkToken(req, { token: args.token });
        }

        return {
            success: false,
        };
    },
    login: async (req, args) => {
        const authChecked = await authCtr.checkAuth(req);

        if (authChecked.success) {
            return authChecked;
        }

        const { identity, password, rememberMe } = args;

        const userFound = await userCtr.getUser(req, {
            $or: [{ email: identity }, { phone: identity }],
        });

        if (!userFound.success || !userFound.result) {
            throwResponse({
                message: 'Thông tin đăng nhập không đúng.',
                status: RESPONSE_STATUS.BAD_REQUEST,
            });
        }

        const isPasswordMatched = bcrypt.compareSync(password, userFound.result.password);

        if (!isPasswordMatched) {
            throwResponse({
                message: 'Thông tin đăng nhập không đúng.',
                status: RESPONSE_STATUS.BAD_REQUEST,
            });
        }

        const token = rememberMe ? authCtr.generateToken(req, { id: userFound.result.id }) : '';

        req.session.user = userFound.result;

        return {
            success: true,
            ...(token && { token }),
        };
    },
    register: async (req, args) => {
        const userCreated = await userCtr.createUser(req, {
            ...args,
        });

        if (!userCreated.success) {
            throwResponse({
                message: userCreated.message,
            });
        }

        req.session.user = omit(userCreated.result, 'password');

        return {
            success: true,
        };
    },
    logout: async (req) => {
        if (req?.session?.user) {
            req.session.destroy((err) => {
                if (err) {
                    throwResponse({
                        message: 'Đăng xuất thất bại.',
                    });
                }
            });

            return {
                success: true,
            };
        }

        throwResponse({
            message: 'Đăng xuất thất bại.',
        });
    },
    requestPasswordReset: async (req, { identityType, identity }) => {
        const userFound = await userCtr.getUser(req, {
            $or: [{ email: identity }, { phone: identity }],
        });

        if (!userFound.success || !userFound.result) {
            throwResponse({
                message: 'Người dùng không tồn tại.',
            });
        }

        const userVerificationFound = await userVerificationCtr.getUserVerification(req, { identity });

        if (!userVerificationFound.success) {
            throwResponse({
                message: 'Lỗi khi tìm kiếm thông tin người dùng.',
            });
        }

        if (userVerificationFound.result) {
            const userVerificationTimeInSeconds = userVerificationFound.result.createdAt.getTime() / 1000;

            if (userVerificationTimeInSeconds < TEMP_PASSWORD_RESEND_TIME_IN_SECONDS) {
                const time = userVerificationCtr.calculateTimeDifference(
                    TEMP_PASSWORD_RESEND_TIME_IN_SECONDS,
                    userVerificationFound.result.createdAt,
                );
                throwResponse({
                    message: `Vui lòng thử lại sau ${time} giây`,
                    status: RESPONSE_STATUS.TOO_MANY_REQUESTS,
                });
            }
        }

        const tempPassword = userVerificationCtr.generateTempPassword();
        const tempHashedPassword = await PasswordEncrypt.hashPassword(tempPassword);

        const expiresAt = new Date(Date.now() + TEMP_PASSWORD_EXPIRATION_TIME_IN_MS);

        await userVerificationCtr.createUserVerification(req, {
            userId: userFound.result.id,
            identity,
            identityType,
            tempPassword,
            expiresAt,
        });

        await userCtr.updateUser(req, { id: userFound.result.id }, { password: tempHashedPassword });

        const sendTempPasswordResult = await userVerificationCtr.sendTempPassword(identityType, identity, tempPassword);

        if (sendTempPasswordResult !== 'success') {
            throwResponse({
                message: 'Gửi mật khẩu tạm thất bại',
            });
        }

        return {
            message: 'Gửi mật khẩu tạm cho người dùng thành công',
            success: true,
        };
    },
    changePassword: async (req, { identityType, identity, oldPassword, newPassword, confirmNewPassword }) => {
        if (newPassword !== confirmNewPassword) {
            throwResponse({
                message: 'Mật khẩu mới và xác nhận không khớp',
                status: RESPONSE_STATUS.BAD_REQUEST,
            });
        }

        const userFound = await userCtr.getUser(req, {
            $or: [{ email: identity }, { phone: identity }],
        });

        if (!userFound.success || !userFound.result) {
            throwResponse({
                message: 'Người dùng không tồn tại.',
            });
        }

        const isPasswordMatch = await PasswordEncrypt.comparePassword(oldPassword, userFound.result.password);

        if (!isPasswordMatch) {
            throwResponse({
                message: 'Mật khẩu cũ không đúng',
                status: RESPONSE_STATUS.BAD_REQUEST,
            });
        }

        const newHashedPassword = await PasswordEncrypt.hashPassword(newPassword);

        const userUpdated = await userCtr.updateUser(req, { id: userFound.result.id }, { password: newHashedPassword });

        if (!userUpdated.success) {
            throwResponse({
                message: 'Đổi mật khẩu thất bại',
            });
        }

        // TODO: Send email or phone to notify user about password change
        // TODO: Delete user verification document after password change if needed ( case need otp )

        return {
            success: true,
        };
    },
};
