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

    // Repost Job Posting Methods
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

    async get_all_announcement(req: any, res: any){
        try{
            const result = await this.professorService.get_all_announcement(req);
            res.status(200).json({
                message: "Announcements retrieved successfully",
                data: result
            })
        }catch(error:any){
            res.status(400).json({
                message: error.message
            })
        }
    }


    async edit_post(req: any, res: any){
        try{
            const result = await this.professorService.edit_post(req, Number(req.params.id), req.body);
            res.status(200).json({
                message: "Post edited successfully",
                data: result
            })
        }catch(error:any){
            res.status(400).json({
                message: error.message
            })
        }
    }

    async delete_post(req: any, res: any){
        try{
            const result = await this.professorService.delete_post(req, Number(req.params.id));
            res.status(200).json({
                message: "Post deleted successfully",
                data: result
            })
        }catch(error:any){
            res.status(400).json({
                message: error.message
            })
        }
    }

    async get_post_by_id(req: any, res: any){
        try{
            const result = await this.professorService.get_post_by_id(req, Number(req.params.id));
            res.status(200).json({
                message: "Post retrieved successfully",
                data: result
            })
        }catch(error:any){
            res.status(400).json({
                message: error.message
            })
        }
    }

    async get_all_posts(req: any, res: any){
        try{
            const result = await this.professorService.get_all_posts(req);
            res.status(200).json({
                message: "Posts retrieved successfully",
                data: result
            })
        }catch(error:any){
            res.status(400).json({
                message: error.message
            })
        }
    }
}