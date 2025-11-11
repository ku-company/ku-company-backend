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
         const result = await this.adminRepository.reject_user(user_id)
         // Terminate sessions for this user
         try {
             const { revokeAllTokensForUser } = await import('../utils/tokenBlacklist.js');
             revokeAllTokensForUser(user_id);
         } catch {/* ignore */}
         return result
     }
     
     async delete_user(user_id: number){
         const result = await this.adminRepository.delete_user(user_id)
         try {
             const { revokeAllTokensForUser } = await import('../utils/tokenBlacklist.js');
             revokeAllTokensForUser(user_id);
         } catch {/* ignore */}
         return result
     }

     async edit_user_status(user_id: number, status: VerifiedStatus){
         const result = await this.adminRepository.edit_user_status(user_id, status)
         // On any status change, revoke sessions as a safety baseline
         try {
          const { revokeAllTokensForUser } = await import('../utils/tokenBlacklist.js');
          revokeAllTokensForUser(user_id);
         } catch {/* ignore */}
         return result
     }

     async edit_user_verified(user_id: number, verified: boolean){
            const result = await this.adminRepository.edit_user_verified(user_id, verified)
            if (verified === false) {
                try {
                    const { revokeAllTokensForUser } = await import('../utils/tokenBlacklist.js');
                    revokeAllTokensForUser(user_id);
                } catch {/* ignore */}
            }
            return result
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