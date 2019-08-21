import { CfnBasePathMapping, RestApi } from '@aws-cdk/aws-apigateway';
import { Function } from '@aws-cdk/aws-lambda';
import { Construct } from '@aws-cdk/core';
import { APIGatewayDashboard } from '../../../constructs/aws-cloudwatch';
import { addMethod, addResource } from '../../../utils';

export interface GraphQLApiProps {
    handler: Function;
}

export class GraphQlApi extends Construct {
    public readonly dashboard: APIGatewayDashboard;
    public readonly apiGateway: RestApi;
    public readonly handler: Function;

    constructor(scope: Construct, id: string, { handler }: GraphQLApiProps) {
        super(scope, id);

        const ApiName = id;

        this.apiGateway = new RestApi(this, ApiName);
        this.handler = handler;

        const mapping = addResource('graphql', addMethod('ANY', this.handler), addMethod('OPTIONS', this.handler));
        mapping(this.apiGateway.root);

        this.dashboard = new APIGatewayDashboard(this, { ApiName, handlers: [this.handler] });
    }

    public attachToApiDomain({ basePath, domainName }: { basePath: string; domainName: string }) {
        const resourceName = `${domainName}${basePath}`.replace('.', '');

        new CfnBasePathMapping(this, resourceName, {
            basePath,
            domainName,
            restApiId: this.apiGateway.restApiId,
            stage: this.apiGateway.deploymentStage.stageName,
        });
    }
}
