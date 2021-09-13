import * as AWS from "aws-sdk";
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

export class AttachmentAccess {
    constructor(
        private readonly s3: AWS.S3 = new XAWS.S3({
            signatureVersion: 'v4',
            region: process.env.region,
            params: {Bucket: process.env.ATTACHMENTS_BUCKET}
            }),
        private readonly signedUrlExpireSeconds = 60 * 5
    ){ }

    async getPresignedUrl(todoId: string): Promise<string>{

        const uploadUrl = this.s3.getSignedUrl('putObject', {
            Bucket: process.env.ATTACHMENTS_BUCKET,
            Key: `${todoId}.png`,
            Expires: this.signedUrlExpireSeconds
        }) as string;        

        return uploadUrl
    }
}