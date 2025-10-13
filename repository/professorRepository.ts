import type { PrismaClient } from "@prisma/client/extension";
import { PrismaDB } from "../helper/prismaSingleton.js";
import type { EditProfessorProfile, InputProfessorProfile, ProfessorRepost } from "../model/professorModel.js";

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

    async get_repost_by_job_id(profile_id: number, job_id: number){
        const repost = await this.prisma.announcement.findFirst({
            where: {
                professor_id: profile_id,
                job_id: job_id
            }
        });
        return repost;
    }

  // repost job posting
  async repost_job(profile_id: number, job_id: number, input: ProfessorRepost){
    const job = await this.prisma.jobPost.findUnique({
        where: {
            id: job_id
        }
    });
    if(!job){
        throw new Error("Job not found");
    }
    return await this.prisma.announcement.create({  
        data: {
            ...input,
            job_post: { connect: { id: job_id } },
            professor: { connect: { id: profile_id } }

        },            
        include: {
                job_post: true,
            }
        })
    }

    async edit_repost(repost_id: number, profile_id: number, input: ProfessorRepost){
        const repost = await this.prisma.announcement.findUnique({
            where: { id: repost_id },
            select: { professor_id: true }
        });

        if (!repost) {
            throw new Error("Repost not found");
        }

        if (repost.professor_id !== profile_id) {
            throw new Error("Unauthorized to edit this repost");
        }
        return await this.prisma.announcement.update({
            where: {
                id: repost_id
            },
            data: {
                ...input,
            }

        })
    }

    async delete_repost(repost_id: number, profile_id: number){
        const repost = await this.prisma.announcement.findUnique({
            where: { id: repost_id },
            select: { professor_id: true }
        });

        if (!repost) {
            throw new Error("Repost not found");
        }
        if (repost.professor_id !== profile_id) {
            throw new Error("Unauthorized to delete this repost");
        }
        return await this.prisma.announcement.delete({
            where: { id: repost_id }
        });
    }

    async get_all_repost_job(profile_id: number){
        return await this.prisma.announcement.findMany({
            where: {
                professor_id: profile_id
            },
            include: {
                job_post: true,
            }
        })
    }

    async get_repost_by_id(repost_id: number){
        return await this.prisma.announcement.findUnique({
            where: {
                id: repost_id
            },
            include: {
                job_post: true,
            }
        })
    }

}
