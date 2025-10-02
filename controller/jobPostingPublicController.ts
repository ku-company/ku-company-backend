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

    async get_job_posting_by_id(req: Request, res: Response){
        try{
            const { id } = req.params;
            const jobPosting = await this.JobPostingService.get_job_posting_by_id(Number(id));
            if (!jobPosting) {
                return res.status(404).json({ message: "Job posting not found" });
            }
            res.json({ job_posting: jobPosting });
        }catch(error: unknown){
            console.error((error as Error).message);
            res.status(500).json({ message: (error as Error).message });
        }
    }


    

    


}