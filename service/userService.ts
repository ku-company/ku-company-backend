import { UserRepository } from "../repository/userRepository.js"
import type { sign_up_input, UserDB, Login } from "../model/userModel.js";
import type { UserDTO } from "../dtoModel/userDTO.js";
import bcrypt from "bcryptjs";


export class UserService {
    
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository()

    }
    
    async sign_up(input: sign_up_input){
        if(input.password !== input.confirm_password){
            throw new Error("Password and Confirm password do not match")   
        }
        if(input.email.length < 5 || !input.email.includes("@")){
            throw new Error("Invalid email")
        }

        const userData: UserDB = await this.userRepository.create_user({
            first_name: input.first_name,
            last_name: input.last_name,
            user_name: input.user_name || null,
            email: input.email,
            password_hash: await bcrypt.hash(input.password, 10),
            roles: input.role,
            verified: false,
            profile_image: null,
        })

        const response_user: UserDTO = {
            first_name: userData.first_name,
            last_name: userData.last_name,
            full_name: `${userData.first_name} ${userData.last_name}`,
            email: userData.email,
            roles: userData.roles ,
            verified: userData.verified,
            profile_image: userData.profile_image
        }

        return response_user
    }

}