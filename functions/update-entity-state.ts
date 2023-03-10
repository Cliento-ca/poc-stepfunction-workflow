import { DynamoDB } from 'aws-sdk';
import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger';
import middy from '@middy/core';

const logger = new Logger({ serviceName: 'stepfunction-workflow' });
const dynamodb = new DynamoDB.DocumentClient();
const { TABLE_NAME } = process.env;

interface UpdateEntityStateInput {
    workflowId: string;
    entityType: string;
    entityId: string;
    state: 'PENDING' | 'ACTIVE' | 'CLOSED';
}

export const lambdaHandler = async (event: UpdateEntityStateInput) => {
    const { workflowId, entityType, entityId, state } = event as UpdateEntityStateInput;

    const params = {
        TableName: TABLE_NAME || '',
        Key: {
            PK: workflowId,
            SK: `${entityType}#${entityId}`,
        },
        UpdateExpression: 'SET #state = :newState',
        ExpressionAttributeNames: {
            '#state': 'state',
        },
        ExpressionAttributeValues: {
            ':newState': state,
        },
    };

    try {
        await dynamodb.update(params).promise();
        return 'OK';
    } catch (err) {
        console.error('Unable to update entity state', err);
        throw err;
    }
};

export const handler = middy(lambdaHandler).use(injectLambdaContext(logger, { logEvent: true }));
