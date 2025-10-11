import { ProfessorRepository } from "../repository/professorRepository.js"
import type { EditProfessorProfile, InputProfessorProfile } from "../model/professorModel.js";
import { UserService } from "./userService.js";

export class ProfessorService{

    private professorRepository: ProfessorRepository
    private userService: UserService;

    constructor(){
        this.professorRepository = new ProfessorRepository();
        this.userService = new UserService();
    }

    async has_profile(user_id: number){
        const profile = await this.professorRepository.get_profile(user_id);
        if (!profile){
            throw new Error("Profile not found");   
        }
        return profile;
    }

    async create_profile(req: any, input: InputProfessorProfile){
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
            const result = await this.professorRepository.delete_profile(req.user.id)
            if(!result){
                throw new Error("Profile not found")
            }
            return result
        
    }

    async edit_profile(req: any, input: EditProfessorProfile){
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

}
