import { EmployeeService } from "../service/employeeService.js";

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
            const result = await this.employeeService.get_all_resumes(req.user.id)
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
}