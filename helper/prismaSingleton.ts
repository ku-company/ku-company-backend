import { PrismaClient } from "@prisma/client";

export class PrismaDB {
    private static instance: PrismaClient;

    private constructor() {}

    public static getInstance(): PrismaClient {
        if (!PrismaDB.instance){
            PrismaDB.instance = new PrismaClient()
        }
        return PrismaDB.instance;
    }
}