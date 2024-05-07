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
import { PetModel } from './pet.model';
import { I_Input_Create_Pet, I_Input_Delete_Pet, I_Input_Update_Pet, I_Pet } from './pet.types';

const mongooseCtr = new MongooseController<I_Pet>(PetModel);

interface I_PetCtr {
    getPet: (req: I_Request, ...args: T_Input_FindOne<I_Pet>) => Promise<I_Return<I_Pet>>;
    getPets: (req: I_Request, ...args: T_Input_FindPaging<I_Pet>) => Promise<I_Return<T_PaginateResult<I_Pet>>>;
    createPet: (req: I_Request, ...args: T_Input_CreateOne<I_Input_Create_Pet>) => Promise<I_Return<I_Pet>>;
    updatePet: (req: I_Request, ...args: T_Input_UpdateOne<I_Input_Update_Pet>) => Promise<I_Return<I_Pet>>;
    deletePet: (req: I_Request, ...args: T_Input_DeleteOne<I_Input_Delete_Pet>) => Promise<I_Return<I_Pet>>;
}

export const petCtr: I_PetCtr = {
    getPet: async (_, filter, projection, options, populate) => {
        return mongooseCtr.findOne(filter, projection, options, populate);
    },
    getPets: async (_, filter, options) => {
        return mongooseCtr.findPaging(filter, options);
    },

    createPet: async (req, doc) => {
        const { name, skills, ...rest } = doc;

        const userCreated = await mongooseCtr.createOne({
            name,
            skills,
            ...rest,
        });

        return userCreated;
    },
    updatePet: async (req, filter, update, options) => {
        const petFound = await petCtr.getPet(req, filter);
        const userUpdated = await mongooseCtr.updateOne(filter, update, options);

        return userUpdated;
    },
    deletePet: async (req, filter, options) => {
        return mongooseCtr.deleteOne(filter, options);
    },
};
