import type { PrismaClient } from "@prisma/client";
import { PrismaDB } from "../helper/prismaSingleton.js";
import type { UserDB} from "../model/userModel.js";
import type { UserSummaryDTO } from "../dtoModel/userDTO.js";
import { Role } from "../utils/enums.js";
import bcrypt from "bcryptjs";
import { ProfileFactory } from "../helper/profileStrategy.js";
import { DEFAULT_PROFILE_IMAGE_KEY } from "../utils/constants.js";

export class UserRepository {

    private prisma: PrismaClient

    constructor() {
        this.prisma = PrismaDB.getInstance();
    }

    async create_user(input: UserDB): Promise<any>{
        if (!input.profile_image) {
            input.profile_image = DEFAULT_PROFILE_IMAGE_KEY;
        }
        if(input.role === Role.Alumni  || input.role === Role.Student){
            if(!input.stdId) {
                throw new Error("StudentId is required for Student and Alumni roles");
            }
            if(input.email.endsWith("@ku.th")){
                return await this.prisma.user.create({
                    data: {
                    first_name: input.first_name,
                    last_name: input.last_name,
                    stdId: input.stdId,
                    user_name: input?.user_name,
                    email: input.email,
                    password_hash: input.password_hash,
                    role: input.role as Role,
                    verified: false,
                    status: "Pending",
                    profile_image: input.profile_image,
                    employeeProfile: {
                        create: {}
                    }
                }, 
                include: {
                    employeeProfile: true,
                }
                })
            }
            throw new Error("Email must be a valid ku.th email address");
        }
        else if(input.role === Role.Professor){
            if(input.email.endsWith("@ku.th") || input.email.endsWith("@ku.ac.th")){
                return await this.prisma.user.create({
                    data: {
                        first_name: input.first_name,
                        last_name: input.last_name,
                        user_name: input?.user_name,
                        email: input.email,
                        password_hash: input.password_hash,
                        role: input.role as Role,
                        verified: false,
                        status: "Pending",
                        profile_image: input.profile_image,
                    }
                })
            }
            console.log("Invalid email for professor:", input.email);
            throw new Error("Email must be a valid ku.th or ku.ac.th email address");
        }
        else if(input.role === Role.Admin){
            return await this.prisma.user.create({
                data: {
                    first_name: input.first_name,
                    last_name: input.last_name,
                    company_name: input.company_name,
                    user_name: input?.user_name,
                    email: input.email,
                    password_hash: input.password_hash,
                    role: input.role as Role,
                    verified: true,
                    status: "Approved",
                    profile_image: input.profile_image,
                }
            })
        }
        return await this.prisma.user.create({
            data: {
                first_name: input.first_name,
                last_name: input.last_name,
                company_name: input.company_name,
                user_name: input?.user_name,
                email: input.email,
                password_hash: input.password_hash,
                role: input.role as Role,
                verified: false,
                status: "Pending",
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
    
    async get_user_by_id(id: number){
        const user = await this.prisma.user.findUnique({
            where: {
                id: id
            }
        })
        if(!user){
            throw new Error("User not found")
        }
        return user;
    }

    async upload_profile_image(user_id: number, data: { profile_image: string }): Promise<void> {
        await this.prisma.user.update({
            where: {
                id: user_id
            },
            data: {
                profile_image: data.profile_image
            }
        });
    }  

    async delete_profile_image(user_id: number): Promise<void> {
        await this.prisma.user.update({
            where: {
                id: user_id
            },
            data: {
                profile_image: DEFAULT_PROFILE_IMAGE_KEY
            }
        });
    }

    async update_role(user_id: number, new_role: Role): Promise<UserSummaryDTO> {
        const user = await this.prisma.user.findUnique({
            where: { id: user_id }
        });

        if (!user) throw new Error("User not found");

        const email = user.email || "";
          if (new_role === Role.Student || new_role === Role.Alumni) {
            if (!email.endsWith("@ku.th")) {
                throw new Error("Email must be a valid ku.th email address");
            }
        } else if (new_role === Role.Professor) {
            if (!(email.endsWith("@ku.th") && !email.endsWith("@ku.ac.th"))) {
            throw new Error("Email must be a valid ku.th or ku.ac.th email address for professors");
            }
        }
        
        const updatedUser = await this.prisma.user.update({
            where: {
                id: user_id
            },
            data: {
                role: new_role as Role
            }
        });
        if(!updatedUser){
            throw new Error("User not found");
        }
        return updatedUser;
    }

    async get_profile(user_id: number){
        const user =  await this.prisma.user.findUnique({
            where: {
                id: user_id
            }
        })
        if(!user){
            throw new Error("User not found")
        }
        const strategy = ProfileFactory.set_strategy(user.role, this.prisma)
        const profile = await strategy.get_profile(user_id);
        if(!profile){
            throw new Error("Profile not found")
        }
        return profile
    }

}