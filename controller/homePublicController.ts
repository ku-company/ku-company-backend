import type { Request, Response } from "express";
import { HomeService } from "../service/HomeService.js";

export class HomePublicController {

    private homeService: HomeService;

    constructor(){
        this.homeService = new HomeService();
    }

    async get_top_companies(req: Request, res: Response){
        try{
            const topCompanies = await this.homeService.get_top_companies();
            res.json({ top_companies: topCompanies });
        }catch(error: unknown){
            console.error((error as Error).message);
            res.status(500).json({ message: (error as Error).message });
        }
    }

    async get_top_job_postings(req: Request, res: Response){
        try{
            const topJobPostings = await this.homeService.get_top_job_postings();
            res.json({ top_job_postings: topJobPostings });
        }catch(error: unknown){
            console.error((error as Error).message);
            res.status(500).json({ message: (error as Error).message });
        }
    }


    

    


}