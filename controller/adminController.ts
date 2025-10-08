import { AdminService } from "../service/adminService.js";

export class AdminController{
    private admminService: AdminService

    constructor(){
        this.admminService = new AdminService();
    }

    async verify_user(req: any, res: any){
        try {
            const result = await this.admminService.verify_user(req.params.id);
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
            const result = await this.admminService.reject_user(req.params.id)
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
    async delete_user(req: any, res: any) {
        try{
            const result = await this.admminService.delete_user(req.params.id)
                res.status(200).json({
                    message: "User deleted successfully",
                    data: result
                })
            }
            catch(error:any){
                res.status(400).json({
                    message: error.message
                })
            }
        }
    async edit_user(req: any, res: any){
        try{
            const result = await this.admminService.edit_user(req.params.id, req.body)
            res.status(200).json({
                message: "User edited successfully",
                data: result
            })
        }catch(error: any){
            res.status(400).json({
                message: error.message
            })
        }
    }

    async add_user(req: any, res: any){
        try{
            const result = await this.admminService.add_user(req.body)
            res.status(200).json({
                message: "User added successfully",
                data: result
            })
        }catch(error: any){
            res.status(400).json({
                message: error.message
            })
        }
    }

    async list_all_user(req: any, res: any){
        try{
            const result = await this.admminService.list_user()
            res.status(200).json({
                message: "User listed successfully",
                data: result
            })
        }
        catch(error: any){
            res.status(400).json({
                message: error.message
            })
        }
    }

    async filtering_user_by_status(req: any, res: any){
        try{
            const filtering_user = await this.admminService.list_filtering_user(req.query.status)
            res.status(200).json({
                message: "User filtered successfully",
                data: filtering_user
            })
        }catch(error: any){
            res.status(400).json({
                message: error.message
            })
        }
    }
}
