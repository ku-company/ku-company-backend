import jwt from "jsonwebtoken"


export class AuthService {

    constructor() {}
    
 
    async getCurrentUser(token: string){
        const SECRET_KEY = process.env.SECRET_KEY;
        if(!SECRET_KEY){
            throw new Error("Missing SECRET_KEY")
        }
        if(!token){
            throw new Error("Missing token")
        }
        try{
            const decoded = jwt.verify(token, SECRET_KEY) as jwt.JwtPayload;
            const payload = {
                id: decoded.id,
                user_name: decoded.user_name,
                email: decoded.email,
                role: decoded.role,
                verified: decoded.verified
            }
        
            return payload
        }catch(err){
            throw new Error("Invalid or expired token")
        }
    }
}