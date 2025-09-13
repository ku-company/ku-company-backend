import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const BUCKET_NAME = process.env.BUCKET_NAME || "";
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
    async uploadImageFile(file: Express.Multer.File, folder?: string) {
        const key = folder ? `${folder}/${Date.now()}-${file.originalname}` : `${Date.now()}-${file.originalname}`;
        const params = {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      };
        const command = new PutObjectCommand(params);
        await s3Client.send(command);
        return { key };
    }

    async getImageUrl(key: string) {
        const params = {
            Bucket: BUCKET_NAME,
            Key: key,
        };
        const command = new GetObjectCommand(params);
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL valid for 1 hour
        return url;
    }

    async deleteImageFile(key: string) {
        const params = {
            Bucket: BUCKET_NAME,
            Key: key,
        };
        const command = new DeleteObjectCommand(params);
        await s3Client.send(command);
    }


}