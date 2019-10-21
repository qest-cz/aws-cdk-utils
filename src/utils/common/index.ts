import { CfnResource, IResource, RemovalPolicy } from '@aws-cdk/core';

export const setRemovalPolicy = (resource: IResource, policy: RemovalPolicy): void => {
    let node = resource instanceof CfnResource ? resource : (resource.node.findChild('Resource') as CfnResource);
    if (!node) {
        node = resource.node.defaultChild as CfnResource;
    }

    node.applyRemovalPolicy(policy);
};
