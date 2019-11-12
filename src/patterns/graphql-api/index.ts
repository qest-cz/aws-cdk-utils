import { RestApi, RestApiProps } from '@aws-cdk/aws-apigateway';
import { Function } from '@aws-cdk/aws-lambda';
import { CfnOutput, Construct } from '@aws-cdk/core';
import { APIGatewayDashboard } from '../../constructs';
import { addMethod, addResource, attachApiToCustomDomain } from '../../utils';

export interface GraphQLApiProps extends RestApiProps {
    handler: Function;
}

export class GraphQlApi extends Construct {
    public readonly dashboard: APIGatewayDashboard;
    public readonly apiGateway: RestApi;
    public readonly handler: Function;

    constructor(scope: Construct, id: string, { handler, ...props }: GraphQLApiProps) {
        super(scope, id);

        const ApiName = id;

        this.apiGateway = new RestApi(this, ApiName, props);
        this.handler = handler;

        const mapping = addResource('graphql', addMethod('ANY', this.handler), addMethod('OPTIONS', this.handler));
        mapping(this.apiGateway.root);

        this.dashboard = new APIGatewayDashboard(this, { ApiName, handlers: [this.handler] });
    }

    public attachToApiDomain(domainName: string, basePath: string) {
        attachApiToCustomDomain(this, this.apiGateway)({ basePath, domainName });

        new CfnOutput(this, 'ApiDomain', { value: `https://${domainName}/${basePath}/graphql` });
    }
}
