import { JobPostStatus, JobType } from "../utils/enums.js";

export enum WorkPlace {
  OnSite = "On-Site",
  Online = "Online",
  Hybrid = "Hybrid"
}

export interface CompanyJobPostingDTO {
  job_title: string;
  location: string;
  status: JobPostStatus;
  work_place: WorkPlace;
  minimum_expected_salary: number;
  maximum_expected_salary: number;
  expired_at?: Date | null;
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
