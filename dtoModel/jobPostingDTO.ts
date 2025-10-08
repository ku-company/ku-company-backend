import type { jobPost } from "@prisma/client";

export interface JobPostingFeedDTO {
  id: number;
  position: string;
  description: string;
  jobType: string;
  available_position: number;
  company_name: string;
  company_profile_image: string | null;
  company_location: string;
  company_tel: string;
  created_at: Date;
  updated_at: Date;
  posted_ago: string;
}

export interface companyInfoDTO {
    user_id: number;
    company_name: string;
    location: string;
    tel: string;
}

export type JobPostWithCompany = jobPost & { company: companyInfoDTO };