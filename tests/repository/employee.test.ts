/**
 * Repository tests for EmployeeRepository
 * We inject a mocked Prisma client into the repository instance to avoid real DB calls.
 */

import { jest } from "@jest/globals";

// Build a minimal mock Prisma with only the methods we exercise
const mockPrisma: any = {
  employeeProfile: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
  resume: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  jobApplication: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
    updateMany: jest.fn(),
    update: jest.fn(),
  },
  jobPost: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  notification: {
    create: jest.fn(),
  },
  jobApplicationBatch: {
    create: jest.fn(),
  },
};

import { EmployeeRepository } from "../../repository/employeeRepository.js";

beforeEach(() => {
  jest.clearAllMocks();
});

const makeRepo = () => {
  const repo = new EmployeeRepository();
  (repo as any).prisma = mockPrisma;
  return repo;
};

describe("EmployeeRepository - profile CRUD", () => {
  it("create_profile throws if profile exists", async () => {
    const repo = makeRepo();
    mockPrisma.employeeProfile.findUnique.mockResolvedValue({ id: 1 });
    await expect(
      repo.create_profile({ user: { id: 10 }, body: {} } as any),
    ).rejects.toThrow("Profile already exists");
    expect(mockPrisma.employeeProfile.create).not.toHaveBeenCalled();
  });

  it("create_profile creates and converts birthDate", async () => {
    const repo = makeRepo();
    mockPrisma.employeeProfile.findUnique.mockResolvedValue(null);
    const sample = { id: 2 };
    mockPrisma.employeeProfile.create.mockResolvedValue(sample);
    const req: any = {
      user: { id: 55 },
      body: { first_name: "A", birthDate: "2000-01-02" },
    };
    const out = await repo.create_profile(req);
    expect(out).toBe(sample);
    const args = mockPrisma.employeeProfile.create.mock.calls[0][0];
    expect(args.data.user.connect.id).toBe(55);
    expect(new Date(args.data.birthDate).toISOString()).toContain("2000-01-02");
  });

  it("get_profile finds by user_id with include user", async () => {
    const repo = makeRepo();
    mockPrisma.employeeProfile.findUnique.mockResolvedValue({ id: 1 });
    const out = await repo.get_profile(77);
    expect(out).toEqual({ id: 1 });
    expect(mockPrisma.employeeProfile.findUnique).toHaveBeenCalledWith({
      where: { user_id: 77 },
      include: { user: true },
    });
  });

  it("edit_profile updates and converts birthDate", async () => {
    const repo = makeRepo();
    const sample = { id: 3 };
    mockPrisma.employeeProfile.update.mockResolvedValue(sample);
    const out = await repo.edit_profile(12, {
      first_name: "B",
      birthDate: "1999-12-31",
    } as any);
    expect(out).toBe(sample);
    const args = mockPrisma.employeeProfile.update.mock.calls[0][0];
    expect(args.where).toEqual({ user_id: 12 });
    expect(new Date(args.data.birthDate).toISOString()).toContain("1999-12-31");
  });

  it("edit_profile wraps thrown errors", async () => {
    const repo = makeRepo();
    mockPrisma.employeeProfile.update.mockRejectedValue(new Error("boom"));
    await expect(
      repo.edit_profile(1, { first_name: "X" } as any),
    ).rejects.toThrow("Failure becauseboom");
  });
});

