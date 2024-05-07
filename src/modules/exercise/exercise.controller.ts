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
import { ExerciseModel } from './exercise.model';
import {
    I_Input_Create_Exercise,
    I_Input_Delete_Exercise,
    I_Input_Update_Exercise,
    I_Exercise,
} from './exercise.types';

const mongooseCtr = new MongooseController<I_Exercise>(ExerciseModel);

interface I_ExerciseCtr {
    getExercise: (req: I_Request, ...args: T_Input_FindOne<I_Exercise>) => Promise<I_Return<I_Exercise>>;
    getExercises: (
        req: I_Request,
        ...args: T_Input_FindPaging<I_Exercise>
    ) => Promise<I_Return<T_PaginateResult<I_Exercise>>>;
    createExercise: (
        req: I_Request,
        ...args: T_Input_CreateOne<I_Input_Create_Exercise>
    ) => Promise<I_Return<I_Exercise>>;
    updateExercise: (
        req: I_Request,
        ...args: T_Input_UpdateOne<I_Input_Update_Exercise>
    ) => Promise<I_Return<I_Exercise>>;
    deleteExercise: (
        req: I_Request,
        ...args: T_Input_DeleteOne<I_Input_Delete_Exercise>
    ) => Promise<I_Return<I_Exercise>>;
}

export const exerciseCtr: I_ExerciseCtr = {
    getExercise: async (_, filter, projection, options, populate) => {
        return mongooseCtr.findOne(filter, projection, options, populate);
    },
    getExercises: async (_, filter, options) => {
        return mongooseCtr.findPaging(filter, options);
    },

    createExercise: async (req, doc) => {
        const { ...rest } = doc;
        const userCreated = await mongooseCtr.createOne({
            ...rest,
        });

        return userCreated;
    },
    updateExercise: async (req, filter, update, options) => {
        const exerciseFound = await exerciseCtr.getExercise(req, filter);

        const userUpdated = await mongooseCtr.updateOne(filter, update, options);

        return userUpdated;
    },
    deleteExercise: async (req, filter, options) => {
        return mongooseCtr.deleteOne(filter, options);
    },
};
