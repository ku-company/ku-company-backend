import { EmployeeRepository } from "../repository/employeeRepository.js";
import { CompanyRepository } from "../repository/companyRepository.js";
import { ProfessorRepository } from "../repository/professorRepository.js";
import {makeFakeReq} from "./makeFakeReq.js";

const TO_BE_ADDED = "To be added";

class CreateProfileStrategy {
    private employeeRepository = new EmployeeRepository();
    private companyRepository = new CompanyRepository();
    private professorRepository = new ProfessorRepository();
    private static instance: CreateProfileStrategy;

    private constructor() {}

    public static getInstance(): CreateProfileStrategy {
        // Singleton
        if (!CreateProfileStrategy.instance) {
            CreateProfileStrategy.instance = new CreateProfileStrategy();
        }
        return CreateProfileStrategy.instance;
    }

    async create_user_profile(user_id: number, role: string) {
        if (!user_id || !role) {
            throw new Error("User ID and role are required to create a profile.");
        }

        switch (role) {
            case "Student":
            case "Alumni":
            await this.ensure_employee_profile(user_id);
            break;

            case "Company":
            await this.ensure_company_profile(user_id);
            break;

            case "Professor":
            await this.ensure_professor_profile(user_id);
            break;

            default:
            throw new Error(`Cannot create profile for unknown role: ${role}`);
        }
    }

    private async ensure_employee_profile(user_id: number) {
        const existing = await this.employeeRepository.get_profile(user_id);
        if (!existing) {
            await this.employeeRepository.create_profile(makeFakeReq(user_id, {}));
        }
    }

    private async ensure_company_profile(user_id: number) {
        const existing = await this.companyRepository.find_profile_by_user_id(user_id);
        if (!existing) {
            await this.companyRepository.create_company_profile({
            user_id,
            company_name: TO_BE_ADDED,
            description: TO_BE_ADDED,
            industry: TO_BE_ADDED,
            tel: TO_BE_ADDED,
            location: TO_BE_ADDED,
            country: TO_BE_ADDED
            });
        }
    }

    private async ensure_professor_profile(user_id: number) {
        const existing = await this.professorRepository.get_profile(user_id);
        if (!existing) {
            await this.professorRepository.create_profile(user_id, {
            department: TO_BE_ADDED,
            faculty: TO_BE_ADDED,
            position: TO_BE_ADDED,
            contactInfo: TO_BE_ADDED,
            summary: TO_BE_ADDED,
            });
        }
    }
}
export const createProfileStrategy = CreateProfileStrategy.getInstance();

