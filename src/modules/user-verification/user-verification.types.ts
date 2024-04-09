import { I_GenericDocument } from 'cyberskill/typescript';

import { E_IdentityType } from '#shared/typescript';

export interface I_UserVerification extends I_GenericDocument {
    identity: string;
    identityType: E_IdentityType;
    userId: string;
    tempPassword: string;
    expiresAt: Date;
    hitCount: number;
    isTempBlocked: boolean;
    tempBlockTime?: Date;
}

export interface I_Input_Create_UserVerification {
    userId: string;
    identity: string;
    identityType: E_IdentityType;
    tempPassword: string;
    expiresAt: Date;
}

export interface I_Input_Update_UserVerification extends I_Input_Create_UserVerification {
    id?: string;
}

export interface I_Response_UserVerification {
    success: boolean;
    message?: string;
}
