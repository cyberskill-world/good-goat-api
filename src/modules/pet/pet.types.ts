import { I_GenericDocument } from 'cyberskill/typescript';

export interface I_Pet extends I_GenericDocument {
    name: string;
    skills: string;
    model_pet: any;
}

export interface I_Input_Create_Pet {
    name: string;
    skills: string;
    model_pet: any;
}

export interface I_Input_Update_Pet extends I_Input_Create_Pet {
    id: string;
}

export interface I_Input_Delete_Pet {
    id: string;
}
