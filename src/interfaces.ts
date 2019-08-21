import { Function } from '@aws-cdk/aws-lambda';
import { Queue } from '@aws-cdk/aws-sqs';

export interface ILambdaContainer {
    getFunctions(): Function[];
}

export interface IQueueContainer {
    getQueues(): Queue[];
}
