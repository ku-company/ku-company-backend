import { JobPostingPublicRepository } from "../repository/jobPostingRepository.js";
import { UserService } from "./userService.js";
import type { JobPostingFeedDTO, JobPostWithCompany } from "../dtoModel/jobPostingDTO.js";


export class JobPostingService {

    private jobPostingRepository: JobPostingPublicRepository;
    private userService: UserService;

    constructor() {
        this.jobPostingRepository = new JobPostingPublicRepository()
        this.userService = new UserService();
    }

    private postedAgo(created_at: Date) {
        const days = Math.floor((Date.now() - new Date(created_at).getTime()) / 86400000);
        if (days <= 0) return "today";
        if (days === 1) return "1 day ago";
        return `${days} days ago`;
    }

    private async toFeedDTO(job: JobPostWithCompany): Promise<JobPostingFeedDTO> {
        return {
        id: job.id,
        position: job.position,
        description: job.description,
        jobType: job.jobType,
        available_position: job.available_position,
        company_name: job.company.company_name,
        company_profile_image: await this.userService.get_profile_image(job.company.user_id),
        company_location: job.company.location,
        company_tel: job.company.tel,
        created_at: job.created_at,
        updated_at: job.updated_at,
        posted_ago: this.postedAgo(job.created_at),
        };
    }

    async get_all_job_postings(keyword?: string, category?: string, jobType?: string): Promise<JobPostingFeedDTO[]> {
        const items = await this.jobPostingRepository.get_all_job_postings(keyword, category, jobType);
        return Promise.all(items.map((job) => this.toFeedDTO(job)));
    }

    async get_job_posting_by_id(id: number): Promise<JobPostingFeedDTO | null> {
        const item = await this.jobPostingRepository.get_job_posting_by_id(id);
        if (!item) return null;
        return this.toFeedDTO(item);
    }


}