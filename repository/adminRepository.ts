import type { PrismaClient, VerifiedStatus } from "@prisma/client";
import { PrismaDB } from "../helper/prismaSingleton.js";
import type { UserDB } from "../model/userModel.js";
import { Role } from "../utils/enums.js";

export class AdminRepository{
    private prisma: PrismaClient

    constructor(){
        this.prisma = PrismaDB.getInstance();
    }

    async find_user(id: number){
        const user_id = Number(id)
        const user = await this.prisma.user.findUnique({
            where: {
                id: user_id
            }
        })
        if(!user){
            throw new Error("User not found")
        }
        return user_id
    }
    
    async verify_user(id: number){
        const user_id =  await this.find_user(id)
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

    async reject_user(id: number){
        const user_id = await this.find_user(id)
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
    
    async delete_user(id: number){
        const user_id = await this.find_user(id)
        const deleted_user = await this.prisma.user.delete({
            where: {
                id: user_id
            }
        })
        return deleted_user
    }

    async edit_user(id: number, input: UserDB){
        const user_id = await this.find_user(id)
        const updated_user = await this.prisma.user.update({
            where: {
                id : user_id
            },
            data: {
                ...input,
                role: input.role as Role
            }
        })
        return updated_user
    }


    async add_user(input: UserDB){
        const add_user = await this.prisma.user.create({
            data: {
                first_name: input.first_name,
                last_name: input.last_name,
                company_name: input.company_name,
                user_name: input?.user_name,
                email: input.email,
                password_hash: input.password_hash,
                role: input.role as Role,
                verified: input.verified,
                profile_image: input.profile_image,
            }
        })
        return add_user
    }

    async list_user(){
        const all_users = await this.prisma.user.findMany({
            orderBy: {
                created_at: "desc"
            },
            select:{
                user_name: true,
                role: true,
                email: true,
                verified: true,
                status: true,
                created_at: true
            }
        })
        return all_users
    }

    async list_filtering_user(status: VerifiedStatus){
        const filtering_user = await this.prisma.user.findMany({
            where: {
                status: status
            },
            select:{
                user_name: true,
                role: true,
                email: true,
                verified: true,
                status: true,
                created_at: true
            }
        })
        return filtering_user
    }

    async find_user_by_id(id: number){
        const user_id = await this.find_user(id)
        const user = await this.prisma.user.findUnique({
            where: {
                id: user_id
            },
            select: {
                user_name: true,
                role: true,
                email: true,
                verified: true,
                status: true,
                created_at: true
            }
        })
        return user
    }
}