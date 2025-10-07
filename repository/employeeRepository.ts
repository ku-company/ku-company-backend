import type { PrismaClient } from "@prisma/client/extension";
import { PrismaDB } from "../helper/prismaSingleton.js";
import type { EditEmployeeProfile, InputEmployeeProfile } from "../model/employeeModel.js";
import { profile } from "console";
import type { Resume } from "@prisma/client";

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

    async upload_resume(employee_id: number, file_url: string, is_main = false): Promise<void> {
        await this.prisma.resume.create({
            data: {
            employee_id: employee_id, // profile id
            file_url: file_url,
            is_main: is_main
            }
        });
    }

    async get_resumes(employee_id: number): Promise<Resume[]> {
        const resumes = await this.prisma.resume.findMany({
            where: {
                employee_id: employee_id
            },
        });
        return resumes;
        }

    async resume_count(employee_id: number): Promise<number> {
        const count = await this.prisma.resume.count({
            where: {
                employee_id: employee_id
            }
        });
        return count;
    }

    async get_resume_by_id(resume_id: number, employee_id: number):Promise<Resume | null> {
        return await this.prisma.resume.findUnique({
            where: {
                id: resume_id,
                employee_id: employee_id
            }
        });
    }

    async delete_resume_by_id(resume_id: number, employee_id: number): Promise<void> {
        await this.prisma.resume.delete({
            where: {
                id: resume_id,
                employee_id: employee_id
            }
        });
    }

    async delete_resumes_by_profile_id(employee_id: number): Promise<void> {
        await this.prisma.resume.deleteMany({
            where: {
                employee_id: employee_id
            }
        });
    }

   async find_main_resume(employee_id: number): Promise<Resume | null> {
        return await this.prisma.resume.findFirst({
            where: {
                employee_id: employee_id,
                is_main: true
            }
        });
    } 

    async set_main_resume(resume_id: number, employee_id: number): Promise<Resume> {
        return await this.prisma.resume.update({
            where: {
                employee_id: employee_id,
                id: resume_id
            },
            data: {
                is_main: true
            }
        });

    }

    async unset_main_resume(resume_id: number, employee_id: number): Promise<Resume> {
        return await this.prisma.resume.update({
            where: {
                employee_id: employee_id,
                id: resume_id
            },
            data: {
                is_main: false
            }
        });

    }

    
// Apply job
    async apply_to_individual_job(job_id: number, user_id: number, resume_id: number, batch_id?: number){
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
                    resume_id: resume_id,
                    batch_id: batch_id
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
        const application = await this.prisma.jobApplication.findUnique({
            where: {
                id: job_application_id,
                employee_id: owner.id
            }
        })
        if(!application){
            throw new Error("Application not found")
        }
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

    async apply_job_checkout_list(user_id: number, resume_id: number, job_ids: number[]){
        
        const employee = await this.prisma.employeeProfile.findUnique({
            where: {
                user_id: user_id
            }
        })
        if(!employee){
            throw new Error("Employee profile not found");
        }
        const batch = await this.prisma.jobApplicationBatch.create({
            data: {
                employee_id: employee.id,
                resume_id: resume_id,
            }
        })
        const existingApplications = await Promise.all(job_ids.map(async (job_id) => {
        return await this.prisma.jobApplication.findFirst({
                where: {
                    job_id: job_id,
                    employee_id: employee.id
                },
                include: {
                    job_post: true 
                }
            });
        }));

        const alreadyAppliedApplications = existingApplications.filter(app => app !== null);

        if (alreadyAppliedApplications.length > 0) {
        const error = new Error(
            "Already applied to these jobs: " +
            alreadyAppliedApplications.map(app => app.job_post.description).join(", ")
        );
        (error as any).alreadyAppliedApplications = alreadyAppliedApplications;
        throw error;
        }

        const application = await Promise.all(job_ids.map(async (job_id) => {
            const result = await this.apply_to_individual_job(job_id, user_id , resume_id, batch.id)
            return result
        }))
        return application
    }
}
