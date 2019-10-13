//import dynamo = require('aws-sdk/client-dynamodb-v2-node');

import {PracticeSession} from './PracticeSession';
import {DataMapper} from '@aws/dynamodb-data-mapper';
import DynamoDB = require('aws-sdk/clients/dynamodb');

const client = new DynamoDB({region: 'us-west-2'});
const mapper = new DataMapper({client});

/**
 * API Endpoint GET /users/{user_id}
 * 
 * Returns the 10 most recent practice sessions for the specified user, or
 * 400 if the user does not exist.
 */
export const getUser = async (event: any={}) : Promise <any> => {
    console.log("Logging from getUser");
    console.log(event);

    console.log(event.queryStringParameters.user_id);

    //let session = new PracticeSession();
    //session.user = event.queryStringParameters.user_id;

    //const fetched = await mapper.get({item: session});
    //console.log(fetched);
				  
    return {
	statusCode: 200,
	body: "GetUser body"
    };
};

export const postUser = async (event: any={}) : Promise <any> => {
    console.log("Logging from postUser");
    console.log(event);

    let session = new PracticeSession();
    session.user = event.body.userId

    console.log(session);
    
    mapper.put({item: session}).then(() => {
	console.log(session.user);
    });
    
    return {
	statusCode: 200,
	body: "PostUser body"
    };
};
