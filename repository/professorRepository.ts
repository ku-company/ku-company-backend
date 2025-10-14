import type { PrismaClient } from "@prisma/client/extension";
import { PrismaDB } from "../helper/prismaSingleton.js";
import type { EditProfessorProfileDTO, InputProfessorProfileDTO, ProfessorRepostDTO,ProfessorAnnouncementDTO } from "../dtoModel/professorDTO.js";
import { VerifiedStatus } from "@prisma/client";
import { lstat } from "fs";
import type { employeeProfile } from "@prisma/client";

export class ProfessorRepository{

    private prisma: PrismaClient;

    constructor(){
        this.prisma = PrismaDB.getInstance();
    }
// CRUD for professor profile
    async create_profile(user_id: Number, input: InputProfessorProfileDTO){
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

    async edit_profile(user_id: number, input: EditProfessorProfileDTO){
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
  async repost_job(profile_id: number, job_id: number, input: ProfessorRepostDTO){
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
            content: input.content ?? null,
            is_connection: input.is_connection ?? false,
            job_post: { connect: { id: job_id } },
            professor: { connect: { id: profile_id } }

        },            
        include: {
                job_post: true,
            }
        })
    }

    async edit_repost(repost_id: number, profile_id: number, input: ProfessorRepostDTO){
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

    async create_announcement(profile_id: Number, input: ProfessorAnnouncementDTO){
        const profile = await this.prisma.professorProfile.findUnique({
            where: {
                id: profile_id
            },
            include: { user: true }
        });
        if (!profile) {
            throw new Error("Profile not found");
        }
        const announcement = await this.prisma.announcement.create({
        data: {
            professor_id: profile_id,
            content: input.content,
            is_connection: input.is_connection || false,
        }
        });
        // Get all student profiles
        const students = await this.prisma.employeeProfile.findMany();

        // Create notifications for each student
        const notifications = students.map((student: employeeProfile) => 
            this.prisma.notification.create({
                data: {
                    employee_id: student.id,
                    company_id: null,
                    professor_id: profile_id,
                    announcement_id: announcement.id,
                    message: `New announcement from Professor ${profile.user.first_name ?? ""} ${profile.user.last_name?.[0] ?? ""}: ${input.content?.substring(0, 50)}...`,
                    notification_status: "Unread",
                    notification_type: "NewAnnouncement",
                }
            })
        );
        await Promise.all(notifications);
        return announcement;


    }
}
