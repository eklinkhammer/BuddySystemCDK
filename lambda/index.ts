import * as user from "./user";

export const getUser = user.getUser;

export const handler = async (event: any={}) : Promise <any> => {
    
    return { statusCode: 200, body: "Hello from commitment handler"};
};
