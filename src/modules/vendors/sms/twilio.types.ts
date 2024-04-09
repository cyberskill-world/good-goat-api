export type T_SmsOptions = {
    to: string;
    body: string;
    from?: string;
};

export type T_SendAutoSMS = (options: T_SmsOptions) => Promise<boolean>;
