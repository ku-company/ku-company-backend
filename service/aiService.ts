import { AIRepository } from "../repository/aiRepository.js";

export class AIService {

    private aiRepository: AIRepository
    

    constructor(){
        this.aiRepository = new AIRepository();
    }

    async verify_user(user_id: number){
        return await this.aiRepository.verify_user_by_ai(user_id);
    }
}