import { AdminRepository } from "../repository/adminRepository.js";

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
}