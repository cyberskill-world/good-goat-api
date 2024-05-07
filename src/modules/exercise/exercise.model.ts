import { generateModel, validate } from 'cyberskill/utils';
import mongoose from 'mongoose';

import config from '#config';
import { I_Exercise } from './exercise.types';
import { json } from 'body-parser';
import { JSON } from 'graphql-scalars/typings/mocks';
enum SkillType {
    Reading = 'Reading',
    Listening = 'Listening',
    Writing = 'Writing',
    Speaking = 'Speaking',
}

enum Level {
    Easy = 'Easy',
    Medium = 'Medium',
    Hard = 'Hard',
}

// Rest of your code...
export const ExerciseModel = generateModel<I_Exercise>({
    mongoose,
    name: config.DATABASE_COLLECTIONS.EXERCISES,
    pagination: true,
    schema: {
        name: {
            type: String,
        },
        skill_type: {
            type: String,
            enum: SkillType,
        },
        topic_id: {
            type: String,
        },
        question_id: {
            type: String,
        },
        level: {
            type: String,
            enum: Level,
        },
        score: {
            type: Number,
        },
        coin: {
            type: Number,
        },
        user_id: {
            type: String,
        },
    },
});
