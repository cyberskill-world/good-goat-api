import { I_GenericDocument } from 'cyberskill/typescript';

export interface I_Exercise extends I_GenericDocument {
    name: string;
    skill_type: Enumerator;
    topic_id: string;
    question_id: string;
    level: Enumerator;
    score: number;
    coin: number;
    user_id: string;
}

export interface I_Input_Create_Exercise {
    name: string;
    skill_type: Enumerator;
    topic_id: string;
    question_id: string;
    level: Enumerator;
    score: number;
    coin: number;
    user_id: string;
}

export interface I_Input_Update_Exercise {
    id: string;
    name: string;
    skill_type: Enumerator;
    topic_id: string;
    question_id: string;
    level: Enumerator;
    score: number;
    coin: number;
    user_id: string;
}

export interface I_Input_Delete_Exercise {
    id: string;
}
