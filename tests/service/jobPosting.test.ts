import { jest } from "@jest/globals";
import { JobPostingService } from "../../service/jobPostingService.js";

const makeSvc = () => {
  const svc = new JobPostingService();
  (svc as any).jobPostingRepository = {
    get_all_job_postings: jest.fn(),
    get_job_posting_by_id: jest.fn(),
  };
  (svc as any).userService = {
    get_profile_image: jest.fn(),
  };
  return svc as any;
};

describe("JobPostingService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("get_all_job_postings transforms jobs to feed DTO and calls get_profile_image", async () => {
    const svc = makeSvc();
    const now = new Date("2025-10-26T12:00:00Z");
    jest.spyOn(Date, "now").mockReturnValue(now.getTime());

    const jobs = [
      {
        id: 1,
        position: "Developer",
        description: "Build stuff",
        jobType: "FullTime",
        available_position: 2,
        company: {
          company_name: "Acme",
          location: "BKK",
          tel: "123",
          user_id: 10,
        },
        created_at: new Date(now.getTime() - 86400000), // 1 day ago
        updated_at: new Date(now.getTime() - 3600000),
      },
      {
        id: 2,
        position: "Designer",
        description: "Design stuff",
        jobType: "Internship",
        available_position: 1,
        company: {
          company_name: "Globex",
          location: "CNX",
          tel: "555",
          user_id: 11,
        },
        created_at: new Date(now.getTime()), // today
        updated_at: new Date(now.getTime()),
      },
    ];

    (
      svc as any
    ).jobPostingRepository.get_all_job_postings.mockResolvedValueOnce(jobs);
    (svc as any).userService.get_profile_image
      .mockResolvedValueOnce("img-10")
      .mockResolvedValueOnce("img-11");

    const out = await svc.get_all_job_postings("kw", "Developer", "Internship");
    expect(out).toHaveLength(2);
    expect(
      (svc as any).jobPostingRepository.get_all_job_postings,
    ).toHaveBeenCalledWith("kw", "Developer", "Internship", undefined);

    // first item
    expect(out[0]).toMatchObject({
      id: 1,
      position: "Developer",
      description: "Build stuff",
      jobType: "FullTime",
      available_position: 2,
      company_name: "Acme",
      company_profile_image: "img-10",
      company_location: "BKK",
      company_tel: "123",
      posted_ago: "1 day ago",
    });
    // second item
    expect(out[1]).toMatchObject({
      id: 2,
      position: "Designer",
      description: "Design stuff",
      jobType: "Internship",
      available_position: 1,
      company_name: "Globex",
      company_profile_image: "img-11",
      company_location: "CNX",
      company_tel: "555",
      posted_ago: "today",
    });
  });

  it("get_job_posting_by_id returns null when not found", async () => {
    const svc = makeSvc();
    (
      svc as any
    ).jobPostingRepository.get_job_posting_by_id.mockResolvedValueOnce(null);
    const out = await svc.get_job_posting_by_id(99);
    expect(out).toBeNull();
  });

  it("get_job_posting_by_id transforms item and calls get_profile_image", async () => {
    const svc = makeSvc();
    const now = new Date("2025-10-26T12:00:00Z");
    jest.spyOn(Date, "now").mockReturnValue(now.getTime());

    const item = {
      id: 3,
      position: "QA",
      description: "Test stuff",
      jobType: "Contract",
      available_position: 5,
      company: {
        company_name: "Initech",
        location: "BKK",
        tel: "777",
        user_id: 20,
      },
      created_at: new Date(now.getTime() - 3 * 86400000), // 3 days ago
      updated_at: new Date(now.getTime()),
    } as any;
    (
      svc as any
    ).jobPostingRepository.get_job_posting_by_id.mockResolvedValueOnce(item);
    (svc as any).userService.get_profile_image.mockResolvedValueOnce("img-20");

    const out = await svc.get_job_posting_by_id(3);
    expect(out).toMatchObject({
      id: 3,
      position: "QA",
      description: "Test stuff",
      jobType: "Contract",
      available_position: 5,
      company_name: "Initech",
      company_profile_image: "img-20",
      company_location: "BKK",
      company_tel: "777",
      posted_ago: "3 days ago",
    });
    expect((svc as any).userService.get_profile_image).toHaveBeenCalledWith(20);
  });
});
