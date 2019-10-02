
import { CfnDeletionPolicy, CfnResource, IResource } from '@aws-cdk/core';

export const setDeletionPolicy = (resource: IResource, policy: CfnDeletionPolicy): void => {
    const node = resource.node.defaultChild as CfnResource;

    node.addOverride('DeletionPolicy', policy);
};