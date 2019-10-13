//import dynamo = require('aws-sdk/client-dynamodb-v2-node');


export const getUser = async (event: any={}) : Promise <any> => {
    console.log("Logging from getUser");
    return {
	statusCode: 200,
	body: "GetUser body"
    };
};

export const postUser = async (event: any={}) : Promise <any> => {
    console.log("Logging from postUser");
    return {
	statusCode: 200,
	body: "PostUser body"
    };
};
