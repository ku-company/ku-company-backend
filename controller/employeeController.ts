import { EmployeeService } from "../service/employeeService.js";
import type { Request, Response } from "express";

export class EmployeeController{

    private employeeService: EmployeeService

    constructor(){
        this.employeeService = new EmployeeService();
    }

    async get_employee_profile(req: any, res: any){
        try{
            const result = await this.employeeService.get_profile(req);
            res.status(200).json({
                message: "Profile retrieved successfully",
                data: result
            })
        }catch(error: any){
            res.status(400).json({
                message: error.message
            })
        }
    }

    async create_profile(req: any, res: any){
        try{
            const result = await this.employeeService.create_profile(req);
            res.status(201).json({
                message: "Profile created successfully",
                data: result
            })
        }catch(error:any){
            res.status(400).json({
                message: error.message
            })
        }
    }

    async delete_profile(req: any, res: any){
        try{
            const result = await this.employeeService.delete_profile(req);
            res.status(200).json({
                message: "Profile deleted successfully",
                data: result
            })
        }catch(error:any){
            res.status(400).json({
                message: error.message
            })
        }
    }
    
    async edit_profile(req: any, res: any){
        try{
            const result = await this.employeeService.edit_profile(req, req.body);
            res.status(200).json({
                message: "Profile edited successfully",
                data: result
            })
        }catch(error:any){
            res.status(400).json({
                message: error.message
            })
        }
    }

    async upload_resumes(req: Request, res: Response){
        if (!req.files || !(req.files as Express.Multer.File[]).length) {
        return res.status(400).json({ message: "No file uploaded" });
        }
        try {
            const user = req.user as { id: number, role: string };
            const imageUrl = await this.employeeService.upload_resumes(req, user);
            res.json({ message: "Resume uploaded successfully", imageUrl });
        } catch (error: unknown) {
            console.error((error as Error).message);
            res.status(500).json({ message: (error as Error).message });
        }
    }

    async get_resumes(req: Request, res: Response){
        try{
            const user = req.user as { id: number };
            const resumes = await this.employeeService.get_all_resumes(user.id);
            res.json({ resumes: resumes });
        }catch(error: unknown){
            console.error((error as Error).message);
            res.status(500).json({ message: (error as Error).message });
        }
    }

    async get_resume(req: Request, res: Response){
        try{
            const user = req.user as { id: number };
            const resume = await this.employeeService.get_resume(Number(req.params.id), user.id);
            res.json({ resume: resume });
        }catch(error: unknown){
            console.error((error as Error).message);
            res.status(500).json({ message: (error as Error).message });
        }
    } 
    
    async delete_resume(req: Request, res: Response){
        try{
            const user = req.user as { id: number };
            await this.employeeService.delete_resume(Number(req.params.id), user.id);
            res.json({ message: "Resume deleted successfully"});
        }catch(error: unknown){
            console.error((error as Error).message);
            res.status(500).json({ message: (error as Error).message });
        }
    
    }

    async delete_all_resumes(req: Request, res: Response){
        try{
            const user = req.user as { id: number };
            await this.employeeService.delete_all_resumes(user.id);
            res.json({ message: "All resumes deleted successfully"});
        }catch(error: unknown){
            console.error((error as Error).message);
            res.status(500).json({ message: (error as Error).message });
        }
    }

    async set_main_resume(req: Request, res: Response){
        try{
            const user = req.user as { id: number };
            await this.employeeService.set_main_resume(Number(req.params.id), user.id);
            res.json({ message: "Resume set as main successfully"});
        }catch(error: unknown){
            console.error((error as Error).message);
            res.status(500).json({ message: (error as Error).message });
        }
    }

    async get_main_resume(req: Request, res: Response){
        try{
            const user = req.user as { id: number };
            const resume = await this.employeeService.get_main_resume(user.id);
            res.json({ resume: resume });
        }catch(error: unknown){
            console.error((error as Error).message);
            res.status(500).json({ message: (error as Error).message });
        }
    }

    async apply_to_individual_job(req: any, res: any){
        try{
            const result = await this.employeeService.apply_to_individual_job(req.params.id, req.user.id, req.body.resume_id);
            res.status(200).json({
                message: "Applied to job successfully",
                data: result
            })
        }catch(error: any){
            res.status(400).json({
                message: error.message
            })
        }
    }

    async get_all_resumes(req: any, res: any){
        try{
            const result = await this.employeeService.list_all_resumes(req.user.id)
            res.status(200).json({
                message: "Resumes retrieved successfully",
                data: result
            })
        }catch(error: any){
            res.status(400).json({
                message: error.message
            })
        }
    }

    async cancel_application(req: any, res: any){
        try{
            const result = await this.employeeService.cancel_application(req.user.id, req.params.id)
            res.status(200).json({
                message: "Application cancelled successfully",
                data: result
            })
        }
        catch(error: any){
            res.status(400).json({
                message: error.message
            })
        }
    }

    async list_all_applications(req: any, res: any){
        try {
            const result = await this.employeeService.list_all_applications(req.user.id);
            res.status(200).json({
                message: "Applications retrieved successfully",
                data: result
            })
        }
        catch (error: any){
            res.status(400).json({
                message: error.message
            })
        }
    }

    async checkout_list_apply_job(req: any, res: any){
        try {
            const result = await this.employeeService.checkout_list_apply_jobs(req.user.id, req.body.resume_id, req.body.job_id);
            res.status(200).json({
                message: "Job applied successfully",
                data: result
            })
        }catch(error: any){
            res.status(400).json({
                message: error.message
            })
        }
    }
    
    async sent_the_confirmation_to_company(req: any, res: any){
        try {
            const result = await this.employeeService.sent_the_confirmation_to_company(req.user.id, req.params.id);
            res.status(200).json({
                message: "Confirmation sent successfully",
                data: result
            })
        }catch(error: any){
            res.status(400).json({
                message: error.message
            })
        }
    }
}