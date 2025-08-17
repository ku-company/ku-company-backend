import type { FindJob } from "../model/mock_model.js";
import type { Request, Response } from "express";
export class MockController {
    constructor(){}

    async mockdata_findjob(req: Request, res: Response){
        const jobs: FindJob[] = [
    {
    id: "1",
    position: "Machine Learning Engineer",
    company: "Siam Commercial Bank Public Co., Ltd.",
    location: "Bangkok (Hybrid)",
    type: "Full-time",
    logo: "https://upload.wikimedia.org/wikipedia/commons/3/33/SCB_Logo.png",
    posteddayagos: 11,
    description: "Design & Deploy ML Systems, MLOps Setup & Optimization, Collaborative Work, Best Practices & Scalability."
    },
    {
    id: "2",
    position: "Full Stack Developer",
    company: "30 SECONDSTOFLY (THAILAND) CO., LTD.",
    location: "Phra Khanong, Bangkok (Hybrid)",
    type: "Full-time",
    logo: "https://example.com/logo2.png",
    posteddayagos: 24,
    description: "Hybrid Working Environment, Challenging tasks, Competitive Salary & Benefits"
    },
    {
    id: "3",
    position: "Full Stack Developer",
    company: "PRIME SELECTION (THAILAND)",
    location: "Bangkok (Hybrid)",
    type: "Full-time",
    logo: null,
    posteddayagos: 30,
    description: "Hybrid Working Environment, Challenging tasks"
    }
    ];
    res.status(200).json(jobs);

        
    }
}