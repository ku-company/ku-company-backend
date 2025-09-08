import { CompanyRepository } from "../repository/companyRepository.js";
import { UserRepository } from "../repository/userRepository.js";
import type { CompanyProfileDTO } from "../dtoModel/userDTO.js";
import type { CompanyProfileDB } from "../model/userModel.js";


export class CompanyService {

    private companyRepository: CompanyRepository;
    private userRepository: UserRepository;

    constructor(){
        this.companyRepository = new CompanyRepository();
        this.userRepository = new UserRepository();
    }

    
    async create_profile(input: CompanyProfileDTO){
        // Check if user already has a profile
        const existingProfile = await this.companyRepository.find_profile_by_user_id(input.user_id);
        if (existingProfile) {
            throw new Error("User already has a company profile");
        }
        const user = await this.userRepository.get_user_by_id(input.user_id);
        if (!input.company_name) {
            // use default company name from user table
            if (user && user.company_name) {
                input.company_name = user.company_name;
            } else {
                throw new Error("Company name is required");
            }
        }
        return this.companyRepository.create_company_profile(input);

    }

    async get_profile(user_id: number): Promise<CompanyProfileDB | null>{
        return this.companyRepository.find_profile_by_user_id(user_id);
    }

    async update_profile(input: CompanyProfileDTO): Promise<CompanyProfileDB | null> {
        const existingProfile = await this.companyRepository.find_profile_by_user_id(input.user_id);
        if (!existingProfile) {
            throw new Error("Company profile not found");
        }
        input.company_name = input.company_name ? input.company_name : existingProfile.company_name;
        input.description = input.description ? input.description : existingProfile.description;
        input.industry = input.industry ? input.industry : existingProfile.industry;
        input.tel = input.tel ? input.tel : existingProfile.tel;
        input.location = input.location ? input.location : existingProfile.location;
        return this.companyRepository.update_company_profile(input.user_id, input);
    }

}