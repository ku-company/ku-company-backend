import type { PrismaClient } from "@prisma/client/extension";
import { PrismaDB } from "../helper/prismaSingleton.js";
import type { EditEmployeeProfile, InputEmployeeProfile } from "../model/employeeModel.js";
import { profile } from "console";

export class EmployeeRepository{

    private prisma: PrismaClient;

    constructor(){
        this.prisma = PrismaDB.getInstance();
    }

    async create_profile(req: any){
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

    async get_resumes(employee_id: number)  {
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
}
