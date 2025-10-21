import { NotificationStatus, type jobApplication, type PrismaClient } from "@prisma/client";
import { PrismaDB } from "../helper/prismaSingleton.js";
import type { CompanyProfileDB } from "../model/companyModel.js";
import type {CompanyProfileDTO} from "../dtoModel/companyDTO.js";
import type { CompanyJobPostingDTO } from "../dtoModel/companyDTO.js";
import type { CompanyJobApplicationStatus, EmployeeJobApplicationStatus } from "../utils/enums.js";
import { stat } from "fs";
import { application } from "express";

export class CompanyRepository {

    private prisma: PrismaClient
    
    constructor() {
        this.prisma = PrismaDB.getInstance();
    }

    async create_company_profile(input: CompanyProfileDTO): Promise<CompanyProfileDB>{
        const companyProfile = await this.prisma.companyProfile.create({
            data: {
                ...input,
            }
        });
        if (input.company_name) {
            await this.update_company_name(input.user_id, input.company_name);
        }
        return companyProfile;
    }
    async find_profile_by_user_id(user_id: number): Promise<CompanyProfileDB | null> {
        return this.prisma.companyProfile.findUnique({
            where: {
                user_id: user_id
            },
            include: {
                comments: {
                    orderBy: {created_at: 'desc'}
                }
            }
        });
    }

    async update_company_name(user_id: number, company_name: string | null): Promise<void> {
        await this.prisma.user.update({
            where: {
                id: user_id
            },
            data: {
                company_name: company_name
            }
        });
    }

    async update_company_profile(user_id: number, input: CompanyProfileDTO): Promise<CompanyProfileDB | null> {
        if (input.company_name) {
            await this.update_company_name(user_id, input.company_name);
        }
        return this.prisma.companyProfile.update({
            where: {
                user_id: user_id
            },
            data: {
                ...input,
            }
        });
    }

    async create_job_posting(input: CompanyJobPostingDTO & { company_id: number }) {
        return this.prisma.jobPost.create({
            data: {
                description: input.description,
                jobType: input.jobType,
                position: input.position,
                available_position: input.available_position,
                company_id: input.company_id
            }
        });
    }

    async find_today_job_postings(company_id: number, today: Date) {
        return this.prisma.jobPost.findMany({
            where: {
                company_id: company_id, // company profile id
                created_at: {
                    gte: today,
                    lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) // end of today
                }
            }
        });
    }

    async find_job_posting_by_id(id: number) {
        return this.prisma.jobPost.findUnique({
            where: {
                id: id
            }
        });
    }

    async find_all_job_postings_by_company_id(company_id: number) {
        return this.prisma.jobPost.findMany({
            where: {
                company_id: company_id
            },
            orderBy: {
                created_at: 'desc'
            }
        });
    }


    async update_job_posting(id: number, input: CompanyJobPostingDTO) {
        return this.prisma.jobPost.update({
            where: {
                id: id
            },
            data: {
                description: input.description,
                jobType: input.jobType,
                position: input.position,
                available_position: input.available_position
            }
        });
    }

    async delete_job_posting(id: number) {
        return this.prisma.jobPost.delete({
            where: {
                id: id
            }
        });
    }

    private transformJobApplication(app: any) {
        const employeeUser = app.employee?.user ?? app.jobBatch?.user?.user;
        const resumeUrl = app.resume?.file_url ?? app.jobBatch?.resume?.file_url ?? "";
        return {
            id: app.id,
            batch_id: app.batch_id ?? null,
            job_id: app.job_id,
            resume_id: app.resume_id ?? app.jobBatch?.resume?.id ?? null,
            description: app.job_post.description,
            jobType: app.job_post.jobType,
            name: `${employeeUser?.first_name || ""} ${employeeUser?.last_name || ""}`.trim(),
            email: employeeUser?.email || "",
            position: app.job_post.position,
            company_send_status: app.company_send_status,
            employee_send_status: app.employee_send_status,
            applied_at: app.applied_at,
            resume_url: resumeUrl,
        };  
    }


    async find_all_job_applications_by_company_id(filters: any, sortField?:string, sortOrder: "asc" | "desc" = "desc") {
        const orderByClause =
            sortField === "position"
            ? { job_post: { position: sortOrder } } // nested field
            : ["applied_at", "status"].includes(sortField || "")
            ? { [sortField!]: sortOrder }
            : { applied_at: sortOrder };

        const applications = await this.prisma.jobApplication.findMany({
            where: 
                filters
            ,
            include: {
                //individual job-applications
                job_post: { select: { position: true, description: true, jobType: true } },
                employee: {include: { user: { select: { first_name: true, last_name: true, email: true } } } },
                resume: { select: {id: true, file_url: true } }, 
            },
            // add sort
            orderBy: orderByClause
        });
        return applications.map(this.transformJobApplication);
    }

    async find_job_application_by_id(company_id: number, id: number) {
        const app = await this.prisma.jobApplication.findFirst({
            where: {
            id,
            job_post: { company_id },
            },
            include: {
            job_post: { select: { position: true, description: true, jobType: true } },
            employee: { include: { user: { select: { first_name: true, last_name: true, email: true } } } },
            resume: { select: { id: true, file_url: true } },
            },
        });

        if (!app) return null;
        return this.transformJobApplication(app);
    }

    async update_job_application_status(id: number, status: string) {
        return this.prisma.jobApplication.update({
            where: {
                id: id
            },
            data: {
                company_send_status: status as CompanyJobApplicationStatus
            }
        });
    }

    async send_the_confirmation_to_employee(job_application_id: number, user_id: number){
        const company = await this.prisma.companyProfile.findUnique({
            where: {
                user_id: user_id
            }
        })
        const job_application = await this.prisma.jobApplication.findUnique({
            where: {
                id: job_application_id
            }
        })
        if(!job_application){
            throw new Error("Job application not found")
        }
        else if(!company){
            throw new Error("Company profile not found")
        }
        const job_applcation_update_status = await this.prisma.jobApplication.update({
            where: {
                id : job_application_id
            },
            data: {
                company_send_status: "Confirmed",
                company_responded_at: new Date()
                }
            }
        )
        const notification = await this.prisma.notification.create({
            data: {
                message: "Congratulations! Your application has been confirmed. We're looking for your confirmation letter to continue the process.",
                employee_id: job_application.employee_id!,
                company_id: company.id,
                application_id: job_application.id,
                notification_status: "Accepted",
                notification_type: "ApplicationConfirmed"
            },
            include:{
                application: true
            }
        })
        return notification
    }

}
