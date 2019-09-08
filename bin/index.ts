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

const app = new cdk.App();


// This defines a stack that contains the CodePipeline
const pipelineStack = new cdk.Stack(app, 'PipelineStack', {
    env: {
	region: 'us-west-2',
	account: '966335243884'
    }
});

const pipeline = new codepipeline.Pipeline(pipelineStack, 'CodePipeline', {
    // This CDK is for the pipeline that deploys itself, so when updated, make
    // sure latest update is still pushed through
    restartExecutionOnUpdate: true
});

const repo = new codecommit.Repository(pipelineStack, 'Repo', {
     repositoryName: 'BuddySystemCDK'
});

// Configure CodePipeline source - where your CDK App's source code is hosted
const sourceOutput = new codepipeline.Artifact();
const source = new codepipeline_actions.CodeCommitSourceAction({
    actionName: 'CodeCommit',
    repository: repo,
    output: sourceOutput,
});
pipeline.addStage({
    stageName: 'source',
    actions: [source],
});

const project = new codebuild.PipelineProject(pipelineStack, 'CodeBuild', {
    environment: {
	buildImage: codebuild.LinuxBuildImage.UBUNTU_14_04_NODEJS_10_1_0,
    },
});

const synthesizedApp = new codepipeline.Artifact();
const buildAction = new codepipeline_actions.CodeBuildAction({
    actionName: 'CodeBuild',
    project,
    input: sourceOutput,
    outputs: [synthesizedApp],
});
pipeline.addStage({
    stageName: 'build',
    actions: [buildAction],
});

// Optionally, self-update the pipeline stack
const selfUpdateStage = pipeline.addStage({ stageName: 'SelfUpdate' });
selfUpdateStage.addAction(new cicd.PipelineDeployStackAction({
  stack: pipelineStack,
  input: synthesizedApp,
  adminPermissions: true,
}));

const deployStage = pipeline.addStage({ stageName: 'Deploy' });
const infrastructureStack = new InfrastructureStack(app, 'InfrastructureStack');
const lambdaStack = new LambdaStack(app, 'LambdaStack');

const deployServiceAAction = new cicd.PipelineDeployStackAction({
    stack: infrastructureStack,
    input: synthesizedApp,
    // See the note below for details about this option.
    adminPermissions: true,
});
deployStage.addAction(deployServiceAAction);

const deployLambdaAction = new cicd.PipelineDeployStackAction({
    stack: lambdaStack,
    input: synthesizedApp,
    // See the note below for details about this option.
    adminPermissions: true,
});
deployStage.addAction(deployLambdaAction);

