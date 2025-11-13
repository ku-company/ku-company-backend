import type { jobPost } from "@prisma/client";

export interface JobPostingFeedDTO {
  id: number;
  job_title: string;
  location: string;
  work_place: string;
  verified: boolean;
  minimum_expected_salary: number;
  maximum_expected_salary: number;
  expired_at: Date | null;
  position: string;
  description: string;
  jobType: string;
  status: string;
  available_position: number;
  company_name: string | null;
  company_profile_image: string | null;
  company_location: string | null;
  company_tel: string | null;
  created_at: Date;
  updated_at: Date;
  posted_ago: string;
  company_id: number;
}

export interface companyInfoDTO {
    id: number;
    user_id: number;
    company_name: string | null;
    location: string | null;
    tel: string | null;
}

export type JobPostWithCompany = jobPost & { company: companyInfoDTO };