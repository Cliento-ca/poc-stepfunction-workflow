// import { DynamoDB } from 'aws-sdk';
// import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger';
// import middy from '@middy/core';
// const logger = new Logger({ serviceName: 'stepfunction-workflow' });
// const dynamodb = new DynamoDB.DocumentClient();

// const { TABLE_NAME } = process.env;

// interface GetEntityStateEvent {
//     entityId: string;
//     parentId: string;
// }

// export const lambdaHandler = async (event: GetEntityStateEvent) => {
//     const { entityType, entityId, parentType, parentId } = event;

//     const params = {
//         TableName: TABLE_NAME || '',
//         Key: {
//             PK: `${parentType}#${parentId}`,
//             SK: `${entityType}#${entityId}`,
//         },
//     };

//     try {
//         const result = await dynamodb.get(params).promise();
//         return result.Item?.status;
//     } catch (err) {
//         logger.error('Unable to get entity status', err as Error);
//         throw err;
//     }
// };
// export const handler = middy(lambdaHandler).use(injectLambdaContext(logger, { logEvent: true }));
