import type { Request, Response } from "express";
import { JobPostingService } from "../service/jobPostingService.js";
import  { JobPostingPublicRepository } from "../repository/jobPostingRepository.js";
import {isJobType, isPosition} from "../utils/validatorEnum.js";
import { JobType, Position } from "../utils/enums.js";
import { enumToDropdown } from "../utils/enumToDropdown.js";

export class JobPostingPublicController {

    private JobPostingService: JobPostingService;
    private JobPostingPublicRepository: JobPostingPublicRepository;

    constructor(){
        this.JobPostingService = new JobPostingService();
        this.JobPostingPublicRepository = new JobPostingPublicRepository();
    }

    async get_all_job_categories(req: Request, res: Response) {
        const categories = await this.JobPostingPublicRepository.get_all_job_categories();
        res.json({ categories });
    }

    async get_all_job_types(req: Request, res: Response) {
        console.log("Getting all job types");
        const jobTypes = enumToDropdown(JobType);
        res.json({ jobTypes });
    }

    async get_all_job_postings(req: Request, res: Response){
        try{
            const { keyword, category, jobType } = req.query as { keyword: string; category: string; jobType: string };

            // Validate jobType
            const jobTypeEnum = jobType && isJobType(jobType) ? jobType : undefined;
            if (jobType && !jobTypeEnum) {
                return res.status(400).json({ message: `Invalid jobType: ${jobType}` });
            }

            const jobPostings = await this.JobPostingService.get_all_job_postings(keyword, category, jobTypeEnum);
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