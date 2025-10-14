import { ProfessorRepository } from "../repository/professorRepository.js"
import type { EditProfessorProfileDTO, InputProfessorProfileDTO, ProfessorRepostDTO, ProfessorAnnouncementDTO} from "../dtoModel/professorDTO.js";
import { UserService } from "./userService.js";
import { CompanyRepository } from "../repository/companyRepository.js";

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

     async repost_job(req: any, job_id: number, input: ProfessorRepostDTO){
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
        const result = await this.professorRepository.repost_job(profile.id, job_id, input)
        return result
    }

    async edit_repost(req: any, repost_id: number, input: ProfessorRepostDTO){
        const profile = await this.has_profile(req.user.id);
        if (!profile) {
            throw new Error("Profile not found");
        }
        if (!repost_id){
            throw new Error("Repost ID is required to edit a repost");
        }
        const result = await this.professorRepository.edit_repost(repost_id, profile.id, input)
        return result
    }

    async delete_repost(req: any, repost_id: number){
        const profile = await this.has_profile(req.user.id);
        if (!profile) {
            throw new Error("Profile not found");
        }
        if (!repost_id){
            throw new Error("Repost ID is required to delete a repost");
        }
        const result = await this.professorRepository.delete_repost(repost_id, profile.id)
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

    async get_repost_by_id(req: any, repost_id: number){
        if (!repost_id){
            throw new Error("Repost ID is required to get a repost");
        }
        const result = await this.professorRepository.get_repost_by_id(repost_id)
        if(!result){
            throw new Error("Repost not found")
        }
        return result;
    }

    async create_announcement(req: any, input: ProfessorAnnouncementDTO){
        const profile = await this.has_profile(req.user.id);
        if (!profile) {
            throw new Error("Profile not found");
        }
        if (!input.content) {
            throw new Error("Content is required for announcement");
        }
        const result = await this.professorRepository.create_announcement(profile.id, input)
        return result;

    }

}
