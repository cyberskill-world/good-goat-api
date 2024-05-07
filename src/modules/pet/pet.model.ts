import { generateModel, validate } from 'cyberskill/utils';
import mongoose from 'mongoose';

import config from '#config';
import { I_Pet } from './pet.types';
import { json } from 'body-parser';
import { JSON } from 'graphql-scalars/typings/mocks';

export const PetModel = generateModel<I_Pet>({
    mongoose,
    name: config.DATABASE_COLLECTIONS.PETS,
    pagination: true,
    schema: {
        name: {
            type: String,
        },
        skills: {
            type: String,
        },
        model_pet: {
            type: Object,
        },
    },
});
