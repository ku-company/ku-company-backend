import { AdminService } from "../service/adminService.js";

export class AdminController{
    private admminService: AdminService

    constructor(){
        this.admminService = new AdminService();
    }

    async verify_user(req: any, res: any){
        try {
            const result = await this.admminService.verify_user(req.body.user_id);
            res.status(200).json({
                message: "User verified successfully",
                data: result
            })
        } catch (error: any){
            res.status(400).json({
                message: error.message
            })
        }
    }

    async reject_user(req: any, res: any){
        try{
            const result = await this.admminService.reject_user(req.body.user_id)
            res.status(200).json({
                message: "User rejected successfully",
                data: result
            })
        }catch(error: any){
            res.status(400).json({
                message: error.message
            })
        }
        
    }
}