import { Dashboard, GraphWidget } from '@aws-cdk/aws-cloudwatch';
import { Function } from '@aws-cdk/aws-lambda';
import { Construct } from '@aws-cdk/core';
import { APIGatewayLatencyWidget, APIGatewayRequestsWidget } from '../widgets';

export interface APIGatewayDashboardProps {
    ApiName: string;
    handlers?: Function[];
}

export class APIGatewayDashboard extends Dashboard {
    constructor(scope: Construct, { ApiName, handlers = [] }: APIGatewayDashboardProps) {
        super(scope, `${ApiName}-Dashboard`);

        this.addWidgets(new APIGatewayLatencyWidget({ ApiName }), new APIGatewayRequestsWidget({ ApiName }));

        handlers.map((handler) =>
            this.addWidgets(
                new GraphWidget({
                    width: 9,
                    title: `${handler.functionName} Invoke Duration`,
                    left: [handler.metricDuration()],
                }),
                new GraphWidget({
                    width: 9,
                    title: `${handler.functionName} Invocations`,
                    left: [handler.metricInvocations(), handler.metricErrors(), handler.metricThrottles()],
                }),
            ),
        );
    }
}
