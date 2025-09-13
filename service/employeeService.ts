import { EmployeeRepository } from "../repository/employeeRepository.js"
import type { InputEmployeeProfile } from "../model/employeeModel.js";
export class EmployeeService{

    private employeeRepository: EmployeeRepository

    constructor(){
        this.employeeRepository = new EmployeeRepository();
    }

    async create_profile(input: InputEmployeeProfile, user_id: number){
        input.user_id = user_id
        return await this.employeeRepository.create_profile(input)

    }

    async get_profile(profile_id: number){
        profile_id = Number(profile_id)
        return await this.employeeRepository.get_profile(profile_id)
    }

    

}