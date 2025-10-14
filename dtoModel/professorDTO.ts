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

export interface ProfessorRepostDTO{
    content: string | null;
    is_connection: boolean;
}

export interface ProfessorAnnouncementDTO{
    content: string | null;
    is_connection: boolean;    
}