describe("EmployeeRepository - resumes", () => {
  it("upload_resume creates resume (default is_main=false) and with true", async () => {
    const repo = makeRepo();
    mockPrisma.resume.create.mockResolvedValue({});
    await repo.upload_resume(9, "key.pdf");
    expect(mockPrisma.resume.create).toHaveBeenCalledWith({
      data: { employee_id: 9, file_url: "key.pdf", is_main: false },
    });
    await repo.upload_resume(9, "key2.pdf", true);
    expect(mockPrisma.resume.create).toHaveBeenLastCalledWith({
      data: { employee_id: 9, file_url: "key2.pdf", is_main: true },
    });
  });

  it("get_resumes, resume_count call prisma correctly", async () => {
    const repo = makeRepo();
    mockPrisma.resume.findMany.mockResolvedValue([{ id: 1 }]);
    mockPrisma.resume.count.mockResolvedValue(5);
    const list = await repo.get_resumes(22);
    const cnt = await repo.resume_count(22);
    expect(list).toEqual([{ id: 1 }]);
    expect(cnt).toBe(5);
    expect(mockPrisma.resume.findMany).toHaveBeenCalledWith({
      where: { employee_id: 22 },
    });
    expect(mockPrisma.resume.count).toHaveBeenCalledWith({
      where: { employee_id: 22 },
    });
  });

  it("get/delete resume by id use composite where", async () => {
    const repo = makeRepo();
    mockPrisma.resume.findUnique.mockResolvedValue({ id: 2 });
    mockPrisma.resume.delete.mockResolvedValue({});
    await repo.get_resume_by_id(2, 33);
    expect(mockPrisma.resume.findUnique).toHaveBeenCalledWith({
      where: { id: 2, employee_id: 33 },
    });
    await repo.delete_resume_by_id(2, 33);
    expect(mockPrisma.resume.delete).toHaveBeenCalledWith({
      where: { id: 2, employee_id: 33 },
    });
  });

  it("delete_resumes_by_profile_id calls deleteMany", async () => {
    const repo = makeRepo();
    mockPrisma.resume.deleteMany.mockResolvedValue({});
    await repo.delete_resumes_by_profile_id(44);
    expect(mockPrisma.resume.deleteMany).toHaveBeenCalledWith({
      where: { employee_id: 44 },
    });
  });

  it("find_main_resume, set/unset_main_resume shape", async () => {
    const repo = makeRepo();
    mockPrisma.resume.findFirst.mockResolvedValue({ id: 7 });
    mockPrisma.resume.update.mockResolvedValue({ id: 7, is_main: true });
    const main = await repo.find_main_resume(55);
    expect(main).toEqual({ id: 7 });
    expect(mockPrisma.resume.findFirst).toHaveBeenCalledWith({
      where: { employee_id: 55, is_main: true },
    });
    await repo.set_main_resume(7, 55);
    expect(mockPrisma.resume.update).toHaveBeenCalledWith({
      where: { employee_id: 55, id: 7 },
      data: { is_main: true },
    });
    await repo.unset_main_resume(7, 55);
    expect(mockPrisma.resume.update).toHaveBeenLastCalledWith({
      where: { employee_id: 55, id: 7 },
      data: { is_main: false },
    });
  });
});

describe("EmployeeRepository - apply_to_individual_job", () => {
  it("throws when user already has a job", async () => {
    const repo = makeRepo();
    mockPrisma.employeeProfile.findUnique.mockResolvedValue({
      id: 1,
      has_job: true,
    });
    await expect(repo.apply_to_individual_job(1, 10, 5)).rejects.toThrow(
      "Failed to apply to job: You have already a job",
    );
  });

  it("throws when already applied", async () => {
    const repo = makeRepo();
    mockPrisma.employeeProfile.findUnique.mockResolvedValue({
      id: 2,
      has_job: false,
    });
    mockPrisma.jobApplication.findFirst.mockResolvedValue({ id: 99 });
    await expect(repo.apply_to_individual_job(1, 10, 5)).rejects.toThrow(
      "Failed to apply to job: Already applied to this job",
    );
  });

  it("throws when job not found or invalid status or no slots", async () => {
    const repo = makeRepo();
    mockPrisma.employeeProfile.findUnique.mockResolvedValue({
      id: 2,
      has_job: false,
    });
    mockPrisma.jobApplication.findFirst.mockResolvedValue(null);
    mockPrisma.jobPost.findUnique.mockResolvedValueOnce(null);
    await expect(repo.apply_to_individual_job(1, 10, 5)).rejects.toThrow(
      "Failed to apply to job: Job not found",
    );

    // invalid status
    mockPrisma.jobPost.findUnique.mockResolvedValueOnce({
      id: 1,
      status: "Closed",
      available_position: 1,
    });
    await expect(repo.apply_to_individual_job(1, 10, 5)).rejects.toThrow(
      "Failed to apply to job: This job cannot be applied to",
    );

    // no slots
    mockPrisma.jobPost.findUnique.mockResolvedValueOnce({
      id: 1,
      status: "Active",
      available_position: 0,
    });
    await expect(repo.apply_to_individual_job(1, 10, 5)).rejects.toThrow(
      "Failed to apply to job: no available positions",
    );
  });

  it("throws when resume missing or not found", async () => {
    const repo = makeRepo();
    mockPrisma.employeeProfile.findUnique.mockResolvedValue({
      id: 2,
      has_job: false,
    });
    mockPrisma.jobApplication.findFirst.mockResolvedValue(null);
    mockPrisma.jobPost.findUnique.mockResolvedValue({
      id: 1,
      status: "Active",
      available_position: 1,
    });

    await expect(repo.apply_to_individual_job(1, 10, 0 as any)).rejects.toThrow(
      "Failed to apply to job: Resume is required",
    );

    mockPrisma.resume.findUnique.mockResolvedValueOnce(null);
    await expect(repo.apply_to_individual_job(1, 10, 5)).rejects.toThrow(
      "Failed to apply to job: Resume not found",
    );
  });

  it("creates application when all checks pass", async () => {
    const repo = makeRepo();
    mockPrisma.employeeProfile.findUnique.mockResolvedValue({
      id: 2,
      has_job: false,
    });
    mockPrisma.jobApplication.findFirst.mockResolvedValue(null);
    mockPrisma.jobPost.findUnique.mockResolvedValue({
      id: 1,
      status: "Active",
      available_position: 3,
    });
    mockPrisma.resume.findUnique.mockResolvedValue({ id: 5, employee_id: 2 });
    const sample = { id: 100, job_post: { id: 1 } };
    mockPrisma.jobApplication.create.mockResolvedValue(sample);

    const out = await repo.apply_to_individual_job(1, 10, 5, 7);
    expect(out).toBe(sample);
    expect(mockPrisma.jobApplication.create).toHaveBeenCalledWith({
      data: { job_id: 1, employee_id: 2, resume_id: 5, batch_id: 7 },
      include: { job_post: true },
    });
  });
});

