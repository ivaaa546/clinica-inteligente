export declare const env: {
    readonly databaseUrl: string;
    readonly sessionSecret: string;
    readonly port: number;
    readonly corsOrigins: string[];
    readonly nodeEnv: "development" | "test" | "production";
    readonly argon2: {
        readonly timeCost: number;
        readonly memoryCost: number;
        readonly parallelism: number;
    };
    readonly clinicTimezone: string;
};
