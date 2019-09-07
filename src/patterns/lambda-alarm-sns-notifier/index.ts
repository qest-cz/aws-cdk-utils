import { ComparisonOperator } from '@aws-cdk/aws-cloudwatch';
import { SnsAction } from '@aws-cdk/aws-cloudwatch-actions';
import { Function } from '@aws-cdk/aws-lambda';
import { Topic } from '@aws-cdk/aws-sns';
import { LambdaSubscription } from '@aws-cdk/aws-sns-subscriptions';
import { Construct } from '@aws-cdk/core';

export interface LambdaAlarmSNSNotifierProps {
    alarmSources?: Function[];
    handler: Function;
}

export class LambdaAlarmSNSNotifier extends Construct {
    public readonly handler: Function;
    public readonly topic: Topic;

    constructor(scope: Construct, id: string, { alarmSources, handler }: LambdaAlarmSNSNotifierProps) {
        super(scope, id);

        const topicName = `AlarmsTopic`;

        this.handler = handler;

        this.topic = new Topic(this, topicName);
        this.topic.addSubscription(new LambdaSubscription(this.handler));

        if (alarmSources) {
            const throttleAlarms = alarmSources.map(this.createThrottleAlarm);
            const errorAlarms = alarmSources.map(this.createErrorAlarm);

            errorAlarms.map((alarm) => alarm.addAlarmAction(new SnsAction(this.topic)));
            throttleAlarms.map((alarm) => alarm.addAlarmAction(new SnsAction(this.topic)));
        }
    }

    public addAlarmSource(lambda: Function) {
        this.createErrorAlarm(lambda).addAlarmAction(new SnsAction(this.topic));

        this.createThrottleAlarm(lambda).addAlarmAction(new SnsAction(this.topic));
    }

    private createThrottleAlarm(lambda: Function) {
        return lambda.metricThrottles().createAlarm(this, `${lambda.node.uniqueId}-ThrottleAlarm`, {
            threshold: 0,
            evaluationPeriods: 5,
            comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
            datapointsToAlarm: 2,
        });
    }

    private createErrorAlarm(lambda: Function) {
        return lambda.metricErrors().createAlarm(this, `${lambda.node.uniqueId}-ErrorAlarm`, {
            threshold: 0,
            evaluationPeriods: 3,
            comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
            datapointsToAlarm: 2,
        });
    }
}
