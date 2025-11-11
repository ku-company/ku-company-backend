import type { PrismaClient } from "@prisma/client/extension";
import { PrismaDB } from "../helper/prismaSingleton.js";
import { GoogleGenAI } from "@google/genai";
import json from "json5"
import { encodeForJSString, truncateSafe, validateExternalUrl } from "../utils/security.js";
import dotenv from 'dotenv';
dotenv.config();

export class AIRepository {

    private prisma: PrismaClient;

    constructor() {
        this.prisma = PrismaDB.getInstance();
    }

    async find_profile(user_id: number){
        const user = await this.prisma.user.findUnique({
            where: {
                id: user_id
            }
        })
        if(!user){
            throw new Error("User not found")
        }
        user.profile = null;
        if(user.role === "Student" || user.role === "Alumni"){
            user.profile = await this.prisma.employeeProfile.findUnique({
                where: {
                    user_id: user_id
                }
            })
        }
        else if(user.role === "Company"){
            user.profile = await this.prisma.companyProfile.findUnique({
                where: {
                    user_id: user_id
                }
            })
        }
        else if(user.role === "Professor"){
            user.profile = await this.prisma.professorProfile.findUnique({
                where: {
                    user_id: user_id
                }
            })
        }
        return user.profile;
    }

    async verify_company(user_id: number){
        const company = await this.prisma.companyProfile.findUnique({
            where: {
                user_id: user_id
            }
        })

        if(!company){
            console.log("Company profile not found")
        }
        const user = await this.prisma.user.findUnique({
            where: {
                id: user_id
            }
        })
        
    const company_name = company?.company_name ?? user.company_name ?? user.user_name ?? "";
    const company_country = company?.country ?? "Unknown";
    const safeName = encodeForJSString(truncateSafe(company_name));
    const safeCountry = encodeForJSString(truncateSafe(company_country));
        const prompt = `
                You are an AI identity verifier.
                Check if this entity is real and trustworthy based on online presence.
                Return a valid JSON object with the following structure:
                {
                    "trust_level": "High" | "Medium" | "Low",
                    "reason": "explanation",
                    "evidence_url": "most relevant link"
                }
                Entity Name: '${safeName}'
                Country: '${safeCountry}'
                Data: ${JSON.stringify(company)}
                `;
        const response = await this.gen_ai(prompt);
        return response
    }

    async verify_employee(user_id: number){
        const user = await this.prisma.user.findUnique({
            where : {
                id: user_id
            }
        })
        if(!user){
            throw new Error("User not found")
        }
    const safeStd = encodeForJSString(truncateSafe(user.stdId || ""));
    const safeEmail = encodeForJSString(truncateSafe(user.email || ""));
    const prompt = `
                You are an AI identity verifier.
                Check if this user is real and trustworthy based on the below rule.
                if StudentID has 1054 at digits 3,4,5,6 and start with last two digits of from current BE, and the last two digit is must be below BE current year for exmaple (BE 2568) studentID is 6610545243 then is it valid because 66 < 68 but if 69 is invalid because 69 > 68 in last two digits for exmaple if the current year BE is 2569, then the valid number should be below or eqaul to 69, for example valid StudentID 6610545243.
                and email must be a valid @ku.th email address.
                Return a valid JSON object with the following structure:
                {
                    "trust_level": "High" | "Medium" | "Low",
                    "reason": "explanation",
                }
                StudentID: '${safeStd}'
                email: '${safeEmail}'
                Data: ${JSON.stringify(user)}
                `
                ;
        const response = await this.gen_ai(prompt);
        return response
    }

