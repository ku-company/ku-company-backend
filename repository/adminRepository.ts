import type { PrismaClient, VerifiedStatus } from "@prisma/client";
import { PrismaDB } from "../helper/prismaSingleton.js";
import type { UserDB } from "../model/userModel.js";
import { Role } from "../utils/enums.js";
import { Prisma } from "@prisma/client";

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

    async edit_user_status(id:number, status: VerifiedStatus){
        const user_id = Number(id)
        try{
        if (status == "Approved"){
            const updated_user= await this.prisma.user.update({
            where: {
                id: user_id
            },
            data: {
                status: status,
                verified: true,
                updated_at: new Date()
            }
            })
            return updated_user
        }
        else if(status == "Rejected"){
            const updated_user = await this.prisma.user.update({
                where: {
                    id: user_id
                },
                data: {
                    status: status,
                    verified: false,
                    updated_at: new Date()
                }
            })
            return updated_user
            }
        else if(status == "Pending"){
            const updated_user = await this.prisma.user.update({
                where: {
                    id: user_id
                },
                data: {
                    status: status,
                    verified: false,
                    updated_at: new Date()
                }
            })
            return updated_user
        }
        }catch(error){
            throw new Error("Invalid status value")
        }
    }

    async edit_user_verified(id:number, verified: boolean){
        const user_id = Number(id)
        const updated_user= await this.prisma.user.update({
            where: {
                id: user_id
            },
            data: {
                verified: verified,
                updated_at: new Date()
            }
        })
        return updated_user
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

    async edit_user(id: number, input: UserDB) {
        const user_id = Number(id);
        const user = await this.prisma.user.findUnique({
                where: { id: user_id },
                include: { employeeProfile: true }
            });

        if (!user) throw new Error("User not found");

        const data: Prisma.UserUpdateInput = {
                    first_name: input.first_name,
                    last_name: input.last_name,
                    company_name: input.company_name,
                    user_name: input.user_name,
                    email: input.email,
                    password_hash: input.password_hash,
                    role: input.role as Role,
                    verified: input.verified,
                    profile_image: input.profile_image,
                    updated_at: new Date(),
                    };


        if (input.employeeProfile) {
        data.employeeProfile = user.employeeProfile
            ? { update: input.employeeProfile }
            : {};
        }

        if (input.companyProfile) {
            data.companyProfile = { update: input.companyProfile };
        }

        if(input.professorProfile){
            data.professorProfile = { update: input.professorProfile };
        }
        
        const updated_user = await this.prisma.user.update({
            where: { id:user_id },
            include: { employeeProfile: true, companyProfile: true, professorProfile: true},
            data,
        });
        return updated_user;
    }

    async list_jobPosting(){
        const list_jobPosting = await this.prisma.jobPost.findMany({})
        return list_jobPosting
    }

    async list_jobPosting_filtering(verified: boolean){
        const list_jobPosting = await this.prisma.jobPost.findMany({
            where: {
                verified: verified
            }
        })
        return list_jobPosting
    }


    async edit_verified_status(job_post_id: number, verified: boolean){
        const updated_jobPosting = await this.prisma.jobPost.update({
            where: {
                id: job_post_id
            },
            data: {
                verified: verified,
                updated_at: new Date()
            }
        })
        return updated_jobPosting
    }

    async get_jobPosting_by_id(job_post_id: number){
        const job_posting = await this.prisma.jobPost.findUnique({
            where: {
                id: job_post_id
            }
        })
        return job_posting
    }

    async delete_jobPosting(job_post_id: number){
        const deleted_jobPosting = await this.prisma.jobPost.delete({
            where: {
                id: job_post_id
            }
        })
        return deleted_jobPosting
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
                status: "Pending",
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
                id: true,
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
                id: true,
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
                id: true,
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