import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService implements OnModuleInit {
  private readonly logger = new Logger(UploadService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly endpoint: string;

  constructor() {
    this.endpoint = process.env.MINIO_ENDPOINT || 'http://localhost:9002';
    this.bucketName = process.env.MINIO_BUCKET || 'king-neon';

    this.s3Client = new S3Client({
      endpoint: this.endpoint,
      region: 'us-east-1', // MinIO doesn't care about region
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY || 'king_neon_minio',
        secretAccessKey:
          process.env.MINIO_SECRET_KEY || 'king_neon_minio_secret',
      },
      forcePathStyle: true, // Required for MinIO
    });

    this.logger.log(`S3 client initialized with endpoint: ${this.endpoint}`);
  }

  async onModuleInit() {
    await this.ensureBucketExists();
  }

  private async ensureBucketExists(): Promise<void> {
    try {
      // Check if bucket exists
      await this.s3Client.send(
        new HeadBucketCommand({ Bucket: this.bucketName }),
      );
      this.logger.log(`Bucket '${this.bucketName}' already exists`);
      // Ensure policy is set even for existing bucket
      await this.setBucketPublicReadPolicy();
    } catch (error: unknown) {
      const err = error as { name?: string };
      if (err.name === 'NotFound' || err.name === 'NoSuchBucket') {
        // Create bucket
        try {
          await this.s3Client.send(
            new CreateBucketCommand({ Bucket: this.bucketName }),
          );
          this.logger.log(`Bucket '${this.bucketName}' created successfully`);

          // Set public read policy
          await this.setBucketPublicReadPolicy();
        } catch (createError) {
          this.logger.error(`Failed to create bucket: ${createError}`);
        }
      } else {
        this.logger.warn(`Could not check bucket: ${String(error)}`);
      }
    }
  }

  private async setBucketPublicReadPolicy(): Promise<void> {
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadGetObject',
          Effect: 'Allow',
          Principal: '*',
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${this.bucketName}/*`],
        },
      ],
    };

    try {
      await this.s3Client.send(
        new PutBucketPolicyCommand({
          Bucket: this.bucketName,
          Policy: JSON.stringify(policy),
        }),
      );
      this.logger.log(`Public read policy set for bucket '${this.bucketName}'`);
    } catch (error) {
      this.logger.error(`Failed to set bucket policy: ${String(error)}`);
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'products',
  ): Promise<{ url: string; key: string }> {
    const fileExtension = file.originalname.split('.').pop();
    const key = `${folder}/${uuidv4()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    try {
      await this.s3Client.send(command);
      const url = `${this.endpoint}/${this.bucketName}/${key}`;
      this.logger.log(`File uploaded: ${url}`);
      return { url, key };
    } catch (error) {
      this.logger.error('Failed to upload file:', error);
      throw error;
    }
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    folder: string = 'products',
  ): Promise<{ url: string; key: string }[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      await this.s3Client.send(command);
      this.logger.log(`File deleted: ${key}`);
    } catch (error) {
      this.logger.error('Failed to delete file:', error);
      throw error;
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  getPublicUrl(key: string): string {
    return `${this.endpoint}/${this.bucketName}/${key}`;
  }
}
