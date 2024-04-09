import { Request as RequestExpress } from 'express';
import { Session } from 'express-session';

import { I_User } from '../../modules/user/user.types';

export interface I_Request extends RequestExpress {
    session: Session & {
        user: I_User | null;
    };
    SECRET: string;
}

export interface I_Context {
    req: I_Request;
    SECRET: string;
}
