import { Bucket, BucketProps, HttpMethods } from '@aws-cdk/aws-s3';
import { Construct } from '@aws-cdk/core';

export interface WebsiteBucketProps extends BucketProps {
    allowedHeaders?: string;
    allowedOrigins?: string;
}

export class WebsiteBucket extends Bucket {
    constructor(scope: Construct, id: string, { allowedHeaders, allowedOrigins, ...props }: WebsiteBucketProps) {
        super(scope, id, {
            websiteIndexDocument: 'index.html',
            websiteErrorDocument: 'index.html',
            publicReadAccess: true,
            cors: [
                {
                    allowedHeaders: allowedHeaders ? [...allowedHeaders.split(',')] : ['*'],
                    allowedMethods: [HttpMethods.DELETE, HttpMethods.GET, HttpMethods.HEAD, HttpMethods.POST, HttpMethods.PUT],
                    allowedOrigins: allowedOrigins ? [...allowedOrigins.split(',')] : ['*'],
                    exposedHeaders: ['ETag'],
                },
            ],
            ...props,
        });
    }
}
