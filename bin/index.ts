#!/usr/bin/env node
import 'source-map-support/register';

import codebuild = require('@aws-cdk/aws-codebuild');
import codepipeline = require('@aws-cdk/aws-codepipeline');
import codepipeline_actions = require('@aws-cdk/aws-codepipeline-actions');
import cdk = require('@aws-cdk/core');
import cicd = require('@aws-cdk/app-delivery');
import codecommit = require('@aws-cdk/aws-codecommit');

import { InfrastructureStack } from '../lib/infrastructure_stack';
import { LambdaStack } from '../lib/lambda_stack';
import { PipelineStack } from '../lib/pipeline_stack';

const app = new cdk.App();
const lambdaStack = new LambdaStack(app, 'LambdaStack');
const pipelineStack = new PipelineStack(app, 'PipelineStack', {
  lambdaCode: lambdaStack.lambdaCode,
});
