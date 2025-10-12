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
                user_id: req.user.id
            }
        })
        if(existingProfile){
            throw new Error("Profile already exists");
        }

        const data: any = { ...req.body, updated_at: new Date() };

        // Convert birthDate to Date if provided
        if (req.body.birthDate) {
            data.birthDate = new Date(req.body.birthDate); // ✅ converts to ISO-8601 DateTime
        }

        return await this.prisma.employeeProfile.create({
            data: {
                ...data,
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

    async edit_profile(user_id: number, input: EditEmployeeProfile) {
        try {
            const data: any = { ...input, updated_at: new Date() };
            if (input.birthDate) {
                data.birthDate = new Date(input.birthDate); 
            }
            return await this.prisma.employeeProfile.update({
                where: { user_id },
                data,
            });
        } catch (e: any) {
            throw new Error("Failure because" + e.message);
        }
}

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
            if(employee.has_job == false){

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
            if(!job){
                throw new Error("Job not found")
            }
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
        }else{
            throw new Error("You have already a job")
        }
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
        if(!employee){
            throw new Error("Employee profile not found");
        }
        const resumes =  await this.prisma.resume.findMany({
            where: {
                employee_id: employee.id
            }
        })
        if(resumes.length == 0){
            throw new Error("No resumes found")
        }
        return resumes
    }

    async cancel_application(user_id: number, job_application_id: number){
        const owner = await this.prisma.employeeProfile.findUnique({
            where: {
                user_id : user_id
            }
        })
        if(!owner){
            throw new Error("Employee profile not found");
        }
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
        if(!delete_application){
            throw new Error("Failed to delete application")
        }
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
        if(all_applications.length == 0){
            throw new Error("No applications found")
        }
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
        if(!batch){
            throw new Error("Failed to create batch");
        }
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
            if(!result){
                throw new Error("Failed to apply to job");
            }
            return result
        }))
        return application
    }

    async sent_the_confirmation_to_company(user_id: number, job_application_id: number){
        const employee = await this.prisma.employeeProfile.findUnique({
            where: {
                user_id: user_id
            }
        })
        if(!employee){
            throw new Error("Employee profile not found");
        }
        const job_application = await this.prisma.jobApplication.findUnique({
                where: {
                    id: job_application_id
            },
                include: {
                    job_post: true
                }
            })
            
            if(!job_application){
                throw new Error("Job application not found")
            }
        
        if(employee.has_job == false){
        if(job_application.company_send_status === "Confirmed"){
            const job_applcation_update_status = await this.prisma.jobApplication.update({
            where: {
                id : job_application_id
            },
            data: {
                employee_send_status: "Confirmed",
                employee_responded_at: new Date()
            }
            })

            const employee_update_status = await this.prisma.employeeProfile.update({
                where: {
                    user_id: user_id
                },
                data: {
                    has_job: true
                }
            })
        
            const notification = await this.prisma.notification.create({
            data: {
                message: "I accepted your offer. Thank you for your consideration.",
                employee_id: employee.id,
                company_id: job_application.job_post.company_id,
                application_id: job_application_id,
                notification_status: "Accepted",
                notification_type: "ConfirmationAccepted"
            },
            include: {
                application: true
            }
            })
            const cancel_all_applications = await this.prisma.jobApplication.updateMany({
                where:{
                    employee_id: employee.id,
                    company_send_status: "Confirmed",
                    employee_send_status: "Pending"
                    
                },
                data: {
                    employee_send_status: "Rejected",
                    employee_responded_at: new Date()
                }
            })
            const canceledApplications = await this.prisma.jobApplication.findMany({
                where: {
                    employee_id: employee.id,
                    company_send_status: "Confirmed",
                    employee_send_status: "Rejected"
                },
                include: {
                    job_post: true
                }
            });

            await Promise.all(canceledApplications.map(async (cancel_application: any) =>{
                await this.prisma.notification.create({
                    data: {
                        message: "Sorry, I have to reject your offer. Thank you for your consideration and offer.",
                        employee_id: employee.id,
                        company_id: cancel_application.job_post.company_id,
                        application_id: cancel_application.id,
                        notification_status: "Rejected",
                        notification_type: "ConfirmationRejected"
                    },
                    include: {
                        application: true
                    }

                })
            }))
            const decrement_job_post = await this.prisma.jobPost.update({
                where:{
                    id: job_application.job_post.id
                },
                data: {
                    available_position: {
                        decrement: 1
                    }
                }
            })
            
            return  notification
            }
            else{
                throw new Error("This application, Company has not confirmed yet")
            }
        }
        else{
            throw new Error("You already have a job, you cannot confirm another job")
        }
    }
}
