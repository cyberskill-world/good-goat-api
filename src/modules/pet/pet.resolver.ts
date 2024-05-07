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
import { petCtr } from './pet.controller';
import { I_Input_Create_Pet, I_Input_Delete_Pet, I_Input_Update_Pet, I_Pet } from './pet.types';

interface I_PetResolver {
    Query: {
        getPet: (_, args: I_Input_FindOne<I_Pet>, context: I_Context) => Promise<I_Return<I_Pet>>;
        getPets: (_, args: I_Input_FindPaging<I_Pet>, context: I_Context) => Promise<I_Return<T_PaginateResult<I_Pet>>>;
    };
    Mutation: {
        createPet: (_, args: I_Input_CreateOne<I_Input_Create_Pet>, context: I_Context) => Promise<I_Return<I_Pet>>;
        updatePet: (_, args: I_Input_UpdateOne<I_Input_Update_Pet>, context: I_Context) => Promise<I_Return<I_Pet>>;
        deletePet: (_, args: I_Input_DeleteOne<I_Input_Delete_Pet>, context: I_Context) => Promise<I_Return<I_Pet>>;
    };
}

export default {
    Query: {
        getPet: (_, { filter, projection, options, populate }, { req }) =>
            petCtr.getPet(req, filter, projection, options, populate),
        getPets: (_, { filter, options }, { req }) => petCtr.getPets(req, filter, options),
    },
    Mutation: {
        createPet: (_, { doc }, { req }) => petCtr.createPet(req, doc),
        updatePet: (_, { filter, update, options }, { req }) => petCtr.updatePet(req, filter, update, options),
        deletePet: (_, { filter, options }, { req }) => petCtr.deletePet(req, filter, options),
    },
} as I_PetResolver;
