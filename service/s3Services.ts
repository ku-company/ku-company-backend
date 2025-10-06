import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { S3KeyStrategy } from "../helper/s3KeyStrategy.js";

const BUCKET_REGION = process.env.BUCKET_REGION || "";
const ACCESS_KEY = process.env.ACCESS_KEY || "";
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY || "";

const s3Client = new S3Client({
  region: BUCKET_REGION,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

export class S3Service {
  constructor(private bucketName: string, private keyStrategy: S3KeyStrategy) {
    this.bucketName = bucketName;
    this.keyStrategy = keyStrategy;
  }

    async uploadFile(file: { buffer: Buffer; mimetype: string; originalname: string }, context?: Record<string, any>) {
        const key = this.keyStrategy.generateKey(file.originalname, context);

        const params = {
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype, // validated mime
      };
        const command = new PutObjectCommand(params);
        await s3Client.send(command);
        return { key };
    }

    async getFileUrl(key: string) {
        const params = {
            Bucket: this.bucketName,
            Key: key,
        };
        const command = new GetObjectCommand(params);
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL valid for 1 hour
        return url;
    }

    async deleteFile(key: string) {
        const params = {
            Bucket: this.bucketName,
            Key: key,
        };
        const command = new DeleteObjectCommand(params);
        await s3Client.send(command);
    }


}