import type { Request, Response } from "express";
import { JobPostingService } from "../service/jobPostingService.js";

export class JobPostingPublicController {

    private JobPostingService: JobPostingService;

    constructor(){
        this.JobPostingService = new JobPostingService();
    }


    async get_all_job_postings(req: Request, res: Response){
        try{
            const { keyword, category } = req.query as { keyword: string; category: string };

            const jobPostings = await this.JobPostingService.get_all_job_postings(keyword, category);
            res.json({ job_postings: jobPostings });
        }catch(error: unknown){
            console.error((error as Error).message);
            res.status(500).json({ message: (error as Error).message });
        }
    }


    

    


}