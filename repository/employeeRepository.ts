import type { PrismaClient } from "@prisma/client/extension";
import { PrismaDB } from "../helper/prismaSingleton.js";
import type { EditEmployeeProfile, InputEmployeeProfile } from "../model/employeeModel.js";
import { profile } from "console";

export class EmployeeRepository{

    private prisma: PrismaClient;

    constructor(){
        this.prisma = PrismaDB.getInstance();
    }
// CRUD for employee profile
    async create_profile(req: any){
        const existingProfile = await this.prisma.employeeProfile.findUnique({
            where: {
                user_id: req.user_id
            }
        })
        if(existingProfile){
            throw new Error("Profile already exists");
        }
        const data = req.body
        return await this.prisma.employeeProfile.create({
            data: {
                ...data,
                updated_at: new Date(),
                user: {
                    connect: {
                        id: req.user.id
                    }
                }
            }
        })
    };

    async get_profile(user_id: number){
        const result = await this.prisma.employeeProfile.findUnique({
            where: {
                user_id: user_id
            },
            include: {
                user: true
            }
        })
        return result
    };

    async delete_profile(user_id: number){
        return await this.prisma.employeeProfile.delete({
            where: {
                user_id: user_id
            }
        })
    };

    async edit_profile(user_id: number, input: EditEmployeeProfile){
        try{
            return await this.prisma.employeeProfile.update({
            where: {
                user_id: user_id
            },
            data: {
                ...input,
                updated_at: new Date()
            }
        })
        }catch(e){
            throw new Error("Profile not found");
        }
    };

// Apply job
    async apply_to_individual_job(job_id: number, user_id: number, resume_id: number){
        try{
            const employee = await this.prisma.employeeProfile.findUnique({
                where: {
                    user_id : user_id
                }
            })

            if(!employee){
                throw new Error("Employee profile not found");
            }
            const existingApplication = await this.prisma.jobApplication.findFirst({
                where: {
                    job_id: job_id,
                    employee_id: employee.id
                }
            })
            if(existingApplication){
                throw new Error("Already applied to this job");
            }
            const job = await this.prisma.jobPost.findUnique({
                where: {
                    id : job_id
                }
            })
            if(job.status !== "Active"){
                throw new Error("This job cannot be applied to");
            }
            if(job.available_position <= 0){
                throw new Error("no available positions");
            }else if(!job){
                throw new Error("Job not found");
            }
            if(!resume_id){
                throw new Error("Resume is required")
            }
            const resume = await this.prisma.resume.findUnique({
                where: {
                    id: resume_id,
                    employee_id: employee.id
                }
            })
            if(!resume){
                throw new Error("Resume not found");
            }
            const result = await this.prisma.jobApplication.create({
                data: {
                    job_id: job_id,    
                    employee_id: employee.id,
                    resume_id: resume_id
                },
                include: {
                    job_post: true
                }
            })
            return result
        }catch(e:any){
            throw new Error("Failed to apply to job: " + e.message);
        }
    }

    async list_own_resume(user_id: number){
        const employee = await this.prisma.employeeProfile.findUnique({
            where: {
                user_id : user_id
            }
        })
        return await this.prisma.resume.findMany({
            where: {
                employee_id: employee.id
            }
        })
    }

    async cancel_application(user_id: number, job_application_id: number){
        const owner = await this.prisma.employeeProfile.findUnique({
            where: {
                user_id : user_id
            }
        })
        const delete_application = await this.prisma.jobApplication.delete({
            where: {
                id : job_application_id,
                employee_id: owner.id
            },
            include: {
                job_post: true
            }
        })
        return delete_application
    }

    async list_all_applications(user_id: number){
        const employee = await this.prisma.employeeProfile.findUnique({
            where: {
                user_id : user_id
            }
        })
        const all_applications = await this.prisma.jobApplication.findMany({
            where: {
                employee_id: employee.id
            },
            include: {
                job_post: true
            }
        })
        return all_applications
    }
}
