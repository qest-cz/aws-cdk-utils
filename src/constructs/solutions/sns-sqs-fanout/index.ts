import { Function } from '@aws-cdk/aws-lambda';
import { SqsEventSource } from '@aws-cdk/aws-lambda-event-sources';
import { Topic } from '@aws-cdk/aws-sns';
import { SqsSubscription } from '@aws-cdk/aws-sns-subscriptions';
import { Queue } from '@aws-cdk/aws-sqs';
import { Construct } from '@aws-cdk/core';

export interface SnsSqsFanoutProps {
    topic?: Topic;
}

export interface SqsLambdaSubscription {
    consumer: Function;
    queue: Queue;
}

export class SnsSqsFanout extends Construct {
    public readonly topic: Topic;
    public readonly outputs: SqsLambdaSubscription[];

    constructor(scope: Construct, id: string, props?: SnsSqsFanoutProps) {
        super(scope, id);

        if (props && props.topic) {
            this.topic = props.topic;
        } else {
            const topicName = `Topic`;

            this.topic = new Topic(this, topicName);
        }

        this.outputs = [];
    }

    public addLambdaOutput(consumer: Function): SqsLambdaSubscription {
        const queue = new Queue(this, `${consumer.node.uniqueId}-Queue`);

        this.topic.addSubscription(new SqsSubscription(queue));
        queue.grantConsumeMessages(consumer);
        consumer.addEventSource(new SqsEventSource(queue));

        this.outputs.push({ consumer, queue });

        return { consumer, queue };
    }
}
