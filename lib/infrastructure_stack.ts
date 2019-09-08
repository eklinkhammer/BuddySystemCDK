import cdk = require('@aws-cdk/core');
import dynamodb = require('@aws-cdk/aws-dynamodb');

export function createStack(app : cdk.App) {
    const infrastructureStack = new cdk.Stack(app, 'InfrastructureStack', {
	env: {
	    region: 'us-west-2',
	    account: '966335243884'
	}
    });

    const practiceLog = new dynamodb.Table(infrastructureStack, 'PracticeLog', {
	partitionKey: {
	    name: 'user',
	    type: dynamodb.AttributeType.STRING
	}
    });
    
    return infrastructureStack;
};
