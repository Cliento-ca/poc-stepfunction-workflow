import { DynamoDB } from 'aws-sdk';
import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger';
import middy from '@middy/core';

const logger = new Logger({ serviceName: 'stepfunction-workflow' });
const dynamodb = new DynamoDB.DocumentClient();
const { TABLE_NAME } = process.env;

interface UpdateEntityStatusEvent {
    entityId: string;
    parentId: string;
    status?: 'PENDING' | 'ACTIVE' | 'CLOSED';
    taskToken?: string;
}

export const lambdaHandler = async (event: UpdateEntityStatusEvent) => {
    const { entityId, parentId, status, taskToken } = event;

    if (!status && !taskToken) {
        console.log('Nothing to update update');
        return;
    }

    const updateExpressionParts: string[] = [];
    const expressionAttributeNames: { [key: string]: string } = {};
    const expressionAttributeValues: { [key: string]: string | undefined } = {};

    if (status) {
        updateExpressionParts.push('#statusAlias = :newStatus');
        expressionAttributeNames['#statusAlias'] = 'status';
        expressionAttributeValues[':newStatus'] = status;
    }

    if (taskToken) {
        updateExpressionParts.push('#taskTokenAlias = :taskToken');
        expressionAttributeNames['#taskTokenAlias'] = 'taskToken';
        expressionAttributeValues[':taskToken'] = taskToken;
    }

    const params = {
        TableName: TABLE_NAME || '',
        Key: {
            PK: `${parentId}`,
            SK: `${entityId}`,
        },
        UpdateExpression: 'SET ' + updateExpressionParts.join(', '),
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
    };

    try {
        await dynamodb.update(params).promise();
        return 'OK';
    } catch (err) {
        console.error('Unable to update entity', err);
        throw err;
    }
};

export const handler = middy(lambdaHandler).use(injectLambdaContext(logger, { logEvent: true }));
