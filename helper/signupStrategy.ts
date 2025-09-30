import type { UserDB } from "../model/userModel.js";
import type { UserDTO } from "../dtoModel/userDTO.js";
import type { UserRepository } from "../repository/userRepository.js";
import type { sign_up_input } from "../model/userModel.js";
import bcrypt from "bcryptjs";
import type { UserCompanyDTO } from "../dtoModel/userDTO.js";

export abstract class SignUpStrategy{

    async create_user(userRepository: UserRepository, input: sign_up_input){
        const userData: UserDB = await userRepository.create_user({
                first_name: input.first_name,
                last_name: input.last_name,
                company_name: input.company_name ?? null,
                user_name: input.user_name || null,
                email: input.email,
                password_hash: await bcrypt.hash(input.password, 10),
                role: input.role,
                verified: false,
                profile_image: null,
            })
        return userData

    }

    abstract sign_up(userData: UserDB): any;
}


class EmployeeSignUpStrategy extends SignUpStrategy{
    async sign_up(userData :UserDB) {
        let response_user: UserDTO = {
                first_name: userData.first_name!,
                last_name: userData.last_name!,
                full_name: `${userData.first_name} ${userData.last_name}`,
                email: userData.email,
                role: userData.role ,
                verified: userData.verified,
                profile_image: userData.profile_image,
                employee_profile: userData.employeeProfile ?? null,
            }
        return response_user
    }
}

class EmployerSignUpStrategy extends SignUpStrategy{
    async sign_up(userData :UserDB) {
        let response_user: UserCompanyDTO = {
                company_name: userData.company_name!,
                email: userData.email,
                role: userData.role ,
                verified: userData.verified,
                profile_image: userData.profile_image,
                company_profile: userData.companyProfile ?? null,
            }
        return response_user
    }
}


export class SignUpStrategyFactory {

    static setStrategy(role: string) {
        switch (role) {
            case "Student":
            case "Alumni":
            case "Admin":
        return new EmployeeSignUpStrategy();
        case "Company":
            return new EmployerSignUpStrategy();
        default:
            throw new Error("Invalid role");
        }
    }
}