    async verify_professor(user_id: number){
        const user = await this.prisma.user.findUnique({
            where : {
                id: user_id
            }
        })
        if(!user){
            throw new Error("User not found")
        }
    const safeEmail2 = encodeForJSString(truncateSafe(user.email || ""));
    const safeFirst = encodeForJSString(truncateSafe(user.first_name || ""));
    const safeLast = encodeForJSString(truncateSafe(user.last_name || ""));
    const prompt = `
                You are an AI identity verifier.
                Check if this user is real and trustworthy based on the below rule.
                if email must be a valid @ku.th email address, and the last of email should be ku.ac.th or ku.th for example win@ku.th, win@.ku.ac.th
                and professor might be know in the online presence such as google scholar, researchgate, or university website.
                Return a valid JSON object with the following structure:
                {
                    "trust_level": "High" | "Medium" | "Low",
                    "reason": "explanation",
                    "evidence_url": "most relevant link
                }
                email: '${safeEmail2}'
                first_name: '${safeFirst}'
                last_name: '${safeLast}'
                Data: ${JSON.stringify(user)}
                `
                ;
        const response = await this.gen_ai(prompt);
        return response
    }

    async update_verify_status(user_id: number, trust_level: string, reason: string, evidence_url?: string){
        const user = await this.prisma.user.findUnique({
            where: {
                id: user_id
            }
        })
        if(!user){
            throw new Error("User not found")
        }
        if(user.verified === true && user.status === "Approved" || user.status === "Rejected"){
            throw new Error("User already verified")
        }
        try {
            let safeEvidence: string | null = null;
            if (evidence_url) {
                try {
                    // Allowlist known domains only; fallback to null when invalid
                    const allow = [
                        "ku.th",
                        "ku.ac.th",
                        "google.com",
                        "scholar.google.com",
                        "researchgate.net",
                        "linkedin.com"
                    ];
                    safeEvidence = validateExternalUrl(evidence_url, allow);
                } catch {
                    safeEvidence = null;
                }
            }
            const create_ai_verification = await this.prisma.aiVerification.create({
                data: {
                    user_id: user_id,
                    verified_by: "Gemini Flash 2.5",
                    trust_level: trust_level,
                    reason: reason,
                    evidence_url: safeEvidence,
                    created_at: new Date()
                },
                include: {
                    user: true
                }
            })
        } catch (error) {
            console.log(error)
            throw new Error("Failed to create AI verification record")
        }
        if(trust_level === "High" || trust_level === "Medium"){
            console.log("WIN")
            const update_user = await this.prisma.user.update({
            where: {
                id: user_id
            },
            data: {
                verified: true,
                status: "Approved",
                updated_at: new Date()
            },
            include: {
                ai_verification: true
            }
            })
            return update_user
        }
        else{
            const update_user = await this.prisma.user.update({
            where: {
                id: user_id
            },
            data: {
                verified: false,
                status: "Rejected",
                updated_at: new Date()
            },
            include: {
                ai_verification :true
            }
            })
            return update_user
        }
    }
    

    async gen_ai(prompt: string){
    // Never log secrets
        const googleGenAI = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY ?? ''
        })

        const response = await googleGenAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        })
  
        if(!response.text){
            throw new Error("No response from AI model")
        }
   
        let cleanResponse = response.text.trim(); 
        cleanResponse = cleanResponse.replace(/```json|```/g, "");

        try {
            const parsedResponse = json.parse(cleanResponse);
            return parsedResponse
        } catch (error) {
            console.error("Failed to parse AI response:", error);
            throw new Error("Invalid AI response format");
        }
    }



    async verify_user_by_ai(user_id: number){
        const user = await this.prisma.user.findUnique({
            where: {
                id: user_id
            },
            include: {
                employeeProfile: true,
                companyProfile: true,
                professorProfile: true
            }
        })
        if(!user){
            throw new Error("User not found")
        }
        if(user.role === "Company"){
            const response =  await this.verify_company(user_id);
            const ai_verification = await this.update_verify_status(user_id, response.trust_level, response.reason, response.evidence_url);
            return ai_verification;
        }
        else if(user.role === "Student" || user.role === "Alumni"){
            const response = await this.verify_employee(user_id);
            const ai_verification = await this.update_verify_status(user_id, response.trust_level, response.reason, response.evidence_url);
            return ai_verification;
        }
        else if(user.role === "Professor"){
            const response = await this.verify_professor(user_id);
            const ai_verification = await this.update_verify_status(user_id, response.trust_level, response.reason, response.evidence_url);
            return ai_verification;
        }
        throw new Error("Role not supported for AI verification")
        
    }
}