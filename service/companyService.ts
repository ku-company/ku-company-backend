import { CompanyRepository } from "../repository/companyRepository.js";
import { UserRepository } from "../repository/userRepository.js";
import type { CompanyProfileDTO } from "../dtoModel/userDTO.js";
import type { CompanyProfileDB } from "../model/userModel.js";
import { JobType, type CompanyJobPostingDTO, Position } from "../dtoModel/companyDTO.js";


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

    async upload_profile_image(user_id: number, filename: string): Promise<string> {
        const BASE_URL = "http://localhost:8000";
        // create URL for frontend
        const imageUrl =`${BASE_URL}/Images/${filename}`;
        await this.companyRepository.upload_profile_image(user_id, { profile_image: imageUrl });
        return imageUrl;
    }

    async get_profile_image(user_id: number): Promise<string | null> {
        return await this.companyRepository.find_profile_image_by_user_id(user_id);
    }

    async create_job_posting(user_id: number, input: CompanyJobPostingDTO) {
        const companyProfile = await this.companyRepository.find_profile_by_user_id(user_id);
        if (!companyProfile) {
            throw new Error("Company profile not found");
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0); // start of today

        // Count job postings created today by this company
        const postingsToday = await this.companyRepository.find_today_job_postings(companyProfile.id, today);

        const user = await this.userRepository.get_user_by_id(companyProfile.user_id);
        if (user?.verified === false && postingsToday.length >= 5) {
            throw new Error("Maximum job postings for today reached");
        }

        const repoInput = {
            company_id: companyProfile.id,
            description: input.description,
            jobType: input.jobType,
            position: input.position,
            available_position: input.available_position
        };

        return this.companyRepository.create_job_posting(repoInput);
    }

    async update_job_posting(post_id: number, input: CompanyJobPostingDTO) {
        const existingPost = await this.companyRepository.find_job_posting_by_id(post_id);
        if (!existingPost) {
            throw new Error("Job posting not found");
        }
        input.description = input.description ? input.description : existingPost.description;
        input.jobType = input.jobType ? input.jobType : JobType[existingPost.jobType as keyof typeof JobType];
        input.position = input.position ? input.position : Position[existingPost.position as keyof typeof Position];

        input.available_position = input.available_position ? input.available_position : existingPost.available_position;
        return this.companyRepository.update_job_posting(post_id, input);
    }
}