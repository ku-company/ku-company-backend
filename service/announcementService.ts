import { AnnouncementRepository } from "../repository/announcementRepository.js";


export class AnnouncementService {

    private announcementRepository: AnnouncementRepository;

    constructor() {
        this.announcementRepository = new AnnouncementRepository()
    }

    async get_all_posts(){
        // Fetch all professor's posts
        return await this.announcementRepository.get_all_posts();
    }

    async get_post_by_id(id: number){
        // Fetch proofessor's post by ID
        return await this.announcementRepository.get_post_by_id(id);
    }



}