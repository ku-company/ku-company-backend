import type { PrismaClient } from "@prisma/client/extension";
import { profile } from "console";
import { UserService } from "../service/userService.js";

abstract class ProfileStrategy{
    protected userService: UserService;
    constructor(protected prisma: PrismaClient){
        this.prisma = prisma
        this.userService = new UserService()
    }
    abstract get_profile(user_id: number): any


}


export class EmployeeProfile extends ProfileStrategy {

    async get_profile(user_id: number){
        const result = await this.prisma.employeeProfile.findUnique({
            where: {
                user_id: user_id
            },
            include: {
                user: {
                    select: {
                        role: true,
                        first_name: true,
                        last_name: true,
                        user_name: true,
                        verified: true,
                        email: true,
                        profile_image: true
                    }
                }
            }
        })
        result.user.profile_image = await this.userService.get_profile_image(user_id)
        return result
    }
}

export class Professor extends ProfileStrategy {

    async get_profile(user_id: number){
        const result = await this.prisma.professorProfile.findUnique({
            where: {
                user_id: user_id
            },
            include: {
                user: {
                    select: {
                        role: true,
                        first_name: true,
                        last_name: true,
                        user_name: true,
                        verified: true,
                        email: true,
                        profile_image: true
                    }
                },
                degrees: true
            }
        })
        result.user.profile_image = await this.userService.get_profile_image(user_id)
        return result
    }
}

export class Company extends ProfileStrategy {

    async get_profile(user_id: number){
        const result = await this.prisma.companyProfile.findUnique({
            where: {
                user_id: user_id
            },
            include: {
                comments: {
                    orderBy: { 
                        created_at: "desc"
                    }
                },
                user: {
                    select: {
                        role: true,
                        user_name: true,
                        verified: true,
                        email: true,
                        profile_image: true
                    }
                }
            }
        })
        result.user.profile_image = await this.userService.get_profile_image(user_id)
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