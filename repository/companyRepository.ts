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

    async upload_profile_image(user_id: number, data: { profile_image: string }): Promise<void> {
        await this.prisma.user.update({
            where: {
                id: user_id
            },
            data: {
                profile_image: data.profile_image
            }
        });
    }


}