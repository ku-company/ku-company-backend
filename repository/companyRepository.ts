import type { PrismaClient } from "@prisma/client";
import { PrismaDB } from "../helper/prismaSingleton.js";
import type { CompanyProfileDB } from "../model/userModel.js";
import type {CompanyProfileDTO} from "../dtoModel/userDTO.js";
import type { CompanyJobPostingDTO } from "../dtoModel/companyDTO.js";

export class CompanyRepository {

    private prisma: PrismaClient
    
    constructor() {
        this.prisma = PrismaDB.getInstance();
    }

    async create_company_profile(input: CompanyProfileDTO): Promise<CompanyProfileDB>{
        const companyProfile = await this.prisma.companyProfile.create({
            data: {
                user_id     : input.user_id,
                company_name : input.company_name,
                description  : input.description,
                industry     : input.industry,
                tel          : input.tel,
                location     : input.location
            }
        });
        await this.update_company_name(input.user_id, input.company_name);
        return companyProfile;
    }
    async find_profile_by_user_id(user_id: number): Promise<CompanyProfileDB | null> {
        return this.prisma.companyProfile.findUnique({
            where: {
                user_id: user_id
            }
        });
    }

    async update_company_name(user_id: number, company_name: string | null): Promise<void> {
        await this.prisma.user.update({
            where: {
                id: user_id
            },
            data: {
                company_name: company_name
            }
        });
    }

    async update_company_profile(user_id: number, input: CompanyProfileDTO): Promise<CompanyProfileDB | null> {
        await this.update_company_name(user_id, input.company_name);
        return this.prisma.companyProfile.update({
            where: {
                user_id: user_id
            },
            data: {
                company_name : input.company_name,
                description  : input.description,
                industry     : input.industry,
                tel          : input.tel,
                location     : input.location
            }
        });
    }

    async create_job_posting(input: CompanyJobPostingDTO & { company_id: number }) {
        return this.prisma.jobPost.create({
            data: {
                description: input.description,
                jobType: input.jobType,
                position: input.position,
                available_position: input.available_position,
                company_id: input.company_id
            }
        });
    }

    async find_today_job_postings(company_id: number, today: Date) {
        return this.prisma.jobPost.findMany({
            where: {
                company_id: company_id, // company profile id
                created_at: {
                    gte: today,
                    lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) // end of today
                }
            }
        });
    }

    async find_job_posting_by_id(id: number) {
        return this.prisma.jobPost.findUnique({
            where: {
                id: id
            }
        });
    }

    async find_all_job_postings_by_company_id(company_id: number) {
        return this.prisma.jobPost.findMany({
            where: {
                company_id: company_id
            },
            orderBy: {
                created_at: 'desc'
            }
        });
    }


    async update_job_posting(id: number, input: CompanyJobPostingDTO) {
        return this.prisma.jobPost.update({
            where: {
                id: id
            },
            data: {
                description: input.description,
                jobType: input.jobType,
                position: input.position,
                available_position: input.available_position
            }
        });
    }

    async delete_job_posting(id: number) {
        return this.prisma.jobPost.delete({
            where: {
                id: id
            }
        });
    }
}
