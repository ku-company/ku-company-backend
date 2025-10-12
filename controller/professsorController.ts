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


}