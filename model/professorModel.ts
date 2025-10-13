export interface InputProfessorProfile{
    department: string;
    faculty: string;
    position : string | null;
    contactInfo: string | null;
    summary: string | null;
}

export interface EditProfessorProfile{
    first_name: string;
    last_name: string;
    department: string | null;
    faculty: string | null;
    position : string | null;
    contactInfo: string | null;
    summary: string | null;
}