import type { PrismaClient } from "@prisma/client";
import { PrismaDB } from "../helper/prismaSingleton.js";
import { JobType } from "../utils/enums.js";

export class JobPostingPublicRepository {

    private prisma: PrismaClient

    constructor() {
        this.prisma = PrismaDB.getInstance();
    }


    async get_all_job_postings(keyword?: string, category?: string, jobType?: string, sortOrder?: string) {
        await this.prisma.jobPost.updateMany({
            where: {
                expired_at: { lte: new Date()},
                status: "Active"
            },
            data: {
                status: "Expired"
            }
        })
        return this.prisma.jobPost.findMany({
            where: {
                available_position: {
                    gt: 0 // only show job postings with available positions
                },
                verified: true,
                status: "Active",
                ...(keyword && {
                    OR: [
                    { description: { contains: keyword, mode: "insensitive" } },
                    {
                        company: {
                        is: {
                            company_name: { contains: keyword, mode: "insensitive" },
                        },
                        },
                    },
                    {
                        company: {
                        is: {
                            location: { contains: keyword, mode: "insensitive" },
                        },
                        },
                    },
                    { position: { contains: keyword, mode: "insensitive" } },
                    {
                        company: {
                            is: {
                                location: { contains: keyword, mode: "insensitive" },
                            },
                        },
                    },
                    { location: { contains: keyword, mode: "insensitive" } },                    
                    ],
                }),
                // jobType = exact match with JobType enum
                ...(category && { position: { contains: category, mode: "insensitive" } }),
                ...(jobType && { jobType: jobType as JobType })
                
            },
            orderBy: {
                updated_at: sortOrder === "asc" ? "asc" : "desc",
            },
            include: {
                company: {
                    select: {
                    id: true,
                    company_name: true,
                    location: true,
                    tel: true,
                    user_id: true
                    }
                }
            }
        });
    }

    async get_all_job_categories() {
        const positions = await this.prisma.jobPost.findMany({
            distinct: ['position'],
            select: { position: true },
        });
        return positions.map(p => p.position);
    }


    async get_job_posting_by_id(id: number) {
        return this.prisma.jobPost.findUnique({
            where: { id },
            include: {
                company: {
                    select: {
                    id: true,
                    company_name: true,
                    location: true,
                    tel: true,
                    user_id: true
                    }
                }
            }
        });
    }

}
