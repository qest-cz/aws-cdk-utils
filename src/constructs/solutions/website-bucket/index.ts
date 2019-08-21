import { Bucket, HttpMethods } from '@aws-cdk/aws-s3';
import { BucketDeployment, ISource } from '@aws-cdk/aws-s3-deployment';
import { CfnOutput, Construct } from '@aws-cdk/core';

export interface WebsiteBucketProps {
    source: ISource;
    allowedHeaders?: string;
    allowedOrigins?: string;
}

export class WebsiteBucket extends Bucket {
    constructor(scope: Construct, id: string, { source, allowedHeaders, allowedOrigins }: WebsiteBucketProps) {
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
        });

        const bucketDeploymentname = `BucketDeployment`;

        this.grantPublicAccess('*', 's3:GetObject');

        new BucketDeployment(this, bucketDeploymentname, {
            source,
            destinationBucket: this,
        });

        new CfnOutput(this, 'BucketWebsiteUrl', { value: this.bucketWebsiteUrl });
    }
}
