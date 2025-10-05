import { EmployeeRepository } from "../repository/employeeRepository.js"
import type { EditEmployeeProfile, InputEmployeeProfile } from "../model/employeeModel.js";
import { Result } from "pg";
import { S3Service } from "./s3Services.js";
import { validatePdfBuffer } from "../helper/pdf.js";
import { DocumentKeyStrategy } from "../helper/s3KeyStrategy.js";
import type { IUserRequest } from "../model/userModel.js";
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

        // find if alr have profile
        const profile = await this.employeeRepository.get_profile(user.id);
        if (!profile) throw new Error("Profile not found");

        // Upload resumes to S3
        const files = req.files as Express.Multer.File[];
        if (!files?.length) throw new Error("No resume files uploaded");

        const uploadedKeys: string[] = [];

        for (const file of files) {
            try {
            // Validate each file's bytes
            const { mime } = await validatePdfBuffer(file.buffer);

            const { key } = await this.s3Service.uploadFile(
                {
                buffer: file.buffer,
                mimetype: mime,
                originalname: file.originalname,
                },
                { role: user.role, employeeId: user.id }
            );

            console.log("Uploaded resume path:", key);
            uploadedKeys.push(key);
            await this.employeeRepository.upload_resume(profile.id, key);
            } catch (err) {
            console.error("Failed to upload file:", file.originalname, err);
            throw new Error(`Failed to upload file: ${file.originalname}`);
            }
        }

        return uploadedKeys;
        }

}