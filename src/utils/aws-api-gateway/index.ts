import { IResource, LambdaIntegration } from '@aws-cdk/aws-apigateway';
import { Function } from '@aws-cdk/aws-lambda';

export type ResourceMapper = (parent: IResource) => IResource;
export type ResourceCompositor = (path: string, ...rest: ResourceMapper[]) => ResourceMapper;

export const addMethod = (method: string, handler?: Function) => (parent: IResource) => {
    parent.addMethod(method, handler ? new LambdaIntegration(handler) : undefined);

    return parent;
};

export const splitPath = (path: string) => path.split('/');

export const createResourceFromPath = (path: string) => (parent: IResource) =>
    splitPath(path).reduce((acc, curr) => acc.addResource(curr), parent);

export const addResource: ResourceCompositor = (path: string, ...rest: ResourceMapper[]) => (parent: IResource) =>
    path.toString() === path
        ? rest.reduce((parent, mapper) => {
              mapper(parent);

              return parent;
          }, createResourceFromPath(path)(parent))
        : [<any>path, ...rest].reduce((parent, mapper) => {
              mapper(parent);

              return parent;
          }, parent);
