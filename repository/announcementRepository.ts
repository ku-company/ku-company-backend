import type { PrismaClient } from "@prisma/client/extension";
import { PrismaDB } from "../helper/prismaSingleton.js";

export class AnnouncementRepository{

    private prisma: PrismaClient;

    constructor(){
        this.prisma = PrismaDB.getInstance();
    }

    async get_post_by_id(announcement_id: number){
        // get Announcement by id of all type (repost, announcement, opinion)
        return await this.prisma.announcement.findFirst({
            where: {
                id: announcement_id,
            },
            include: {
                job_post: true,
            }
        })
    }

    async get_all_posts(){
        return await this.prisma.announcement.findMany({
            orderBy: {
                created_at: 'desc'
            },
            include: {
                job_post: true,
            }
        })
    }
}
