import lambda = require('@aws-cdk/aws-lambda');
import apigateway = require('@aws-cdk/aws-apigateway');
import cdk = require('@aws-cdk/core');
import path = require('path');

export class LambdaStack extends cdk.Stack {
    public readonly lambdaCode: lambda.CfnParametersCode;
    constructor(app: cdk.App, id: string) {
	super(app, id);
	
	this.lambdaCode = lambda.Code.cfnParameters();

	const api = new apigateway.RestApi(this, 'buddy-api');
	api.root.addMethod('ANY');

	const users = api.root.addResource('users');
	const user = users.addResource('{user_id}');

	const getUserLambda = new lambda.Function(this, 'getUserLambda', {
	    code: this.lambdaCode,
	    handler: 'lambda/index.getUser',
	    runtime: lambda.Runtime.NODEJS_10_X,
	});

	const postUserLambda = new lambda.Function(this, 'postUserLambda', {
	    code: this.lambdaCode,
	    handler: 'lambda/index.postUser',
	    runtime: lambda.Runtime.NODEJS_10_X,
	});

	const getUserIntegration = new apigateway.LambdaIntegration(getUserLambda);
	user.addMethod('GET', getUserIntegration);

	const postUserIntegration = new apigateway.LambdaIntegration(postUserLambda);
	user.addMethod('POST', postUserIntegration);
    }
}
