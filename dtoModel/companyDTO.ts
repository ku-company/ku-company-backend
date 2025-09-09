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
  position: Position;
  available_position: number;
}