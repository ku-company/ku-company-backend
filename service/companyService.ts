import { CompanyRepository } from "../repository/companyRepository.js";
import { UserRepository } from "../repository/userRepository.js";
import type { CompanyProfileDTO } from "../dtoModel/userDTO.js";
import type { CompanyProfileDB } from "../model/userModel.js";
import { JobType, type CompanyJobPostingDTO, Position } from "../dtoModel/companyDTO.js";
import { application } from "express";
import { S3Service } from "./s3Services.js";
import { DocumentKeyStrategy } from "../helper/s3KeyStrategy.js";



export class CompanyService {

    private companyRepository: CompanyRepository;
    private userRepository: UserRepository;
    private s3Service: S3Service;
    private RESUME_BUCKET_NAME = process.env.RESUME_BUCKET_NAME || "";

    constructor(){
        this.companyRepository = new CompanyRepository();
        this.userRepository = new UserRepository();
        this.s3Service = new S3Service(this.RESUME_BUCKET_NAME, new DocumentKeyStrategy());
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

    async get_job_posting(post_id: number) {
        return this.companyRepository.find_job_posting_by_id(post_id);
    }

    async get_all_job_postings(user_id: number) {
        const companyProfile = await this.companyRepository.find_profile_by_user_id(user_id);
        if (!companyProfile) {
            throw new Error("Company profile not found");
        }
        const company_id = companyProfile.id;
        return this.companyRepository.find_all_job_postings_by_company_id(company_id);
    }

    async delete_job_posting(post_id: number) {
        const existingPost = await this.companyRepository.find_job_posting_by_id(post_id);
        if (!existingPost) {
            throw new Error("Job posting not found");
        }
        return this.companyRepository.delete_job_posting(post_id);
    }

    async get_all_job_applications(user_id: number) {
        const companyProfile = await this.companyRepository.find_profile_by_user_id(user_id);
        if (!companyProfile) {
            throw new Error("Company profile not found");
        }
        // need
        // job_application id,job_id,name(firstname + lastname), email, position, status, applied_at, resume (link)
                
        const applications = await this.companyRepository.find_all_job_applications_by_company_id(companyProfile.id);

        // Attach signed S3 URLs to each resume record
        const ApplicationSigned = await Promise.all(
            applications.map(async (app) => ({
            ...app,
            resume_url: await this.s3Service.getFileUrl(app.resume_url as string),

            }))
        );
        return ApplicationSigned;
    }
}