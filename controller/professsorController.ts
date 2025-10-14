import { ProfessorService } from "../service/professorService.js";
import type { Request, Response } from "express";

export class ProfessorController{
    private professorService: ProfessorService

    constructor(){
        this.professorService = new ProfessorService();
    }

    async get_professor_profile(req: any, res: any){
        try{
            const result = await this.professorService.get_profile(req);
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
            const result = await this.professorService.create_profile(req, req.body);
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
            const result = await this.professorService.delete_profile(req);
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
            const result = await this.professorService.edit_profile(req, req.body);
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

    async repost_job(req: any, res: any){
        try{
            const result = await this.professorService.repost_job(req, Number(req.params.id), req.body);
            res.status(200).json({
                message: "Job reposted successfully",
                data: result
            })
        }catch(error:any){
            res.status(400).json({
                message: error.message
            })
        }
    }

    async edit_repost(req: any, res: any){
        try{
            const result = await this.professorService.edit_repost(req, Number(req.params.id), req.body);
            res.status(200).json({
                message: "Repost edited successfully",
                data: result
            })
        }catch(error:any){
            res.status(400).json({
                message: error.message
            })
        }
    }

    async delete_repost(req: any, res: any){
        try{
            const result = await this.professorService.delete_repost(req, Number(req.params.id));
            res.status(200).json({
                message: "Repost deleted successfully",
                data: result
            })
        }catch(error:any){
            res.status(400).json({
                message: error.message
            })
        }
    }

    async get_all_repost_job(req: any, res: any){
        try{
            const result = await this.professorService.get_all_repost_job(req);
            res.status(200).json({
                message: "Repost job retrieved successfully",
                data: result
            })
        }catch(error:any){
            res.status(400).json({
                message: error.message
            })
        }
    }

    async get_repost_by_id(req: any, res: any){
        try{
            const result = await this.professorService.get_repost_by_id(req, Number(req.params.id));
            res.status(200).json({
                message: "Repost job retrieved successfully",
                data: result
            })
        }catch(error:any){
            res.status(400).json({
                message: error.message
            })
        }
    }


    async add_comment_to_company(req: any, res: any){
        try{
            const company_id = Number(req.params.id)
            const result = await this.professorService.add_comment_to_company(req.user.id, company_id, req.body.comment)
            res.status(200).json({
                message: "Comment added successfully",
                data: result
            })
        }catch(error: any){
            res.status(400).json({
                message: error.message
            })
        }
    }
    async edit_comment(req: any, res: any){
        try{
            const comment_id = Number(req.params.id)
            const result = await this.professorService.edit_comment(req.user.id, comment_id, req.body.comment)
            res.status(200).json({
                message: "Comment edited successfully",
                data: result
            })
        }catch(error: any){
            res.status(400).json({
                message: error.message
            })
        }
    }
    
    async delete_comment(req: any, res: any){
        try{
            const comment_id = Number(req.params.id)
            const result = await this.professorService.delete_comment(req.user.id, comment_id)
            res.status(200).json({
                message: "Comment deleted successfully",
                data: result
            })
        }catch(error: any){
            res.status(400).json({
                message: error.message
            })
        }
    }

    async create_announcement(req: any, res: any){
        try{
            const result = await this.professorService.create_announcement(req, req.body);
            res.status(201).json({
                message: "Announcement created successfully",
                data: result
            })
        }catch(error:any){
            res.status(400).json({
                message: error.message
            })
        }
    }
}