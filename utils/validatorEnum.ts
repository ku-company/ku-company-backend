import {JobType, Position} from "./enums.js";

export function isJobType(val: any): val is JobType {
  return Object.values(JobType).includes(val as JobType);
}

export function isPosition(val: any): val is Position {
  return Object.values(Position).includes(val as Position);
}