import {JobType} from "./enums.js";

export function isJobType(val: any): val is JobType {
  return Object.values(JobType).includes(val as JobType);
}
