export enum JobType {
  FullTime = "FullTime",
  PartTime = "PartTime",
  Internship = "Internship",
  Contract = "Contract",
}

export enum Position {
  Backend_Developer = "Backend_Developer",
  Frontend_Developer = "Frontend_Developer",
  Fullstack_Developer = "Fullstack_Developer",
}

export interface CompanyJobPostingDTO {
  description: string;
  jobType: JobType;
  position: string;
  available_position: number;
}

export interface CompanyProfileDTO {
  user_id: number;
  company_name?: string | null;
  description?: string | null;
  industry?: string | null;
  tel?: string | null;
  location?: string | null;
  country?: string | null;
}