import { EmployeeRepository } from "../repository/employeeRepository.js"
import type { EditEmployeeProfile, InputEmployeeProfile } from "../model/employeeModel.js";
import { Result } from "pg";
import { S3Service } from "./s3Services.js";
import { validatePdfBuffer } from "../helper/pdf.js";
import { DocumentKeyStrategy } from "../helper/s3KeyStrategy.js";
import type { IUserRequest } from "../model/userModel.js";
import type { Resume } from "@prisma/client";

export class EmployeeService{

    private employeeRepository: EmployeeRepository
    private s3Service: S3Service;
    private RESUME_BUCKET_NAME = process.env.RESUME_BUCKET_NAME || "";

    constructor(){
        this.employeeRepository = new EmployeeRepository();
        this.s3Service = new S3Service(this.RESUME_BUCKET_NAME, new DocumentKeyStrategy());
    }

    is_valid_profile(req_id: number, params_id: number, req: any){
        if(req_id !== params_id && req.user.role !== "Admin"){
            throw new Error("Unauthorized access to profile");
        }
        return true;
    }

    async create_profile(req: any){
        const user = await this.employeeRepository.get_profile(req.user.id)
        if(user){
            throw new Error("Profile already exists");
        }
        return await this.employeeRepository.create_profile(req) 
      }

    async get_profile(req: any){
        const req_id = Number(req.params.id)
        const is_valid = this.is_valid_profile(req_id, req.user.id, req);
        if(is_valid){
            const result = await this.employeeRepository.get_profile(req.user.id)
            if(!result){
                throw new Error("Profile not found")
            }
            return result
        }
    }

    async delete_profile(req: any){
        const req_id = Number(req.params.id)
        const is_valid = this.is_valid_profile(req_id, req.user.id, req);
        if(is_valid){
            return await this.employeeRepository.delete_profile(req.user.id)
        }
    }

    async edit_profile(req: any, input: EditEmployeeProfile){
        const req_id = Number(req.params.id)
        const is_valid = this.is_valid_profile(req_id, req.user.id, req);
        if(is_valid){
            return await this.employeeRepository.edit_profile(req.user.id, input)
        }
    }

    async upload_resumes(req: any, user: IUserRequest) {
        const req_id = req.user.id;
        const is_valid = this.is_valid_profile(req_id, req.user.id, req);
        if (!is_valid) throw new Error("Invalid profile access");

        const profile = await this.employeeRepository.get_profile(user.id);
        if (!profile) throw new Error("Profile not found");

        const files = req.files as Express.Multer.File[];
        if (!files?.length) throw new Error("No resume files uploaded");

        const existingResumeCount = await this.employeeRepository.resume_count(profile.id);
        const resumeLimit = 3;
        if (existingResumeCount + files.length > resumeLimit) {
            const remaining = resumeLimit - existingResumeCount;
            throw new Error(
                remaining > 0
                ? `You already have ${existingResumeCount} resumes. You can upload only ${remaining} more.`
                : `You already have the maximum of ${resumeLimit} resumes. Please delete one before uploading.`
            );
        }
        // Run all uploads in parallel
        const uploadedResults = await Promise.all(
            files.map(async (file) => {
            try {
                // Validate
                const { mime } = await validatePdfBuffer(file.buffer);

                // Upload to S3
                const { key } = await this.s3Service.uploadFile(
                {
                    buffer: file.buffer,
                    mimetype: mime,
                    originalname: file.originalname,
                },
                { role: user.role, employeeId: user.id }
                );

                // Save to DB
                await this.employeeRepository.upload_resume(profile.id, key);

                return key;
            } catch (err) {
                console.error("Failed to upload file:", file.originalname, err);
                throw new Error(`Failed to upload file: ${file.originalname}`);
            }
            })
        );

        return uploadedResults;
    }

    async get_resumes(user_id: number){
        const profile = await this.employeeRepository.get_profile(user_id);
        if (!profile) throw new Error("Profile not found");

        const resumes = await this.employeeRepository.get_resumes(profile.id);
        if (!resumes.length) return [];

        const resumeCount = await this.employeeRepository.resume_count(profile.id);
            console.log(`Total resumes found: ${resumeCount}`);
        // Attach signed S3 URLs to each resume record
        const signedResumes = await Promise.all(
            resumes.map(async (r: Resume) => ({
            ...r,
            file_url: await this.s3Service.getFileUrl(r.file_url),

            }))
        );

        return signedResumes;
    }

    async get_resume(resume_id: number, user_id: number){
        const profile = await this.employeeRepository.get_profile(user_id);
        if (!profile) throw new Error("Profile not found");

        const resume = await this.employeeRepository.get_resume_by_id(resume_id, profile.id);
        if (!resume) throw new Error("Resume not found");
        resume.file_url = await this.s3Service.getFileUrl(resume.file_url);
        return resume;
    }



}