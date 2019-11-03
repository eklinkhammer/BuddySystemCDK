import {PracticeSession} from './PracticeSession';
import {UserItem} from './tables/UserItem';

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

    let userItem = new UserItem();
    userItem.user = event.queryStringParameters.user_id;
    
    console.log(userItem);
    try {
	const fetched = await mapper.get({item: userItem});
	console.log(fetched);
	
	return {
	    statusCode: 200,
	    body: JSON.stringify(fetched)
	};
    } catch (e) {
	// Check exception type and return 500 if dynamo problem other than ItemNotFound
	return {
	    statusCode: 404
	};
    }
};

interface Goal {
    description: string
};

interface PostUserSession {
    userId: string,
    currentGoal?: Goal
};

export const postUser = async (event: any={}) : Promise <any> => {
    console.log("Logging from postUser");
    console.log(event);

    let obj: PostUserSession = JSON.parse(event.body);
    console.log(obj);

    if (obj.currentGoal === undefined) {
	console.log("Goal not provided");
    } else {
	console.log(obj.currentGoal.description);
    }
    
    const session = new PracticeSession();
    session.user = obj.userId;
    console.log(session);
    
    //let session = new PracticeSession();
    //session.user = event.body.userId

    //console.log(session);
    
    //mapper.put({item: session}).then(() => {
    //	console.log(session.user);
    //});
    
    return {
	statusCode: 200,
	body: "PostUser body"
    };
};
