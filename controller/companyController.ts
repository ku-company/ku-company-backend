import type { Request, Response } from "express";
import { CompanyService } from "../service/companyService.js";
import type { CompanyProfileDTO } from "../dtoModel/userDTO.js";

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
        console.log("User info: ", user);
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

    async upload_profile_image(req: Request, res: Response){
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });
        const user = req.user as { id: number };
       const imageUrl = await this.companyService.upload_profile_image(user.id, req.file.filename);

        res.json({ message: "Image uploaded successfully", imageUrl });
    }

    
}