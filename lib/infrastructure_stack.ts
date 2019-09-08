import cdk = require('@aws-cdk/core');
import dynamodb = require('@aws-cdk/aws-dynamodb');

export class InfrastructureStack extends cdk.Stack {
    constructor(app: cdk.App, id: string) {
	super(app, id);

	const practiceLog = new dynamodb.Table(this, 'PracticeLog', {
	    partitionKey: {
		name: 'user',
		type: dynamodb.AttributeType.STRING
	    }
	});

	const commitments = new dynamodb.Table(this, 'Commitments', {
	    partitionKey: {
		name: 'user',
		type: dynamodb.AttributeType.STRING
	    }
	});
    }
}
