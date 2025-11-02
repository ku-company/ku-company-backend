import type { PrismaClient } from "@prisma/client/extension";
import { PrismaDB } from "../helper/prismaSingleton.js";
import type { EditProfessorProfileDTO, InputProfessorProfileDTO, ProfessorEditAnnouncementDTO,ProfessorAnnouncementDTO, DegreeInputDTO } from "../dtoModel/professorDTO.js";
import type { employeeProfile, User } from "@prisma/client";
import type { Transporter } from "nodemailer";

let mailerPromise: Promise<Transporter | null> | null = null;

const getMailer = async (): Promise<Transporter | null> => {
    if (!mailerPromise) {
        mailerPromise = import("../helper/mail.js")
            .then((module) => module.mailer)
            .catch((error) => {
                console.error("Failed to load mailer transport:", error);
                return null;
            });
    }
    return mailerPromise;
};

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
                department: input.department,
                faculty: input.faculty,
                position: input.position,
                contactInfo: input.contactInfo,
                summary: input.summary,
                lab: input.lab,
                user: {
                    connect: { id: user_id },
                },
            },
            include: { degrees: true },
        })
    
    };


    private validateGraduationDate(date?: string | Date | null) {
        if (!date) return;

        const gradDate = new Date(date);
        if (isNaN(gradDate.getTime())) {
            throw new Error("Invalid graduation date format");
        }

        if (gradDate > new Date()) {
            throw new Error("Graduation date cannot be in the future");
        }
    }



    async add_degree(profile_id: number, input: DegreeInputDTO) {
        this.validateGraduationDate(input.graduation_date);
        return await this.prisma.degree.create({
            data: {
            professor_profile_id: profile_id,
            title: input.title,
            institution: input.institution ?? null,
            graduation_date: input.graduation_date
                ? new Date(input.graduation_date)
                : null,
            description: input.description ?? null,
            },
        });
    }

    // === EDIT DEGREE ===
    async edit_degree(degree_id: number, profile_id: number, input: DegreeInputDTO) {
        const existingDegree = await this.prisma.degree.findFirst({
            where: {
                id: degree_id,
                professor_profile_id: profile_id
            }
        });
        if (!existingDegree) {
            throw new Error("Degree not found");
        }
        this.validateGraduationDate(input.graduation_date);
        return await this.prisma.degree.update({
            where: { id: degree_id, professor_profile_id: profile_id },
            data: {
            title: input.title,
            institution: input.institution ?? null,
            graduation_date: input.graduation_date
                ? new Date(input.graduation_date)
                : null,
            description: input.description ?? null,
            },
        });
    }

    async delete_degree(degree_id: number, profile_id: number) {
        const existingDegree = await this.prisma.degree.findFirst({
            where: {
                id: degree_id,
                professor_profile_id: profile_id
            }
        });
        if (!existingDegree) {
            throw new Error("Degree not found");
        }
        return await this.prisma.degree.delete({
            where: { id: degree_id, professor_profile_id: profile_id },
        });
    }

    async get_all_degrees(profile_id: number) {
        return await this.prisma.degree.findMany({
            where: { professor_profile_id: profile_id },
        });
    }

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
                },
                degrees: true
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
            const { first_name, last_name, department, faculty, position, contactInfo, summary, lab} = input;
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
                },
                degrees: true
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

    async sent_announcement_notification_to_employees(profile_id: number ,announcement_id: number, content: string){
        const profile = await this.prisma.professorProfile.findUnique({
            where: { id: profile_id },
            include: { user: true },
        });

        if (!profile) {
            throw new Error("Professor profile not found");
        }

        const professorFirstName = profile.user.first_name ?? "";
        const professorLastInitial = profile.user.last_name?.[0] ?? "";
        const professorName = `${professorFirstName} ${profile.user.last_name ?? ""}`.trim();
        const announcementContent = content ?? "";
        const preview =
            announcementContent.length > 50
                ? `${announcementContent.substring(0, 50)}...`
                : announcementContent;

        const students = (await this.prisma.employeeProfile.findMany({
            where: {
                user: { verified: true},
            },
            include: { user: true },

        })) as Array<employeeProfile & { user: User | null }>;

        await Promise.all(
            students.map(async (student) => {
                await this.prisma.notification.create({
                    data: {
                        employee_id: student.id,
                        professor_id: profile_id,
                        announcement_id,
                        message: `New announcement from Professor ${professorFirstName} ${professorLastInitial}: ${preview}`,
                        notification_status: "Unread",
                        notification_type: "NewAnnouncement",
                    },
                });

                if (student.user?.email) {
                    const mailer = await getMailer();
                    if (!mailer) {
                        return;
                    }
                    try {
                        await mailer.sendMail({
                            from: `"KU Company System" <${process.env.MAIL_USER ?? ""}>`,
                            replyTo: profile.user.email ?? undefined,
                            to: student.user.email,
                            subject: `📢 New Announcement from Professor ${professorName}`,
                            text: `New announcement from Professor ${professorName}:\n\n${content}\n\n— KU Company System`,
                        });
                    } catch (error) {
                        console.error(`Failed to send email to ${student.user.email}:`, error);
                    }
                }
            })
        );
    }

    async create_post(
        profile_id: number,
        input: ProfessorAnnouncementDTO 
        ) {
        const { content, is_connection, type_post, job_id } = input;

        const data: any = {
        professor_id: profile_id,
        content: content ?? null,
        is_connection: is_connection ?? false,
        type_post,
        };

        if (job_id) {
            data.job_id = job_id; // for repost
        }

        const announcement = await this.prisma.announcement.create({
        data,
        include: { job_post: true },
        });

        // Notify all employees only if Announcement
        if (type_post === "Announcement") {
            if (!content) {
                throw new Error("Content is required for announcements");
            }
            this.sent_announcement_notification_to_employees(profile_id,announcement.id, content)
        }

        return announcement;
    }

    async edit_post(post_id: number, profile_id: number, input: ProfessorEditAnnouncementDTO){
        // edit all announcement type 
        const post = await this.prisma.announcement.findFirst({
            where: { id: post_id, type_post: input.type_post},
            select: { professor_id: true }
        });

        if (!post) {
            throw new Error("Post not found");
        }

        if (post.professor_id !== profile_id) {
            throw new Error("Unauthorized to edit this post");
        }
        return await this.prisma.announcement.update({
            where: {
                id: post_id
            },
            data: {
                ...input,
            }

        })
    }


    async delete_post(post_id: number, profile_id: number){
        // delete all announcement type (repost, announcement, opinion)
        const post = await this.prisma.announcement.findUnique({
            where: { id: post_id },
            select: { professor_id: true }
        });

        if (!post) {
            throw new Error("Post not found");
        }
        if (post.professor_id !== profile_id) {
            throw new Error("Unauthorized to delete this post");
        }
        return await this.prisma.announcement.delete({
            where: { id: post_id }
        });
    }

    async get_all_repost_job(profile_id: number){
        return await this.prisma.announcement.findMany({
            where: {
                professor_id: profile_id,
                type_post: "Repost"
            },
            include: {
                job_post: true,
            }
        })
    }

    async get_post_by_id(announcement_id: number, profile_id: number){
        // get Announcement by id of all type (repost, announcement, opinion)
        return await this.prisma.announcement.findFirst({
            where: {
                id: announcement_id,
                professor_id: profile_id
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

    async get_all_announcement(profile_id: number){
        return await this.prisma.announcement.findMany({
            where: {
                professor_id: profile_id,
                type_post: "Announcement"
            },
            orderBy: {
                created_at: 'desc'
            }
        })
    }

    async get_all_posts(profile_id: number){
        return await this.prisma.announcement.findMany({
            where: {
                professor_id: profile_id,
            },
            orderBy: {
                created_at: 'desc'
            },
            include: {
                job_post: true,
            }
        })
    }

    async get_all_opinions(profile_id: number){
        return await this.prisma.announcement.findMany({
            where: {
                professor_id: profile_id,
                type_post: "Opinion"
            },
            orderBy: {
                created_at: 'desc'
            }
        })
    }
    
}
