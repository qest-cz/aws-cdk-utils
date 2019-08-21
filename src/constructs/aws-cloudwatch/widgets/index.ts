import { GraphWidget, Metric } from '@aws-cdk/aws-cloudwatch';
import { Duration } from '@aws-cdk/core';

export interface APIGatewayWidgetProps {
    ApiName: string;
}

export interface APIGatewayLatencyWidgetProps extends APIGatewayWidgetProps {}

export interface APIGatewayRequestsWidgetProps extends APIGatewayWidgetProps {}

export class APIGatewayLatencyWidget extends GraphWidget {
    constructor({ ApiName }: APIGatewayLatencyWidgetProps) {
        super({
            title: 'API Latency',
            width: 9,
            left: [
                new Metric({
                    statistic: 'avg',
                    metricName: 'IntegrationLatency',
                    namespace: 'AWS/ApiGateway',
                    dimensions: { ApiName },
                }),
                new Metric({
                    statistic: 'avg',
                    metricName: 'Latency',
                    namespace: 'AWS/ApiGateway',
                    dimensions: { ApiName },
                }),
            ],
        });
    }
}

export class APIGatewayRequestsWidget extends GraphWidget {
    constructor({ ApiName }: APIGatewayRequestsWidgetProps) {
        super({
            width: 9,
            title: 'API Requests',
            left: [
                new Metric({
                    statistic: 'sum',
                    label: 'Total',
                    metricName: 'Count',
                    period: Duration.seconds(86400),
                    namespace: 'AWS/ApiGateway',
                    dimensions: { ApiName },
                }),
                new Metric({
                    statistic: 'sum',
                    label: '4XX',
                    metricName: '4XXError',
                    period: Duration.seconds(86400),
                    namespace: 'AWS/ApiGateway',
                    dimensions: { ApiName },
                }),
                new Metric({
                    statistic: 'sum',
                    label: '5XX',
                    metricName: '5XXError',
                    period: Duration.seconds(86400),
                    namespace: 'AWS/ApiGateway',
                    dimensions: { ApiName },
                }),
            ],
        });
    }
}
