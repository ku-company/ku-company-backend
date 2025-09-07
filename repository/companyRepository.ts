import type { PrismaClient } from "@prisma/client";
import { PrismaDB } from "../helper/prismaSingleton.js";
import type { CompanyProfileDB } from "../model/userModel.js";
import type {CompanyProfileDTO} from "../dtoModel/userDTO.js";

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
            }
        });

        return companyProfile;
    }
    async find_profile_by_user_id(user_id: number): Promise<CompanyProfileDB | null> {
        return this.prisma.companyProfile.findUnique({
            where: {
                user_id: user_id
            }
        });
    }

    async update_company_profile(user_id: number, input: CompanyProfileDTO): Promise<CompanyProfileDB | null> {
        return this.prisma.companyProfile.update({
            where: {
                user_id: user_id
            },
            data: {
                company_name : input.company_name,
                description  : input.description,
                industry     : input.industry,
            }
        });
    }

}