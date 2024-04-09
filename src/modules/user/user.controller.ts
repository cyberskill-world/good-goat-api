import bcrypt from 'bcrypt';
import { RESPONSE_STATUS } from 'cyberskill/constants';
import { MongooseController } from 'cyberskill/controllers';
import {
    I_Return,
    T_Input_CreateOne,
    T_Input_DeleteOne,
    T_Input_FindOne,
    T_Input_FindPaging,
    T_Input_UpdateOne,
    T_PaginateResult,
} from 'cyberskill/typescript';
import { throwResponse } from 'cyberskill/utils';

import { I_Request } from '#shared/typescript';
import { UserModel } from './user.model';
import { I_Input_Create_User, I_Input_Delete_User, I_Input_Update_User, I_User } from './user.types';

const mongooseCtr = new MongooseController<I_User>(UserModel);

interface I_UserCtr {
    getUser: (req: I_Request, ...args: T_Input_FindOne<I_User>) => Promise<I_Return<I_User>>;
    getUsers: (req: I_Request, ...args: T_Input_FindPaging<I_User>) => Promise<I_Return<T_PaginateResult<I_User>>>;
    createUser: (req: I_Request, ...args: T_Input_CreateOne<I_Input_Create_User>) => Promise<I_Return<I_User>>;
    updateUser: (req: I_Request, ...args: T_Input_UpdateOne<I_Input_Update_User>) => Promise<I_Return<I_User>>;
    deleteUser: (req: I_Request, ...args: T_Input_DeleteOne<I_Input_Delete_User>) => Promise<I_Return<I_User>>;
}

export const userCtr: I_UserCtr = {
    getUser: async (_, filter, projection, options, populate) => {
        return mongooseCtr.findOne(filter, projection, options, populate);
    },
    getUsers: async (_, filter, options) => {
        return mongooseCtr.findPaging(filter, options);
    },
    createUser: async (req, doc) => {
        const { email, password, ...rest } = doc;

        const userFound = await userCtr.getUser(req, {
            email,
        });

        if (userFound.success) {
            throwResponse({
                message: 'Người dùng đã tồn tại.',
                status: RESPONSE_STATUS.BAD_REQUEST,
            });
        }

        const userCreated = await mongooseCtr.createOne({
            email,
            password: bcrypt.hashSync(password, 10),
            ...rest,
        });

        if (!userCreated.success) {
            throwResponse({
                message: userCreated.message,
            });
        }

        return userCreated;
    },
    updateUser: async (req, filter, update, options) => {
        const userFound = await userCtr.getUser(req, filter);

        if (!userFound.success) {
            throwResponse({
                message: 'Người dùng không tồn tại.',
            });
        }

        return mongooseCtr.updateOne(filter, update, options);
    },
    deleteUser: async (req, filter, options) => {
        const userFound = await userCtr.getUser(req, filter);

        if (!userFound.success) {
            throwResponse({
                message: 'Người dùng không tồn tại.',
                status: RESPONSE_STATUS.NOT_FOUND,
            });
        }

        return mongooseCtr.deleteOne(filter, options);
    },
};
