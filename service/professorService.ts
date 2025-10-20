import { ProfessorRepository } from "../repository/professorRepository.js"
import type { EditProfessorProfileDTO, InputProfessorProfileDTO, ProfessorEditAnnouncementDTO, ProfessorAnnouncementDTO, ProfessorCreateInputDTO } from "../dtoModel/professorDTO.js";
import { UserService } from "./userService.js";
import { CompanyRepository } from "../repository/companyRepository.js";
import { AnnouncementType } from "../utils/enums.js";

export class ProfessorService{

    private professorRepository: ProfessorRepository
    private userService: UserService;
    private companyRepository: CompanyRepository;

    constructor(){
        this.professorRepository = new ProfessorRepository();
        this.userService = new UserService();
        this.companyRepository = new CompanyRepository();
    }

    async has_profile(user_id: number){
        const profile = await this.professorRepository.get_profile(user_id);
        if (!profile){
            throw new Error("Profile not found");   
        }
        return profile;
    }

    async create_profile(req: any, input: InputProfessorProfileDTO){
        if (!input.department) {
            throw new Error("Department is required");
        }
        if (!input.faculty) {
            throw new Error("Faculty is required");
        }
        return await this.professorRepository.create_profile(req.user.id, input) 
      }

    async get_profile(req: any){
            const result = await this.professorRepository.get_profile(req.user.id)
            if(!result){
                throw new Error("Profile not found")
            }
            // Attach signed S3 URL to the profile picture
            result.profile_image_url = await this.userService.get_profile_image(req.user.id);
            return result
        }
    

    async delete_profile(req: any){
        const profile = await this.has_profile(req.user.id);
        if (!profile) {
            throw new Error("Profile not found");
        }
        const result = await this.professorRepository.delete_profile(req.user.id)
        return result
        
    }

    async edit_profile(req: any, input: EditProfessorProfileDTO){
        const profile = await this.has_profile(req.user.id);
        if (!profile.user.first_name && !input.first_name) {
            throw new Error("First name is required");
        }
        if (!profile.user.last_name && !input.last_name) {
            throw new Error("Last name is required");
        }
        const result = await this.professorRepository.edit_profile(req.user.id, input)
        if(!result){
            throw new Error("Profile not found")
        }
        return result;
    }

    async add_comment_to_company(user_id: number, company_id: number, comment: string){
        return await this.professorRepository.add_comment_to_company(user_id, company_id, comment)
    }

    async edit_comment(user_id: number, comment_id: number , comment: string){
        return await this.professorRepository.edit_comment(user_id, comment_id, comment)
    }

    async delete_comment(user_id: number, comment_id: number){
        return await this.professorRepository.delete_comment(user_id, comment_id)
    }
    async has_reposted_job(profile_id: number, job_id: number){
        const repost = await this.professorRepository.get_repost_by_job_id(profile_id, job_id);
        return repost;
    }

    async normalizePostInput(input: ProfessorCreateInputDTO,type_post: AnnouncementType, job_id?: number): Promise<ProfessorAnnouncementDTO> {
        // Normalize the input data for all kind of post creation 
        // (repost, announcement, opinion)
        return {
            ...input,
            content: input.content?.trim() || null,
            is_connection: input.is_connection || false,
            job_id: job_id ?? null, // Only for repost, null for announcement
            type_post: type_post
        };
    }

    async repost_job(req: any, job_id: number, input: ProfessorCreateInputDTO){
        const profile = await this.has_profile(req.user.id);
        if (!profile) {
            throw new Error("Profile not found");
        }
        if (!job_id){
            throw new Error("Job ID is required to repost a job");
        }
        if (await this.has_reposted_job(profile.id, job_id)) {
            throw new Error("You have already reposted this job");
        }
        const normalizedInput = await this.normalizePostInput(input, AnnouncementType.Repost, job_id);
        const result = await this.professorRepository.create_post(profile.id, normalizedInput)
        return result
    }


    async get_all_repost_job(req: any){
        const profile = await this.has_profile(req.user.id);
        if (!profile) {
            throw new Error("Profile not found");
        }
        const result = await this.professorRepository.get_all_repost_job(profile.id)
        return result
    }


    // Professor Announcement Methods
    async create_announcement(req: any, input: ProfessorCreateInputDTO){
        const profile = await this.has_profile(req.user.id);
        if (!profile) {
            throw new Error("Profile not found");
        }
        if (!input.content) {
            throw new Error("Content is required for announcement");
        }
        const normalizedInput = await this.normalizePostInput(input, AnnouncementType.Announcement);
        console.log("Input Announcement:", normalizedInput);
        const result = await this.professorRepository.create_post(profile.id, normalizedInput)
        return result;
    }

    async get_all_announcement(req: any){
        const profile = await this.has_profile(req.user.id);
        if (!profile) {
            throw new Error("Profile not found");
        }
        const result = await this.professorRepository.get_all_announcement(profile.id)
        return result
    }

    // General GET, PATCH, DELETE Methods (Announcement, Repost, Opinion)
    async edit_post(req: any, post_id: number, input: ProfessorEditAnnouncementDTO){
        // edit all type of post (repost, announcement, opinion)
        const profile = await this.has_profile(req.user.id);
        if (!profile) {
            throw new Error("Profile not found");
        }
        if (!post_id){
            throw new Error("Post ID is required to edit a post");
        }
        const result = await this.professorRepository.edit_post(post_id, profile.id, input)
        return result
    }


    async delete_post(req: any, post_id: number){
        // delete all type of post (repost, announcement, opinion)
        const profile = await this.has_profile(req.user.id);
        if (!profile) {
            throw new Error("Profile not found");
        }
        if (!post_id){
            throw new Error("Post ID is required to delete a post");
        }
        const result = await this.professorRepository.delete_post(post_id, profile.id)
        return result
    }

    async get_post_by_id(req: any, post_id: number){
        const profile = await this.has_profile(req.user.id);
        if (!profile) {
            throw new Error("Profile not found");
        }
        if (!post_id){
            throw new Error("Post ID is required to get a post");
        }
        const result = await this.professorRepository.get_post_by_id(post_id,profile.id) 
        if(!result){
            throw new Error("Announcement not found")
        }
        return result;
    }

    async get_all_posts(req: any){
        const profile = await this.has_profile(req.user.id);
        if (!profile) {
            throw new Error("Profile not found");
        }
        const result = await this.professorRepository.get_all_posts(profile.id)
        return result
    }

    async create_opinion(req: any, input: ProfessorCreateInputDTO){
        const profile = await this.has_profile(req.user.id);
        if (!profile) {
            throw new Error("Profile not found");
        }
        if (!input.content) {
            throw new Error("Content is required for opinion");
        }
        const normalizedInput = await this.normalizePostInput(input, AnnouncementType.Opinion);
        console.log("Input Opinion:", normalizedInput);
        const result = await this.professorRepository.create_post(profile.id, normalizedInput)
        return result;
    }

    async get_all_opinions(req: any){
        const profile = await this.has_profile(req.user.id);
        if (!profile) {
            throw new Error("Profile not found");
        }
        const result = await this.professorRepository.get_all_opinions(profile.id)
        return result
    }


}