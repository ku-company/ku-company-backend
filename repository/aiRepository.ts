import type { PrismaClient } from "@prisma/client/extension";
import { PrismaDB } from "../helper/prismaSingleton.js";
import { GoogleGenAI } from "@google/genai";
import json from "json5"
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

    async verify_company(company_id: number){
        const company = await this.prisma.companyProfile.findUnique({
            where: {
                id: company_id
            }
        })
        if(!company){
            throw new Error("Company not found")
        }
        console.log("Company", company)
        const company_name = company.company_name
        const prompt = `
                You are an AI identity verifier.
                Check if this entity is real and trustworthy based on online presence.
                Return a valid JSON object with the following structure:
                {
                    "trust_level": "High" | "Medium" | "Low",
                    "reason": "explanation",
                    "evidence_url": "most relevant link"
                }
                Entity Name: ${company_name}
                Data: ${JSON.stringify(company)}
                `;
        const response = await this.gen_ai(prompt);
        return response
    }

    async verify_employee(employee_id: number){
        const employee = await this.prisma.employeeProfile.findUnique({
            where: {
                id: employee_id
            }
        })
        if(!employee){
            throw new Error("Employee not found")
        }
    }

    async gen_ai(prompt: string){
        console.log(process.env.Gemini_API_KEY)
        const googleGenAI = new GoogleGenAI({
            apiKey: process.env.Gemini_API_KEY ?? ''
        })

        const response = await googleGenAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        })
  
        if(!response.text){
            throw new Error("No response from AI model")
        }
        console.log(response.text)
        let cleanResponse = response.text.trim(); 
        cleanResponse = cleanResponse.replace(/```json|```/g, "");

        console.log(cleanResponse)


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
        const profile = await this.find_profile(user_id);
        if(!profile){
            throw new Error("Profile not found")
        }
        if(user.role === "Company" && user.companyProfile){
            return await this.verify_company(user.companyProfile.id);
        }
    
    }
}