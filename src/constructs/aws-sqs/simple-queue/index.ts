import { Function } from '@aws-cdk/aws-lambda';
import { SqsEventSource, SqsEventSourceProps } from '@aws-cdk/aws-lambda-event-sources';
import { Queue } from '@aws-cdk/aws-sqs';
import { Construct } from '@aws-cdk/core';
import { get } from 'lodash';

export interface SimpleQueueProps {
    deadLetterQueue: boolean;
    deadLetterQueueName?: string;
}

export class SimpleQueue extends Queue {
    constructor(scope: Construct, id: string, props?: SimpleQueueProps) {
        super(scope, id, {
            deadLetterQueue: get(props, 'deadLetterQueue', false)
                ? {
                      maxReceiveCount: 5,
                      queue: new Queue(scope, get(props, 'deadLetterQueueName', false) || `${id}-DLQ`),
                  }
                : undefined,
        });
    }

    public addProducerFunction(producer: Function) {
        this.grantSendMessages(producer);
    }

    public addConsumerFunction(consumer: Function, eventSourceProps?: SqsEventSourceProps) {
        this.grantConsumeMessages(consumer);

        consumer.addEventSource(new SqsEventSource(this, eventSourceProps || undefined));
    }
}
