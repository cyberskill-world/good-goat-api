import { I_Context } from '#shared/typescript';
import { authCtr } from './auth.controller';
import {
    I_Input_ChangePassword,
    I_Input_CheckAuth,
    I_Input_Login,
    I_Input_Register,
    I_Input_RequestPasswordReset,
    I_Response_Auth,
} from './auth.types';

interface I_AuthResolver {
    Query: {
        checkAuth: (_, args: I_Input_CheckAuth, context: I_Context) => Promise<I_Response_Auth>;
    };
    Mutation: {
        register: (_, args: I_Input_Register, context: I_Context) => Promise<I_Response_Auth>;
        login: (_, args: I_Input_Login, context: I_Context) => Promise<I_Response_Auth>;
        logout: (_, __, context: I_Context) => Promise<I_Response_Auth>;
        requestPasswordReset: (_, args: I_Input_RequestPasswordReset, context: I_Context) => Promise<I_Response_Auth>;
        changePassword: (_, args: I_Input_ChangePassword, context: I_Context) => Promise<I_Response_Auth>;
    };
}

export default {
    Query: {
        checkAuth: (_, args, { req }) => authCtr.checkAuth(req, args),
    },
    Mutation: {
        register: (_, args, { req }) => authCtr.register(req, args),
        login: (_, args, { req }) => authCtr.login(req, args),
        logout: (_, __, { req }) => authCtr.logout(req),
        requestPasswordReset: (_, args, { req }) => authCtr.requestPasswordReset(req, args),
        changePassword: (_, args, { req }) => authCtr.changePassword(req, args),
    },
} as I_AuthResolver;
