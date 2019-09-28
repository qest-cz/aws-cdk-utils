import { Construct, IResolvable } from '@aws-cdk/core';
import { AwsCustomResource } from '@aws-cdk/custom-resources';

export interface MutableStringParameterProps {
    name: string;
    value: string;
}

export class MutableStringParameter extends Construct {
    public static fromParameterName(scope: Construct, id: string, parameterName: string): IResolvable {
        return new AwsCustomResource(scope, id, {
            onUpdate: {
                service: 'SSM',
                action: 'getParameter',
                parameters: {
                    Name: parameterName,
                },
                physicalResourceId: Date.now().toString(),
            },
        }).getData('Parameter.Value');
    }

    public constructor(scope: Construct, id: string, { name, value }: MutableStringParameterProps) {
        const logicalId = `SSMParam${Date.now().toString()}`;

        super(scope, logicalId);

        new AwsCustomResource(this, logicalId, {
            onCreate: {
                service: 'SSM',
                action: 'putParameter',
                parameters: {
                    Name: name,
                    Value: value,
                    Type: 'String',
                    Overwrite: true,
                },
                physicalResourceId: id,
            },
            onUpdate: {
                service: 'SSM',
                action: 'putParameter',
                parameters: {
                    Name: name,
                    Value: value,
                    Type: 'String',
                    Overwrite: true,
                },
                physicalResourceId: id,
            },
        });
    }
}