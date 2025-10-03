import type { PrismaClient } from "@prisma/client/extension";
import { PrismaDB } from "../helper/prismaSingleton.js";
import type { EditEmployeeProfile, InputEmployeeProfile } from "../model/employeeModel.js";
import { profile } from "console";

export class EmployeeRepository{

    private prisma: PrismaClient;

    constructor(){
        this.prisma = PrismaDB.getInstance();
    }

    async create_profile(input: InputEmployeeProfile){
        return await this.prisma.employeeProfile.create({
            data: {
                education: input.education,
                summary: input.summary,
                skills: input.skills,
                experience: input.experience,
                contactInfo: input.contactInfo,
                languages: input.languages,
                updated_at: new Date(),
                user: {
                    connect: {
                        id: input.user_id
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
    
}
