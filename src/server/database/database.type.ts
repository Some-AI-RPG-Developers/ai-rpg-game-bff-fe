import { match, P } from 'ts-pattern';

export enum DatabaseType {
    MONGODB
}

export function getDatabaseType(dbType: string): DatabaseType {
    return match(dbType)
        .with(
            P.when(type => type.toLowerCase() === 'mongodb'),
            ():DatabaseType => DatabaseType.MONGODB)
        .otherwise(() => {
            throw new Error(`Unsupported database type: ${dbType}`);
        });
}