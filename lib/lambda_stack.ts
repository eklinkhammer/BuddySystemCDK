import lambda = require('@aws-cdk/aws-lambda');
import cdk = require('@aws-cdk/core');
import path = require('path');

export class LambdaStack extends cdk.Stack {
    constructor(app: cdk.App, id: string) {
	super(app, id);

	const getCommitment = new lambda.Function(this, 'getCommitmentFunction', {
	    runtime: lambda.Runtime.NODEJS_10_X,
	    code: new lambda.AssetCode('lib/handlers'),
	    handler: 'getCommitment.handler'
	});
    }
}
