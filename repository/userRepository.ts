import type { PrismaClient } from "@prisma/client";
import { PrismaDB } from "../helper/prismaSingleton.js";
import type { UserDB } from "../model/userModel.js";
import { Role } from "../utils/enums.js";
import bcrypt from "bcryptjs";

export class UserRepository {

    private prisma: PrismaClient

    constructor() {
        this.prisma = PrismaDB.getInstance();
    }

    async create_user(input: UserDB): Promise<UserDB>{
        return await this.prisma.user.create({
            data: {
                first_name: input.first_name,
                last_name: input.last_name,
                company_name: input.company_name,
                user_name: input?.user_name,
                email: input.email,
                password_hash: input.password_hash,
                roles: input.roles as Role,
                verified: input.verified,
                profile_image: input.profile_image,
            }
        })
    }

    async is_valid_user(user_name: string, pwd: string){
        const user = await this.prisma.user.findFirst({
            where: {
                user_name,
            },
        });
        console.log(user);
        if(!user || !user.password_hash){
            return false
        }

        const is_valid = await bcrypt.compare(pwd, user.password_hash);
        console.log(is_valid);
        return is_valid ? true : false;
    }

    async is_valid_create_user(user_name: string, email: string, company_name?: string){
        const email_exists = await this.prisma.user.findFirst({
            where : {
                email
            },
            select : {
                email: true
            }
        })
        const user_name_exists = await this.prisma.user.findFirst({
            where:{
                user_name
            },
            select: {
                user_name: true
            }
        })
        if(company_name){
            const company_name_exists = await this.prisma.user.findFirst({
                where: {
                    company_name
                },
                select : {
                    company_name: true
                }
            
                })
            if(company_name_exists){
                throw new Error("Company name already exists")
            }
        }
        if(email_exists && user_name_exists){
            throw new Error("Email and Username are already taken")
        }
        if(email_exists){
            throw new Error("Email is already taken")
        }
        if(user_name_exists){
            throw new Error("User name is already taken")
        }
        return true
        
    }

    async get_user_by_userName(user_name: string){
        const user = await this.prisma.user.findFirst({
            where: {
                user_name: user_name
            }
        })
        if(!user){
            throw new Error("User not found")
        }
        return user;
    }


}