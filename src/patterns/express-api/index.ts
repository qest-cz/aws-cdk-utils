import { RestApi, RestApiProps } from '@aws-cdk/aws-apigateway';
import { Function } from '@aws-cdk/aws-lambda';
import { CfnOutput, Construct } from '@aws-cdk/core';
import { addMethod, addResource, attachApiToCustomDomain } from '../../utils';

export interface ExpressApiProps extends RestApiProps {
    proxyHandler: Function;
}

export class ExpressApi extends Construct {
    public readonly apiGateway: RestApi;
    public readonly handler: Function;

    constructor(scope: Construct, id: string, { proxyHandler, ...props }: ExpressApiProps) {
        super(scope, id);

        const ApiName = id;

        this.handler = proxyHandler;
        this.apiGateway = new RestApi(this, ApiName, props);

        addMethod('ANY', this.handler)(this.apiGateway.root);
        addMethod('OPTIONS', this.handler)(this.apiGateway.root);

        const mapping = addResource('{proxy+}', addMethod('ANY', this.handler), addMethod('OPTIONS', this.handler));
        mapping(this.apiGateway.root);
    }

    public attachToApiDomain(domainName: string, basePath: string) {
        attachApiToCustomDomain(this, this.apiGateway)({ basePath, domainName });

        new CfnOutput(this, 'ApiDomain', { value: `https://${domainName}/${basePath}` });
    }
}
