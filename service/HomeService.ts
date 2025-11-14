import { HomeRepository } from "../repository/HomeRepository.js";


export class HomeService {

    private homeRepository: HomeRepository;

    constructor() {
        this.homeRepository = new HomeRepository();
    }

    private postedAgo(created_at: Date) {
        const days = Math.floor((Date.now() - new Date(created_at).getTime()) / 86400000);
        if (days <= 0) return "today";
        if (days === 1) return "1 day ago";
        return `${days} days ago`;
    }

    async get_top_companies(){
        return this.homeRepository.get_top_companies();
    }

    async get_top_job_postings() {
        const jobPostings = await this.homeRepository.get_top_job_postings();
        const jobPostingsWithPostedAgo = await Promise.all(jobPostings.map(async (job) => {
            return {
                ...job,
                posted_ago: this.postedAgo(job.created_at),
            }
        }));
        return jobPostingsWithPostedAgo;
    }

}