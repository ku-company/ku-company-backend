import type { PrismaClient } from "@prisma/client";
import { PrismaDB } from "../helper/prismaSingleton.js";
import type { UserDB } from "../model/userModel.js";
import { Role } from "../utils/enums.js";

export class AdminRepository{
    private prisma: PrismaClient

    constructor(){
        this.prisma = PrismaDB.getInstance();
    }

    async find_user(user_id: number){
        const user = await this.prisma.user.findUnique({
            where: {
                id: user_id
            }
        })
        if(!user){
            throw new Error("User not found")
        }
        return true
    }
    
    async verify_user(user_id: number){
        this.find_user(user_id)
        const updated_user = await this.prisma.user.update({
            where: {
                id: user_id
            },
            data: {
                verified: true,
                status: "Approved",
                updated_at: new Date()
            }
        })
        return updated_user
    }

    async reject_user(user_id: number){
        this.find_user(user_id)
        const updated_user = await this.prisma.user.update({
            where: {
                id: user_id
            },
            data: {
                verified: false,
                status: "Rejected",
                updated_at: new Date()
            }
        })
        return updated_user
    }
    
    async delete_user(user_id: number){
        this.find_user(user_id)
        const deleted_user = await this.prisma.user.delete({
            where: {
                id: user_id
            }
        })
        return deleted_user
    }

    async edit_user(user_id: number, input: UserDB){
        this.find_user(user_id)
        const updated_user = await this.prisma.user.update({
            where: {
                id : user_id
            },
            data: {
                ...input,
                role: input.role as Role
            }
            
        })
    }
}