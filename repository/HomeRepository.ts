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
            where: {
                user:{ verified: true }
            },
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

    async get_top_job_postings() {
        return await this.prisma.jobPost.findMany({
            take: 3,
            where: {
                status: "Active",
                verified: true,
                available_position: { gt: 0 }
            },
            orderBy: {
                created_at: 'desc'
            },
            include: {
                company: true
            }
        });
    }

}
