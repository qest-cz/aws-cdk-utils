import { DnsValidatedCertificate } from '@aws-cdk/aws-certificatemanager';
import { CloudFrontWebDistribution, ViewerProtocolPolicy } from '@aws-cdk/aws-cloudfront';
import { AaaaRecord, AddressRecordTarget, ARecord, IHostedZone, ZoneDelegationRecord } from '@aws-cdk/aws-route53';
import { CloudFrontTarget } from '@aws-cdk/aws-route53-targets';
import { Bucket } from '@aws-cdk/aws-s3';
import { Construct } from '@aws-cdk/core';

export interface CloudFrontS3CustomDomainProps {
    bucket: Bucket;
    targetHostedZone: IHostedZone;
    delegateTo?: IHostedZone;
}

export class CloudFrontS3CustomDomain extends Construct {
    public readonly bucket: Bucket;
    public readonly hostedZone: IHostedZone;
    public readonly distribution: CloudFrontWebDistribution;
    public readonly cert: DnsValidatedCertificate;

    constructor(scope: Construct, id: string, { bucket, targetHostedZone, delegateTo }: CloudFrontS3CustomDomainProps) {
        super(scope, id);

        const cloudfrontDistributionName = `Distribution`;
        const certificateName = `Certificate`;

        this.bucket = bucket;
        this.hostedZone = targetHostedZone;

        if (delegateTo) {
            new ZoneDelegationRecord(this, `${delegateTo.zoneName} -> ${this.hostedZone.zoneName}`, {
                zone: delegateTo,
                nameServers: this.hostedZone.hostedZoneNameServers,
                recordName: this.hostedZone.zoneName,
            });
        }

        this.cert = new DnsValidatedCertificate(this, certificateName, {
            domainName: this.hostedZone.zoneName,
            hostedZone: this.hostedZone,
            region: 'us-east-1',
        });

        this.distribution = new CloudFrontWebDistribution(this, cloudfrontDistributionName, {
            defaultRootObject: 'index.html',
            viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            errorConfigurations: [
                {
                    errorCode: 404,
                    responseCode: 200,
                    errorCachingMinTtl: 0,
                    responsePagePath: '/index.html',
                },
                {
                    errorCode: 403,
                    responseCode: 200,
                    responsePagePath: '/index.html',
                    errorCachingMinTtl: 0,
                },
            ],
            aliasConfiguration: {
                acmCertRef: this.cert.certificateArn,
                names: [this.hostedZone.zoneName],
            },
            originConfigs: [
                {
                    s3OriginSource: {
                        s3BucketSource: this.bucket,
                    },
                    behaviors: [{ isDefaultBehavior: true }],
                },
            ],
        });

        new AaaaRecord(this, 'Alias', {
            zone: this.hostedZone,
            target: AddressRecordTarget.fromAlias(new CloudFrontTarget(this.distribution)),
        });

        new ARecord(this, 'Aliasv4', {
            zone: this.hostedZone,
            target: AddressRecordTarget.fromAlias(new CloudFrontTarget(this.distribution)),
        });
    }
}
