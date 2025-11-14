import type { Request, Response } from "express";
import { JobPostingService } from "../service/jobPostingService.js";
import  { JobPostingPublicRepository } from "../repository/jobPostingRepository.js";
import { HomeService } from "../service/HomeService.js";

export class HomePublicController {

    private JobPostingService: JobPostingService;
    private JobPostingPublicRepository: JobPostingPublicRepository;
    private homeService: HomeService;

    constructor(){
        this.JobPostingService = new JobPostingService();
        this.JobPostingPublicRepository = new JobPostingPublicRepository();
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


    

    


}