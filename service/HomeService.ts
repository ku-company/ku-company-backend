import { JobPostingPublicRepository } from "../repository/jobPostingRepository.js";
import { UserService } from "./userService.js";
import { HomeRepository } from "../repository/HomeRepository.js";


export class HomeService {

    private jobPostingRepository: JobPostingPublicRepository;
    private userService: UserService;
    private homeRepository: HomeRepository;

    constructor() {
        this.jobPostingRepository = new JobPostingPublicRepository()
        this.homeRepository = new HomeRepository();
        this.userService = new UserService();
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

}