describe("EmployeeRepository - list/cancel applications", () => {
  it("list_own_resume errors when no profile or no resumes", async () => {
    const repo = makeRepo();
    mockPrisma.employeeProfile.findUnique.mockResolvedValueOnce(null);
    await expect(repo.list_own_resume(1)).rejects.toThrow(
      "Employee profile not found",
    );

    mockPrisma.employeeProfile.findUnique.mockResolvedValueOnce({ id: 3 });
    mockPrisma.resume.findMany.mockResolvedValueOnce([]);
    await expect(repo.list_own_resume(1)).rejects.toThrow("No resumes found");
  });

  it("cancel_application errors when owner or application missing, else deletes", async () => {
    const repo = makeRepo();
    mockPrisma.employeeProfile.findUnique.mockResolvedValueOnce(null);
    await expect(repo.cancel_application(1, 2)).rejects.toThrow(
      "Employee profile not found",
    );

    mockPrisma.employeeProfile.findUnique.mockResolvedValueOnce({ id: 9 });
    mockPrisma.jobApplication.findUnique.mockResolvedValueOnce(null);
    await expect(repo.cancel_application(1, 2)).rejects.toThrow(
      "Application not found",
    );

    const sample = { id: 2, job_post: { id: 10 } };
    mockPrisma.employeeProfile.findUnique.mockResolvedValueOnce({ id: 9 });
    mockPrisma.jobApplication.findUnique.mockResolvedValueOnce(sample);
    mockPrisma.jobApplication.delete.mockResolvedValueOnce(sample);
    const out = await repo.cancel_application(1, 2);
    expect(out).toBe(sample);
    expect(mockPrisma.jobApplication.delete).toHaveBeenCalledWith({
      where: { id: 2, employee_id: 9 },
      include: { job_post: true },
    });
  });

  it("list_all_applications errors when empty, else returns list", async () => {
    const repo = makeRepo();
    mockPrisma.employeeProfile.findUnique.mockResolvedValue({ id: 5 });
    mockPrisma.jobApplication.findMany.mockResolvedValueOnce([]);
    await expect(repo.list_all_applications(1)).rejects.toThrow(
      "No applications found",
    );

    mockPrisma.jobApplication.findMany.mockResolvedValueOnce([{ id: 1 }]);
    const out = await repo.list_all_applications(1);
    expect(out).toEqual([{ id: 1 }]);
    expect(mockPrisma.jobApplication.findMany).toHaveBeenLastCalledWith({
      where: { employee_id: 5 },
      include: {
        job_post: {
          include: {
            company: { select: { company_name: true, user_id: true } },
          },
        },
      },
    });
  });
});

