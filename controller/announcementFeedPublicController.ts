import type { Request, Response } from "express";
import { AnnouncementService } from "../service/announcementService.js";

export class AnnouncementController{
    private announcementService: AnnouncementService

    constructor(){
        this.announcementService = new AnnouncementService();
    }

    async get_post_by_id(req: any, res: any){
        try{
            const result = await this.announcementService.get_post_by_id(Number(req.params.id));
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
            const result = await this.announcementService.get_all_posts();
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