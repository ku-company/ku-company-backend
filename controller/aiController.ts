
import { AIService } from "../service/aiService.js";

export class AIController {

    private aiService: AIService;

    constructor(){
        this.aiService = new AIService();
    }

    async verify_user(req: any, res: any){
        try{
            const result = await this.aiService.verify_user(Number(req.params.id));
            res.status(200).json({
                message: "User verified successfully",
                data: result
            })
        }catch (error: any) {
            res.status(500).json({
                message: "Error verifying user",
                error: error.message
            })
        }
    }
}