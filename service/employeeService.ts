import { EmployeeRepository } from "../repository/employeeRepository.js"
import type { EditEmployeeProfile, InputEmployeeProfile } from "../model/employeeModel.js";
import { Result } from "pg";
export class EmployeeService{

    private employeeRepository: EmployeeRepository

    constructor(){
        this.employeeRepository = new EmployeeRepository();
    }


    async create_profile(req: any){
        const user = await this.employeeRepository.get_profile(req.user.id)
        if(user){
            throw new Error("Profile already exists");
        }
        return await this.employeeRepository.create_profile(req) 
      }

    async get_profile(req: any){
            const result = await this.employeeRepository.get_profile(req.user.id)
            if(!result){
                throw new Error("Profile not found")
            }
            return result
        }
    

    async delete_profile(req: any){
            const result = await this.employeeRepository.delete_profile(req.user.id)
            if(!result){
                throw new Error("Profile not found")
            }
            return result
        
    }

    async edit_profile(req: any, input: EditEmployeeProfile){
        return await this.employeeRepository.edit_profile(req.user.id, input)
        
    }

    async apply_to_individual_job(job_id: number, user_id: number, resume_id: number){
        const job_id_num = Number(job_id)
        return await this.employeeRepository.apply_to_individual_job(job_id_num, user_id, resume_id)
    }

    async get_all_resumes(user_id: number){
        return await this.employeeRepository.list_own_resume(user_id)
    }

    async cancel_application(user_id: number, application_id: number){
        const job_id_num = Number(application_id)
        return await this.employeeRepository.cancel_application(user_id, job_id_num)
    }

    async list_all_applications(user_id: number){
        return await this.employeeRepository.list_all_applications(user_id)
    } 
}