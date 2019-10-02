import { CfnDeletionPolicy, CfnResource, IResource, RemovalPolicy } from '@aws-cdk/core';

export const setDeletionPolicy = (resource: IResource, policy: CfnDeletionPolicy): void => {
    const node = resource.node.defaultChild as CfnResource;

    node.addOverride('DeletionPolicy', policy);
};

export const setRemovalPolicy = (resource: IResource, policy: RemovalPolicy): void => {
    const node = resource.node.findChild('Resource') as CfnResource;

    node.applyRemovalPolicy(policy);
};
