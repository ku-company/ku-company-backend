import { AnnouncementType } from "../utils/enums.js";
export interface InputProfessorProfileDTO{
    department: string;
    faculty: string;
    position : string | null;
    contactInfo: string | null;
    summary: string | null;
}

export interface EditProfessorProfileDTO{
    first_name: string;
    last_name: string;
    department: string | null;
    faculty: string | null;
    position : string | null;
    contactInfo: string | null;
    summary: string | null;
}

export interface ProfessorEditAnnouncementDTO{
    content: string | null; // given from req.body
    is_connection: boolean; // given from req.body
    type_post: AnnouncementType;
}

export interface ProfessorAnnouncementDTO{
    // for creating announcement/repost
    content: string | null;
    is_connection: boolean;  
    type_post: AnnouncementType;
    job_id: number | null;
}

export interface ProfessorCreateInputDTO{
    content: string | null;
    is_connection: boolean;  
}