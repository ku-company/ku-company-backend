import type { PrismaClient } from "@prisma/client";
import { PrismaDB } from "../helper/prismaSingleton.js";


export class HomeRepository {

    private prisma: PrismaClient

    constructor() {
        this.prisma = PrismaDB.getInstance();
    }

    async get_top_companies() {
        return await this.prisma.companyProfile.findMany({
            take: 10,
            orderBy: {
            jobPosts: {
                _count: 'desc'
            }
            },
            include: {
            _count: {
                select: {
                jobPosts: true
                }
            }
            }
        });
    }

}
