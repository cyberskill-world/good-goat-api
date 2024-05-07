import { I_GenericDocument } from 'cyberskill/typescript';

export interface I_User extends I_GenericDocument {
    displayName: string;
    email: string;
    password: string;
    phone?: string;
    googleId: string;
    facebookId?: string;
    score?: number;
    coin?: number;
    diamond?: number;
    settings?: {};
    avatar?: string;
}

export interface I_Input_Create_User {
    displayName: string;
    email: string;
    password: string;
    phone?: string;
    googleId?: string; // Change the type to string
    facebookId?: string;
    score?: number;
    coin?: number;
    diamond?: number;
    settings?: {};
    avatar?: string;
}

export interface I_Input_Update_User extends I_Input_Create_User {
    id: String;
}

export interface I_Input_Delete_User {
    id: String;
}
