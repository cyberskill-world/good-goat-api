import {
    I_Input_CreateOne,
    I_Input_DeleteOne,
    I_Input_FindOne,
    I_Input_FindPaging,
    I_Input_UpdateOne,
    I_Return,
    T_PaginateResult,
} from 'cyberskill/typescript';

import { I_Context } from '#shared/typescript';
import { userCtr } from './user.controller';
import { I_Input_Create_User, I_Input_Delete_User, I_Input_Update_User, I_User } from './user.types';

interface I_UserResolver {
    Query: {
        getUser: (_, args: I_Input_FindOne<I_User>, context: I_Context) => Promise<I_Return<I_User>>;
        getUsers: (
            _,
            args: I_Input_FindPaging<I_User>,
            context: I_Context,
        ) => Promise<I_Return<T_PaginateResult<I_User>>>;
    };
    Mutation: {
        createUser: (_, args: I_Input_CreateOne<I_Input_Create_User>, context: I_Context) => Promise<I_Return<I_User>>;
        updateUser: (_, args: I_Input_UpdateOne<I_Input_Update_User>, context: I_Context) => Promise<I_Return<I_User>>;
        deleteUser: (_, args: I_Input_DeleteOne<I_Input_Delete_User>, context: I_Context) => Promise<I_Return<I_User>>;
    };
}

export default {
    Query: {
        getUser: (_, { filter, projection, options, populate }, { req }) =>
            userCtr.getUser(req, filter, projection, options, populate),
        getUsers: (_, { filter, options }, { req }) => userCtr.getUsers(req, filter, options),
    },
    Mutation: {
        createUser: (_, { doc }, { req }) => userCtr.createUser(req, doc),
        updateUser: (_, { filter, update, options }, { req }) => userCtr.updateUser(req, filter, update, options),
        deleteUser: (_, { filter, options }, { req }) => userCtr.deleteUser(req, filter, options),
    },
} as I_UserResolver;