describe("EmployeeRepository - batch apply and confirmation", () => {
  it("apply_job_checkout_list fails when profile missing or batch create fails or already applied", async () => {
    const repo = makeRepo();
    mockPrisma.employeeProfile.findUnique.mockResolvedValueOnce(null);
    await expect(repo.apply_job_checkout_list(1, 5, [10, 11])).rejects.toThrow(
      "Employee profile not found",
    );

    // profile ok but batch fails
    mockPrisma.employeeProfile.findUnique.mockResolvedValueOnce({ id: 8 });
    mockPrisma.jobApplicationBatch.create.mockResolvedValueOnce(null);
    await expect(repo.apply_job_checkout_list(1, 5, [10, 11])).rejects.toThrow(
      "Failed to create batch",
    );

    // already applied to one job
    mockPrisma.employeeProfile.findUnique.mockResolvedValueOnce({ id: 8 });
    mockPrisma.jobApplicationBatch.create.mockResolvedValueOnce({ id: 99 });
    mockPrisma.jobApplication.findFirst
      .mockResolvedValueOnce({ id: 1, job_post: { description: "A" } })
      .mockResolvedValueOnce(null);
    await expect(repo.apply_job_checkout_list(1, 5, [10, 11])).rejects.toThrow(
      /Already applied to these jobs: A/,
    );
  });

  it("apply_job_checkout_list calls apply_to_individual_job for each id", async () => {
    const repo = makeRepo();
    mockPrisma.employeeProfile.findUnique.mockResolvedValue({ id: 8 });
    mockPrisma.jobApplicationBatch.create.mockResolvedValue({ id: 50 });
    mockPrisma.jobApplication.findFirst.mockResolvedValue(null);
    const spy = jest
      .spyOn(repo as any, "apply_to_individual_job")
      .mockResolvedValue("ok" as any);
    const out = await repo.apply_job_checkout_list(1, 5, [10, 11, 12]);
    expect(out).toEqual(["ok", "ok", "ok"]);
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy).toHaveBeenNthCalledWith(1, 10, 1, 5, 50);
  });

  it("sent_the_confirmation_to_company: errors on not confirmed and already has job", async () => {
    const repo = makeRepo();
    mockPrisma.employeeProfile.findUnique.mockResolvedValueOnce({ id: 2 });
    mockPrisma.jobApplication.findUnique.mockResolvedValueOnce(null);
    await expect(repo.sent_the_confirmation_to_company(1, 2)).rejects.toThrow(
      "Job application not found",
    );

    // company not confirmed
    mockPrisma.employeeProfile.findUnique.mockResolvedValueOnce({
      id: 2,
      has_job: false,
    });
    mockPrisma.jobApplication.findUnique.mockResolvedValueOnce({
      id: 3,
      company_send_status: "Pending",
      job_post: { company_id: 9 },
    });
    await expect(repo.sent_the_confirmation_to_company(1, 2)).rejects.toThrow(
      "This application, Company has not confirmed yet",
    );

    // already has job
    mockPrisma.employeeProfile.findUnique.mockResolvedValueOnce({
      id: 2,
      has_job: true,
    });
    mockPrisma.jobApplication.findUnique.mockResolvedValueOnce({
      id: 3,
      company_send_status: "Confirmed",
      job_post: { company_id: 9 },
    });
    await expect(repo.sent_the_confirmation_to_company(1, 2)).rejects.toThrow(
      "You already have a job, you cannot confirm another job",
    );
  });

  it("sent_the_confirmation_to_company: success flow returns notification and updates related entities", async () => {
    const repo = makeRepo();
    mockPrisma.employeeProfile.findUnique.mockResolvedValue({
      id: 2,
      has_job: false,
    });
    mockPrisma.jobApplication.findUnique.mockResolvedValue({
      id: 3,
      company_send_status: "Confirmed",
      job_post: { id: 20, company_id: 9 },
    });
    const notification = { id: 77 };
    mockPrisma.jobApplication.update.mockResolvedValue({});
    mockPrisma.employeeProfile.update.mockResolvedValue({});
    mockPrisma.notification.create.mockResolvedValue(notification);
    mockPrisma.jobApplication.updateMany.mockResolvedValue({});
    mockPrisma.jobApplication.findMany.mockResolvedValue([
      { id: 30, job_post: { company_id: 1 } },
    ]);
    mockPrisma.jobPost.update.mockResolvedValue({});

    const out = await repo.sent_the_confirmation_to_company(1, 2);
    expect(out).toBe(notification);
    expect(mockPrisma.jobApplication.update).toHaveBeenCalledWith({
      where: { id: 2 },
      data: {
        employee_send_status: "Confirmed",
        employee_responded_at: expect.any(Date),
      },
    });
    expect(mockPrisma.employeeProfile.update).toHaveBeenCalledWith({
      where: { user_id: 1 },
      data: { has_job: true },
    });
    expect(mockPrisma.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        notification_status: "Accepted",
        notification_type: "ConfirmationAccepted",
        application_id: 2,
      }),
      include: { application: true },
    });
    expect(mockPrisma.jobPost.update).toHaveBeenCalledWith({
      where: { id: 20 },
      data: { available_position: { decrement: 1 } },
    });
  });
});
