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