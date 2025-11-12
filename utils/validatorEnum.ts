import {JobType, JobPostStatus} from "./enums.js";

export function isJobType(val: any): val is JobType {
  return Object.values(JobType).includes(val as JobType);
}

export function isJobPostStatus(val: any): val is JobPostStatus {
  return Object.values(JobPostStatus).includes(val as JobPostStatus);
}