import codebuild = require('@aws-cdk/aws-codebuild');
import codepipeline = require('@aws-cdk/aws-codepipeline');
import codepipeline_actions = require('@aws-cdk/aws-codepipeline-actions');
import cdk = require('@aws-cdk/core');
import cicd = require('@aws-cdk/app-delivery');
import lambda = require('@aws-cdk/aws-lambda');

import codecommit = require('@aws-cdk/aws-codecommit');

import { InfrastructureStack } from '../lib/infrastructure_stack';

import { App, Stack, StackProps } from '@aws-cdk/core';

export interface PipelineStackProps extends StackProps {
  readonly lambdaCode: lambda.CfnParametersCode;
}

export class PipelineStack extends Stack {
  constructor(app: App, id: string, props: PipelineStackProps) {
      super(app, id, props);

      const pipeline = new codepipeline.Pipeline(this, 'CodePipeline', {
	  // This CDK is for the pipeline that deploys itself, so when updated, make
	  // sure latest update is still pushed through
	  restartExecutionOnUpdate: true
      });

      const repo = new codecommit.Repository(this, 'Repo', {
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

      const project = new codebuild.PipelineProject(this, 'CodeBuild', {
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

      const lambdaProject = new codebuild.PipelineProject(this, 'LambdaBuild', {
	  buildSpec: codebuild.BuildSpec.fromObject({
              version: '0.2',
              phases: {
		  install: {
		      commands: [
			  'cd lambda',
			  'npm install',
		      ],
		  },
		  build: {
		      commands: 'npm run build',
		  },
              },
              artifacts: {
		  files: [
		      // TODO - Remove the ones that aren't needed.
		      'lambda/index.js',
		      'node_modules/**/*',
		      'lambda/src/**',
		      'lambda/src/**/*',
		      'lambda/**/*'
		  ],
              },
	  }),
	  environment: {
              buildImage: codebuild.LinuxBuildImage.UBUNTU_14_04_NODEJS_10_1_0,
	  },
      });
      
      const lambdaBuildOutput = new codepipeline.Artifact('LambdaBuildOutput');
      const lambdaBuildAction = new codepipeline_actions.CodeBuildAction({
	  actionName: 'LambdaBuild',
	  project: lambdaProject,
	  input: sourceOutput,
	  outputs: [lambdaBuildOutput],
      });

      pipeline.addStage({
	  stageName: 'build',
	  actions: [buildAction, lambdaBuildAction],
      });

      // Optionally, self-update the pipeline stack
      const selfUpdateStage = pipeline.addStage({ stageName: 'SelfUpdate' });
      selfUpdateStage.addAction(new cicd.PipelineDeployStackAction({
	  stack: this,
	  input: synthesizedApp,
	  adminPermissions: true,
      }));

      // const infrastructureStack = new InfrastructureStack(app, 'InfrastructureStack');

      // const deployInfrastructureAction = new cicd.PipelineDeployStackAction({
      // 	  stack: infrastructureStack,
      // 	  input: synthesizedApp,
      // 	  adminPermissions: true,
      // });

      
      const deployLambdaAction = new codepipeline_actions.CloudFormationCreateUpdateStackAction({
	  actionName: 'Lambda_CFN_Deploy',
	  templatePath: synthesizedApp.atPath('LambdaStack.template.yaml'),
	  stackName: 'LambdaDeploymentStack',
	  adminPermissions: true,
	  parameterOverrides: {
	      ...props.lambdaCode.assign(lambdaBuildOutput.s3Location),
	  },
	  extraInputs: [lambdaBuildOutput]
      });

      const deployStage = pipeline.addStage({
	  stageName: 'Deploy',
	  actions: [
	      //deployInfrastructureAction,
	      deployLambdaAction
	  ]
      });
  }
}
