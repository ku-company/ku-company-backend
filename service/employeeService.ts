import { EmployeeRepository } from "../repository/employeeRepository.js"
import type { EditEmployeeProfile, InputEmployeeProfile } from "../model/employeeModel.js";
import { Result } from "pg";
export class EmployeeService{

    private employeeRepository: EmployeeRepository

    constructor(){
        this.employeeRepository = new EmployeeRepository();
    }

    is_valid_profile(req_id: number, params_id: number, req: any){
        if(req_id !== params_id && req.user.role !== "Admin"){
            throw new Error("Unauthorized access to profile");
        }
        return true;
    }

    async create_profile(req: any){
        return await this.employeeRepository.create_profile(req) 
      }

    async get_profile(req: any){
        const req_id = Number(req.params.id)
        const is_valid = this.is_valid_profile(req_id, req.user.id, req);
        if(is_valid){
            const result = await this.employeeRepository.get_profile(req.user.id)
            if(!result){
                throw new Error("Profile not found")
            }
            return result
        }
    }

    async delete_profile(req: any){
        const req_id = Number(req.params.id)
        const is_valid = this.is_valid_profile(req_id, req.user.id, req);
        if(is_valid){
            return await this.employeeRepository.delete_profile(req.user.id)
        }
    }

    async edit_profile(req: any, input: EditEmployeeProfile){
        const req_id = Number(req.params.id)
        const is_valid = this.is_valid_profile(req_id, req.user.id, req);
        if(is_valid){
            return await this.employeeRepository.edit_profile(req.user.id, input)
        }
    }
}