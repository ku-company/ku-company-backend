import type { PrismaClient } from "@prisma/client";
import { PrismaDB } from "../helper/prismaSingleton.js";
import { JobType } from "../dtoModel/companyDTO.js";

export class JobPostingPublicRepository {

    private prisma: PrismaClient

    constructor() {
        this.prisma = PrismaDB.getInstance();
    }

    private normalizeEnum(val: string): JobType | undefined {
        // normalize input: lowercase, remove spaces, underscores, etc.
        const normalizedInput = val.toLowerCase().replace(/[\s_]/g, "");

        for (const enumVal of Object.values(JobType)) {
            const normalizedEnum = enumVal.toLowerCase().replace(/[\s_]/g, "");
            if (normalizedEnum === normalizedInput) {
            return enumVal as JobType;
            }
        }

        return undefined;
    }

    async get_all_job_postings(keyword?: string, category?: string) {
        const jobTypeEnum = keyword ? this.normalizeEnum(keyword) : undefined;
        return this.prisma.jobPost.findMany({
            where: {
                available_position: {
                    gt: 0 // only show job postings with available positions
                },
                ...(keyword && {
                    OR: [
                    { description: { contains: keyword, mode: "insensitive" } },
                    { company: { company_name: { contains: keyword, mode: "insensitive" } } },
                    { company: { location: { contains: keyword, mode: "insensitive" } } },
                    ...(jobTypeEnum ? [{ jobType: jobTypeEnum }] : [])
                    
                    ],
                }),
                // category = exact match with Position enum
                ...(category && { position: category as any })
                
            },
            orderBy: {
                updated_at: 'desc',
            },
            include: {
                company: {
                    select: {
                    company_name: true,
                    location: true,
                    tel: true,
                    user_id: true
                    }
                }
            }
        });
    }

    async get_job_posting_by_id(id: number) {
        return this.prisma.jobPost.findUnique({
            where: { id },
            include: {
                company: {
                    select: {
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
