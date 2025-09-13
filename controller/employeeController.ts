import { EmployeeService } from "../service/employeeService.js";

export class EmployeeController{

    private employeeService: EmployeeService

    constructor(){
        this.employeeService = new EmployeeService();
    }

    async get_employee_profile(req: any, res: any){
        try{
            const result = await this.employeeService.get_profile(req.params.id);
            res.status(200).json({
                message: "Profile retrieved successfully",
                data: result
            })
        }catch(error: any){
            res.status(400).json({
                message: error.message
            })
        }
    }

    async create_profile(req: any, res: any){
        try{
            const result = await this.employeeService.create_profile(req.body, req.user.id);
            res.status(201).json({
                message: "Profile created successfully",
                data: result
            })
        }catch(error:any){
            res.status(400).json({
                message: error.message
            })
        }
    }
}