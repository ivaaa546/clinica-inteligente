export declare const hashPassword: (password: string) => Promise<string>;
export declare const verifyPassword: (hash: string, password: string) => Promise<boolean>;
