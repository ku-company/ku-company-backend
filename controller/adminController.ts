import { AdminService } from "../service/adminService.js";
import { logDataChange, logUserStatusChange } from "../utils/logger.js";

export class AdminController{
    private admminService: AdminService

    constructor(){
        this.admminService = new AdminService();
    }

    async verify_user(req: any, res: any){
        try {
            const targetId = Number(req.params.id);
            const before = await this.admminService.find_user_by_id(targetId);
            const result = await this.admminService.verify_user(targetId);
            // Audit logs
            logUserStatusChange({
                adminId: req?.user?.id,
                targetUserId: targetId,
                newStatus: String(result?.status),
                correlationId: req?.correlationId || "no-corr",
                ...(before?.status ? { previousStatus: String(before.status) } : {}),
                ...(typeof before?.verified === 'boolean' ? { previousVerified: before.verified } : {}),
                ...(typeof result?.verified === 'boolean' ? { newVerified: result.verified } : {}),
            });
            logDataChange({
                userId: req?.user?.id,
                entity: "user",
                entityId: targetId,
                operation: "update",
                changedFields: ["verified", "status"],
                ip: req.ip,
                correlationId: req?.correlationId || "no-corr",
            });
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
    async edit_user_status(req: any, res: any){
        try{
            const targetId = Number(req.params.id);
            const before = await this.admminService.find_user_by_id(targetId);
            const result = await this.admminService.edit_user_status(targetId, req.body.status)
            // Audit logs
            logUserStatusChange({
                adminId: req?.user?.id,
                targetUserId: targetId,
                newStatus: String(result?.status),
                correlationId: req?.correlationId || "no-corr",
                ...(before?.status ? { previousStatus: String(before.status) } : {}),
                ...(typeof before?.verified === 'boolean' ? { previousVerified: before.verified } : {}),
                ...(typeof result?.verified === 'boolean' ? { newVerified: result.verified } : {}),
            });
            logDataChange({
                userId: req?.user?.id,
                entity: "user",
                entityId: targetId,
                operation: "update",
                changedFields: ["status", "verified"],
                ip: req.ip,
                correlationId: req?.correlationId || "no-corr",
            });
            res.status(200).json({
                message: "User status edited successfully",
                data: result
            })
        }catch(error: any){
            res.status(400).json({
                message: error.message
            })
        }
    }

    async edit_user_verified(req: any, res: any){
        try{
            const targetId = Number(req.params.id);
            const before = await this.admminService.find_user_by_id(targetId);
            const result = await this.admminService.edit_user_verified(targetId, req.body.verified)
            // Audit logs
            logUserStatusChange({
                adminId: req?.user?.id,
                targetUserId: targetId,
                newStatus: String(result?.status),
                correlationId: req?.correlationId || "no-corr",
                ...(before?.status ? { previousStatus: String(before.status) } : {}),
                ...(typeof before?.verified === 'boolean' ? { previousVerified: before.verified } : {}),
                ...(typeof result?.verified === 'boolean' ? { newVerified: result.verified } : {}),
            });
            logDataChange({
                userId: req?.user?.id,
                entity: "user",
                entityId: targetId,
                operation: "update",
                changedFields: ["verified"],
                ip: req.ip,
                correlationId: req?.correlationId || "no-corr",
            });
            res.status(200).json({
                message: "User verified edited successfully",
                data: result
            })
        }catch(error: any){
            res.status(400).json({
                message: error.message
            })
        }
    }

    async reject_user(req: any, res: any){
        try{
            const targetId = Number(req.params.id);
            const before = await this.admminService.find_user_by_id(targetId);
            const result = await this.admminService.reject_user(targetId)
            // Audit logs
            logUserStatusChange({
                adminId: req?.user?.id,
                targetUserId: targetId,
                newStatus: String(result?.status),
                correlationId: req?.correlationId || "no-corr",
                ...(before?.status ? { previousStatus: String(before.status) } : {}),
                ...(typeof before?.verified === 'boolean' ? { previousVerified: before.verified } : {}),
                ...(typeof result?.verified === 'boolean' ? { newVerified: result.verified } : {}),
            });
            logDataChange({
                userId: req?.user?.id,
                entity: "user",
                entityId: targetId,
                operation: "update",
                changedFields: ["verified", "status"],
                ip: req.ip,
                correlationId: req?.correlationId || "no-corr",
            });
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
            const targetId = Number(req.params.id);
            const before = await this.admminService.find_user_by_id(targetId);
            const result = await this.admminService.delete_user(targetId)
                // Audit logs
                logDataChange({
                    userId: req?.user?.id,
                    entity: "user",
                    entityId: before?.id ?? targetId,
                    operation: "delete",
                    changedFields: [],
                    ip: req.ip,
                    correlationId: req?.correlationId || "no-corr",
                });
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
            const targetId = Number(req.params.id);
            const changedFields = Object.keys(req.body || {});
            const result = await this.admminService.edit_user(targetId, req.body)
            // Audit logs
            logDataChange({
                userId: req?.user?.id,
                entity: "user",
                entityId: targetId,
                operation: "update",
                changedFields,
                ip: req.ip,
                correlationId: req?.correlationId || "no-corr",
            });
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
            const changedFields = Object.keys(req.body || {});
            const result = await this.admminService.add_user(req.body)
            // Audit logs
            logDataChange({
                userId: req?.user?.id,
                entity: "user",
                entityId: result?.id,
                operation: "create",
                changedFields,
                ip: req.ip,
                correlationId: req?.correlationId || "no-corr",
            });
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
