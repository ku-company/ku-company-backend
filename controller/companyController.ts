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
        };
        const result = await this.companyService.create_profile(input);
        console.log("User info: ", user);
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
}