import { RestApi } from '@aws-cdk/aws-apigateway';
import { Function } from '@aws-cdk/aws-lambda';
import { Construct } from '@aws-cdk/core';
import { APIGatewayDashboard } from '../../constructs';
import { addMethod, addResource, attachApiToCustomDomain } from '../../utils';

export interface ExpressApiProps {
    proxyHandler: Function;
}

export class ExpressApi extends Construct {
    public readonly dashboard: APIGatewayDashboard;
    public readonly apiGateway: RestApi;
    public readonly handler: Function;

    constructor(scope: Construct, id: string, { proxyHandler }: ExpressApiProps) {
        super(scope, id);

        const ApiName = id;

        this.handler = proxyHandler;
        this.apiGateway = new RestApi(this, ApiName);

        addMethod('ANY', this.handler)(this.apiGateway.root);
        addMethod('OPTIONS', this.handler)(this.apiGateway.root);

        const mapping = addResource('{proxy+}', addMethod('ANY', this.handler), addMethod('OPTIONS', this.handler));
        mapping(this.apiGateway.root);

        this.dashboard = new APIGatewayDashboard(this, { ApiName, handlers: [this.handler] });
    }

    public attachToApiDomain(basePath: string, domainName: string) {
        attachApiToCustomDomain(this, this.apiGateway)({ basePath, domainName });
    }
}
