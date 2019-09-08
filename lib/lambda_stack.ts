import lambda = require('@aws-cdk/aws-lambda');
import cdk = require('@aws-cdk/core');
import path = require('path');

export class LambdaStack extends cdk.Stack {
    public readonly lambdaCode: lambda.CfnParametersCode;
    constructor(app: cdk.App, id: string) {
	super(app, id);
	
	// const getCommitment = new lambda.Function(this, 'getCommitmentFunction', {
	
	//     code: new lambda.AssetCode('lib/handlers'),
	//     handler: 'getCommitment.handler'
	// });
	
	this.lambdaCode = lambda.Code.cfnParameters();
	
        const func = new lambda.Function(this, 'Lambda', {
            code: this.lambdaCode,
            handler: 'index.handler',
	    runtime: lambda.Runtime.NODEJS_10_X,
        });
    }
}
