import { Rule, Schedule } from '@aws-cdk/aws-events';
import { LambdaFunction } from '@aws-cdk/aws-events-targets';
import { Function, FunctionProps } from '@aws-cdk/aws-lambda';
import { Construct } from '@aws-cdk/core';

export interface ScheduledFunctionProps extends FunctionProps {
    scheduleExpression: string;
}

export class ScheduledFunction extends Function {
    constructor(scope: Construct, id: string, props: ScheduledFunctionProps) {
        super(scope, id, props);

        const { scheduleExpression } = props;
        const rule = new Rule(this, `Scheduled${id}-Rule`, { schedule: Schedule.expression(scheduleExpression) });

        rule.addTarget(new LambdaFunction(this));
    }
}
