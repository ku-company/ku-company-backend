// education   String? @db.VarChar(255)
//   summary     String? @db.VarChar(255)
//   skills      String? @db.VarChar(255)
//   experience  String? @db.VarChar(255)
//   contactInfo String? @db.VarChar(255)
//   languages   String? @db.VarChar(255)
export interface InputEmployeeProfile{
    user_id: number;
    education: string | null;
    summary: string | null;
    skills: string | null;
    experience: string | null;
    contactInfo: string | null;
    languages: string | null;
    updated_at: Date
}

export interface EditEmployeeProfile{
    first_name: string;
    last_name: string;
    birthDate: Date | null;
    education: string | null;
    summary: string | null;
    skills: string | null;
    experience: string | null;
    contactInfo: string | null;
    languages: string | null;
}