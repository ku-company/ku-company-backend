import { AdminRepository } from "../repository/adminRepository.js";
import type { UserDB } from "../model/userModel.js";
import type { UserRepository } from "../repository/userRepository.js";
import type { VerifiedStatus } from "@prisma/client";

export class AdminService{
    private adminRepository: AdminRepository

    constructor(){
        this.adminRepository = new AdminRepository();
    }

     async verify_user(user_id: number){
        return await this.adminRepository.verify_user(user_id)
     }

     async reject_user(user_id: number){
         return await this.adminRepository.reject_user(user_id)
     }
     
     async delete_user(user_id: number){
         return await this.adminRepository.delete_user(user_id)
     }

     async get_jobPosting_by_id(post_id: number){
        const num_post_id = Number(post_id)
        return  await this.adminRepository.get_jobPosting_by_id(num_post_id)
     }
     
     async edit_jobPosting_verified(post_id: number, verified: boolean){
        const num_post_id = Number(post_id)
        return await this.adminRepository.edit_verified_status(num_post_id, verified)
     }

     async list_jobPosting(){
        return await this.adminRepository.list_jobPosting()
     }

     async list_filtering_jobPosting(verified: string){
        const verified_bool = Boolean(verified)
        return await this.adminRepository.list_jobPosting_filtering(verified_bool)
     }

     async delete_jobPosting(post_id: number){
            const num_post_id = Number(post_id)
            return await this.adminRepository.delete_jobPosting(num_post_id)
     }

     async edit_user_status(user_id: number, status: VerifiedStatus){
            return await this.adminRepository.edit_user_status(user_id, status)
     }

     async edit_user_verified(user_id: number, verified: boolean){
            return await this.adminRepository.edit_user_verified(user_id, verified)
     }

     async edit_user(user_id: number, input: UserDB){
         return await this.adminRepository.edit_user(user_id, input)
     }

     async add_user(input: UserDB){
         return await this.adminRepository.add_user(input)
     }

     async list_user(){
         return await this.adminRepository.list_user()
     }

     async list_filtering_user(status: VerifiedStatus){
         return await this.adminRepository.list_filtering_user(status)
     }
}