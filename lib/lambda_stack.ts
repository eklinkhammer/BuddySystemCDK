import lambda = require('@aws-cdk/aws-lambda');
import apigateway = require('@aws-cdk/aws-apigateway');
import dynamodb = require('@aws-cdk/aws-dynamodb');
import cdk = require('@aws-cdk/core');

import path = require('path');

export class LambdaStack extends cdk.Stack {
    public readonly lambdaCode: lambda.CfnParametersCode;
    constructor(app: cdk.App, id: string) {
	super(app, id);
	
	this.lambdaCode = lambda.Code.cfnParameters();

	const practiceLog = new dynamodb.Table(this, 'PracticeLog', {
	    partitionKey: {
		name: 'user',
		type: dynamodb.AttributeType.STRING
	    },
	    tableName: 'PracticeLog'
	});

	const commitments = new dynamodb.Table(this, 'Commitments', {
	    partitionKey: {
		name: 'user',
		type: dynamodb.AttributeType.STRING
	    },
	    tableName: 'Commitments'
	});

	const userTable = new dynamodb.Table(this, 'Users', {
	    partitionKey: {
		name: 'user',
		type: dynamodb.AttributeType.STRING
	    },
	    tableName: 'Users'
	});
	
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


	userTable.grantReadWriteData(getUserLambda);
	userTable.grantReadWriteData(postUserLambda);
	
	practiceLog.grantReadWriteData(getUserLambda);
	practiceLog.grantReadWriteData(postUserLambda);
    }
}
