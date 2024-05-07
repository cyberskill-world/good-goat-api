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
import { exerciseCtr } from './exercise.controller';
import {
    I_Input_Create_Exercise,
    I_Input_Delete_Exercise,
    I_Input_Update_Exercise,
    I_Exercise,
} from './exercise.types';

interface I_ExerciseResolver {
    Query: {
        getExercise: (_, args: I_Input_FindOne<I_Exercise>, context: I_Context) => Promise<I_Return<I_Exercise>>;
        getExercises: (
            _,
            args: I_Input_FindPaging<I_Exercise>,
            context: I_Context,
        ) => Promise<I_Return<T_PaginateResult<I_Exercise>>>;
    };
    Mutation: {
        createExercise: (
            _,
            args: I_Input_CreateOne<I_Input_Create_Exercise>,
            context: I_Context,
        ) => Promise<I_Return<I_Exercise>>;
        updateExercise: (
            _,
            args: I_Input_UpdateOne<I_Input_Update_Exercise>,
            context: I_Context,
        ) => Promise<I_Return<I_Exercise>>;
        deleteExercise: (
            _,
            args: I_Input_DeleteOne<I_Input_Delete_Exercise>,
            context: I_Context,
        ) => Promise<I_Return<I_Exercise>>;
    };
}

export default {
    Query: {
        getExercise: (_, { filter, projection, options, populate }, { req }) =>
            exerciseCtr.getExercise(req, filter, projection, options, populate),
        getExercises: (_, { filter, options }, { req }) => exerciseCtr.getExercises(req, filter, options),
    },
    Mutation: {
        createExercise: (_, { doc }, { req }) => exerciseCtr.createExercise(req, doc),
        updateExercise: (_, { filter, update, options }, { req }) =>
            exerciseCtr.updateExercise(req, filter, update, options),
        deleteExercise: (_, { filter, options }, { req }) => exerciseCtr.deleteExercise(req, filter, options),
    },
} as I_ExerciseResolver;
