import { UserRepository } from "../repository/userRepository.js"
import type { sign_up_input, UserDB, Login } from "../model/userModel.js";
import type { UserDTO, LoginResponse, RefreshTokenRequest } from "../dtoModel/userDTO.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"


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

    async login(input: Login){
        const is_valid = await this.userRepository.is_valid_user(input.user_name, input.password);
        if(!is_valid){
            throw new Error("Invalid username or password")
        }
        const user = await this.userRepository.get_user_by_userName(input.user_name);
        const payload = {
            id: user.id,
            user_name: user.user_name,
            email: user.email,
            roles: user.roles
        }
        const SECRET_KEY= process.env.SECRET_KEY;
        const REFRESH_KEY = process.env.REFRESH_KEY;
        if(!SECRET_KEY){
            throw new Error("Missing SECRET_KEY")
        }
        if(!REFRESH_KEY){
            throw new Error("Missing REFRESH_KEY")
        }
        const access_token = jwt.sign(payload, SECRET_KEY, {expiresIn: "15m"});
        const refresh_token = jwt.sign(payload, REFRESH_KEY, {expiresIn: "7d"});

        const response: LoginResponse = {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user_name": user.user_name || "",
            "roles": user.roles,
            "email": user.email
        }
        return response
    }

    async refresh_token(token: string){
        const REFRESH_KEY = process.env.REFRESH_KEY;
        if(!REFRESH_KEY){
            throw new Error("Missing REFRESH_KEY")
        }
        try{
            const decoded = jwt.verify(token, REFRESH_KEY) as jwt.JwtPayload;
            const payload = {
                id: decoded.id,
                user_name: decoded.user_name,
                email: decoded.email,
                roles: decoded.roles
            }
            const SECRET_KEY= process.env.SECRET_KEY;
            if(!SECRET_KEY){
                throw new Error("Missing SECRET_KEY")
            }
            const access_token = jwt.sign(payload, SECRET_KEY, {expiresIn: "15m"});
            const response = {
                "access_token": access_token
            }
            return response
        }catch(err){
            throw new Error("Invalid refresh token")
        }
    }

}