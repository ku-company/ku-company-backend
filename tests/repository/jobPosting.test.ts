/**
 * Repository tests for JobPostingPublicRepository
 * Inject a mocked Prisma client to avoid real DB calls.
 */

import { jest } from "@jest/globals";
import { JobPostingPublicRepository } from "../../repository/jobPostingRepository.js";

const mockPrisma: any = {
  jobPost: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

const makeRepo = () => {
  const repo = new JobPostingPublicRepository();
  (repo as any).prisma = mockPrisma;
  return repo;
};

describe("JobPostingPublicRepository - get_all_job_postings", () => {
  it("returns postings with default filters and includes company", async () => {
    const repo = makeRepo();
    const sample = [{ id: 1 }];
    mockPrisma.jobPost.findMany.mockResolvedValueOnce(sample);
    const out = await repo.get_all_job_postings();
    expect(out).toBe(sample);
    expect(mockPrisma.jobPost.findMany).toHaveBeenCalledWith({
      where: {
        available_position: { gt: 0 },
        status: "Active",
      },
      orderBy: { updated_at: "desc" },
      include: {
        company: {
          select: {
            id: true,
            company_name: true,
            location: true,
            tel: true,
            user_id: true,
          },
        },
      },
    });
  });

  it("applies keyword filter across description, company_name, location, and position", async () => {
    const repo = makeRepo();
    mockPrisma.jobPost.findMany.mockResolvedValueOnce([]);
    const kw = "data";
    await repo.get_all_job_postings(kw);
    const args = mockPrisma.jobPost.findMany.mock.calls[0][0];
    expect(args.where.available_position).toEqual({ gt: 0 });
    expect(Array.isArray(args.where.OR)).toBe(true);
    expect(args.where.OR).toHaveLength(6);
    expect(args.where.OR[0]).toEqual({
      description: { contains: kw, mode: "insensitive" },
    });
    expect(args.where.OR[1]).toEqual({
      company: { is: { company_name: { contains: kw, mode: "insensitive" } } },
    });
    expect(args.where.OR[2]).toEqual({
      company: { is: { location: { contains: kw, mode: "insensitive" } } },
    });
    expect(args.where.OR[3]).toEqual({
      position: { contains: kw, mode: "insensitive" },
    });
    expect(args.where.OR[4]).toEqual({
      company: { is: { location: { contains: kw, mode: "insensitive" } } },
    });
    expect(args.where.OR[5]).toEqual({
      location: { contains: kw, mode: "insensitive" },
    });
  });

  it("applies category (position contains, case-insensitive) and jobType filters when provided", async () => {
    const repo = makeRepo();
    mockPrisma.jobPost.findMany.mockResolvedValueOnce([]);
    const category = "Developer";
    const jobType = "Internship";
    await repo.get_all_job_postings(undefined, category, jobType);
    const args = mockPrisma.jobPost.findMany.mock.calls[0][0];
    expect(args.where.position).toEqual({
      contains: category,
      mode: "insensitive",
    });
    expect(args.where.jobType).toBe(jobType);
  });

  it("does not add OR filter when keyword is empty string", async () => {
    const repo = makeRepo();
    mockPrisma.jobPost.findMany.mockResolvedValueOnce([]);
    await repo.get_all_job_postings("");
    const args = mockPrisma.jobPost.findMany.mock.calls[0][0];
    expect(args.where.available_position).toEqual({ gt: 0 });
    expect(args.where.OR).toBeUndefined();
  });
});

describe("JobPostingPublicRepository - get_job_posting_by_id", () => {
  it("finds job posting by id and includes company fields", async () => {
    const repo = makeRepo();
    const sample = { id: 42 };
    mockPrisma.jobPost.findUnique.mockResolvedValueOnce(sample);
    const out = await repo.get_job_posting_by_id(42);
    expect(out).toBe(sample);
    expect(mockPrisma.jobPost.findUnique).toHaveBeenCalledWith({
      where: { id: 42 },
      include: {
        company: {
          select: {
            id: true,
            company_name: true,
            location: true,
            tel: true,
            user_id: true,
          },
        },
      },
    });
  });
});
