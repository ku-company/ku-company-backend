import type { PrismaClient } from "@prisma/client/extension";
import { profile } from "console";

abstract class ProfileStrategy{
    constructor(protected prisma: PrismaClient){
        this.prisma = prisma
    }
    abstract get_profile(user_id: number): any


}


export class EmployeeProfile extends ProfileStrategy {

    async get_profile(user_id: number){
        const result = await this.prisma.employeeProfile.findUnique({
            where: {
                user_id: user_id
            }
        })
        return result
    }
}

export class Professor extends ProfileStrategy {

    async get_profile(user_id: number){
        const result = await this.prisma.professorProfile.findUnique({
            where: {
                user_id: user_id
            },
        })
        return result
    }
}

export class Company extends ProfileStrategy {

    async get_profile(user_id: number){
        const result = await this.prisma.companyProfile.findUnique({
            where: {
                user_id: user_id
            },
        })
        return result
    }
}

export class ProfileFactory{
    static set_strategy(role:string, prisma: PrismaClient): ProfileStrategy{
        switch(role){
            case "Student":
            case "Alumni":
                return new EmployeeProfile(prisma);
            case "Professor":
                return new Professor(prisma);
            case "Company":
                return new Company(prisma);
            default:
                throw new Error("Invalid role")
        }
    }
}