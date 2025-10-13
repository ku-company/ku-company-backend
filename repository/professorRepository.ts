import type { PrismaClient } from "@prisma/client/extension";
import { PrismaDB } from "../helper/prismaSingleton.js";
import type { EditEmployeeProfile, InputEmployeeProfile } from "../model/employeeModel.js";
import type { EditProfessorProfile, InputProfessorProfile } from "../model/professorModel.js";
import { VerifiedStatus } from "@prisma/client";
import { lstat } from "fs";

export class ProfessorRepository{

    private prisma: PrismaClient;

    constructor(){
        this.prisma = PrismaDB.getInstance();
    }
// CRUD for professor profile
    async create_profile(user_id: Number, input: InputProfessorProfile){
        const existingProfile = await this.prisma.professorProfile.findUnique({
            where: {
                user_id: user_id
            }
        })
        if(existingProfile){
            throw new Error("Profile already exists");
        }
        return await this.prisma.professorProfile.create({
            data: {
                ...input,
                user: {
                    connect: {
                        id: user_id
                    }
                }
            }
        })
    };

    async get_profile(user_id: number){
        const result = await this.prisma.professorProfile.findUnique({
            where: {
                user_id: user_id
            },
            include: {
                user: {
                    select: {
                        first_name: true,
                        last_name: true,
                        email: true,
                        profile_image: true,
                        verified: true
                    }
                }
            }
        })
        return result
    };

    async delete_profile(user_id: number){
        return await this.prisma.professorProfile.delete({
            where: {
                user_id: user_id
            }
        })
    };

    async edit_profile(user_id: number, input: EditProfessorProfile){
        try{
            const { first_name, last_name, department, faculty, position, contactInfo, summary } = input;
            await this.prisma.user.update({
                where: {
                    id: user_id
                },
                data: {
                    first_name,
                    last_name
                }
            });
            return await this.prisma.professorProfile.update({
            where: {
                user_id: user_id
            },
            data: {
                department,
                faculty,
                position,
                contactInfo,
                summary,
                updated_at: new Date()
            },
            include: {
                user: {
                    select: {
                        first_name: true,
                        last_name: true,
                        email: true,
                        profile_image: true,
                        verified: true
                    }
                }
            }
        })
        }catch(e){
            throw new Error("Profile not found");
        }
    };

    async add_comment_to_company(user_id: number ,company_id: number, comment: string){
        const professor = await this.prisma.professorProfile.findUnique({
            where:{
                user_id: user_id
            }
        })
        if(!professor){
            throw new Error("Professor not found");
        }
        const company = await this.prisma.companyProfile.findUnique({
            where: {
                id: company_id
            }
        })
        if(!company){
            throw new Error("Company not found");
        }
        const add_comment = await this.prisma.comment.create({
            data: {
                user_id: user_id,
                company_id: company.id,
                content: comment,
                created_at: new Date()
            },
            include:{
                user: {
                    select: {
                        first_name: true,
                        last_name: true
                    }
                },
                company: true
            }
        })
        return add_comment
    }

    async edit_comment(user_id: number, comment_id: number , comment: string){
        const professor = await this.prisma.professorProfile.findUnique({
            where:{
                user_id: user_id
            }
        })
        if(!professor){
            throw new Error("Professor not found");
        }
        const find_comment = await this.prisma.comment.findUnique({
            where: {
                id: comment_id,
                user_id: user_id
            }
        })
        if(!find_comment){
            throw new Error("Comment not found");
        }

        const edit_comment = await this.prisma.comment.update({
            where: {
                id: comment_id,
                user_id: user_id
            },
            data: {
                content: comment,
                updated_at: new Date()
            },
            include: {
                user: {
                    select: {
                        first_name: true,
                        last_name: true
                    }
                },
                company: true
            }
        })
        return edit_comment
    }

    async delete_comment(user_id: number, comment_id: number){
        const professor = await this.prisma.professorProfile.findUnique({
            where:{
                user_id: user_id
            }
        })
        if(!professor){
            throw new Error("Professor not found");
        }
        const find_comment = await this.prisma.comment.findUnique({
            where: {
                id: comment_id,
                user_id: user_id
            }
        })
        if(!find_comment){
            throw new Error("Comment not found");
        }

        return await this.prisma.comment.delete({
            where: {
                id: comment_id,
                user_id: user_id
            }
        })

    }
}
