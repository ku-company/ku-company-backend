import { CompanyRepository } from "../repository/companyRepository.js";
// import type {  } from "../model/userModel.js";
import type { CompanyProfileDTO } from "../dtoModel/userDTO.js";
import type { CompanyProfileDB } from "../model/userModel.js";


export class CompanyService {

    private companyRepository: CompanyRepository;

    constructor(){
        this.companyRepository = new CompanyRepository();
    }

    
    async create_profile(input: CompanyProfileDTO){
        // Check if user already has a profile
        const existingProfile = await this.companyRepository.find_profile_by_user_id(input.user_id);
        if (existingProfile) {
            throw new Error("User already has a company profile");
        }
        return this.companyRepository.create_company_profile(input);

    }

    async get_profile(user_id: number): Promise<CompanyProfileDB | null>{
        return this.companyRepository.find_profile_by_user_id(user_id);
    }




}