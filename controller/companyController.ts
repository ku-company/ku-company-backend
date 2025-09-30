import type { Request, Response } from "express";
import { CompanyService } from "../service/companyService.js";
import type { CompanyProfileDTO } from "../dtoModel/userDTO.js";
import type { CompanyJobPostingDTO } from "../dtoModel/companyDTO.js";

export class CompanyController {
    private companyService: CompanyService;

    constructor(){
        this.companyService = new CompanyService()
    }

    async create_profile(req: Request, res: Response){
        try{
        const user = req.user as { id: number, email: string, role: string };
        const input: CompanyProfileDTO = {
            user_id: user.id,
            company_name: req.body.company_name,
            description: req.body.description,
            industry: req.body.industry,
            tel: req.body.tel,
            location: req.body.location
        };
        
        const result = await this.companyService.create_profile(input);
        if (!result) {
            return res.status(400).json({
                message: "Failed to create company profile"
            });
        }
        res.status(201).json({
            message: "Company Profile created successfully",
            data: result
        });
        } catch (error: any){
            return res.status(400).json({
                message: error.message
            });
        }
        
    }
    async get_profile(req: Request, res: Response){
        try{
            const user = req.user as { id: number };
            const result = await this.companyService.get_profile(user.id);
            if (!result) {
                return res.status(404).json({
                    message: "Company Profile not found"
                });
            }
            res.status(200).json({
                message: "Company Profile retrieved successfully",
                data: result
            });
        } catch (error: any){
            return res.status(400).json({
                message: error.message
            });
        }
    }

    async update_profile(req: Request, res: Response){
        try{
            const user = req.user as { id: number };
            const input: CompanyProfileDTO = {
                user_id: user.id,
                company_name: req.body.company_name,
                description: req.body.description,
                industry: req.body.industry,
                tel: req.body.tel,
                location: req.body.location
            };
            const result = await this.companyService.update_profile(input);
            if (!result) {
                return res.status(404).json({
                    message: "Company Profile not found"
                });
            }
            res.status(200).json({
                message: "Company Profile updated successfully",
                data: result
            });
        } catch (error: any){
            return res.status(400).json({
                message: error.message
            });
        }

    }

    async create_job_posting(req: Request, res: Response){
        try{
            const user = req.user as { id: number };
            const input: CompanyJobPostingDTO = {
                description: req.body.description,
                jobType: req.body.jobType,
                position: req.body.position,
                available_position: req.body.available_position
            };
            const result = await this.companyService.create_job_posting(user.id, input);
            if (!result) {
                return res.status(400).json({
                    message: "Failed to create job posting"
                });
            }
            res.status(201).json({
                message: "Job posting created successfully",
                data: result
            });
        } catch (error: any){
            return res.status(400).json({
                message: error.message
            });
        }
    }
    
    async update_job_posting(req: Request, res: Response){
        if (!req.params.id) {
        return res.status(400).json({ message: "Job posting ID is required" });
    }
        try{
            const job_posting_id = parseInt(req.params.id);
            const input: CompanyJobPostingDTO = {
                description: req.body.description,
                jobType: req.body.jobType,
                position: req.body.position,
                available_position: req.body.available_position
            };
            const result = await this.companyService.update_job_posting(job_posting_id, input);
            if (!result) {
                return res.status(404).json({
                    message: "Job posting not found"
                });
            }
            res.status(200).json({
                message: "Job posting updated successfully",
                data: result
            });
        } catch (error: any){
            return res.status(400).json({
                message: error.message
            });
        }
    }

    async get_job_posting(req: Request, res: Response){
        if (!req.params.id) {
            return res.status(400).json({ message: "Job posting ID is required" });
        }
        try{
            const job_posting_id = parseInt(req.params.id);
            const result = await this.companyService.get_job_posting(job_posting_id);
            if (!result) {
                return res.status(404).json({
                    message: "Job posting not found"
                });
            }
            res.status(200).json({
                message: "Job posting retrieved successfully",
                data: result
            });
        } catch (error: any){
            return res.status(400).json({
                message: error.message
            });
        }
    }
    
    async get_all_job_postings(req: Request, res: Response){
        try{
            const user = req.user as { id: number };
            const result = await this.companyService.get_all_job_postings(user.id);
            if (!result) {
                return res.status(404).json({
                    message: "No job postings found"
                });
            }
            res.status(200).json({
                message: "Job postings retrieved successfully",
                data: result
            });
        } catch (error: any){
            return res.status(400).json({
                message: error.message
            });
        }
    }

    async delete_job_posting(req: Request, res: Response){
        if (!req.params.id) {
            return res.status(400).json({ message: "Job posting ID is required" });
        }
        try{
            const job_posting_id = parseInt(req.params.id);
            const result = await this.companyService.delete_job_posting(job_posting_id);
            if (!result) {
                return res.status(404).json({
                    message: "Job posting not found"
                });
            }
            res.status(200).json({
                message: "Job posting deleted successfully"
            });
        } catch (error: any){
            return res.status(400).json({
                message: error.message
            });
        }
    }



}