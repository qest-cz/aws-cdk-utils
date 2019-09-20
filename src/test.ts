import { Code, Function, Runtime } from '@aws-cdk/aws-lambda';
import { App, Duration, Stack } from '@aws-cdk/core';
import { ExpressApi } from './patterns';

const app = new App();
const stack = new Stack(app, 'GraphlApiTest');

const handler = new Function(stack, 'ApiHandler', {
    code: Code.fromAsset('./code'),
    runtime: Runtime.NODEJS_8_10,
    timeout: Duration.seconds(10),
    memorySize: 1024,
    handler: 'index.handler',
});

const expressApi = new ExpressApi(stack, 'ExpressApi', { proxyHandler: handler });
expressApi.attachToApiDomain('api.vithabada.cz', 'test-api');
