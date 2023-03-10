import { DynamoDB } from 'aws-sdk';
import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger';
import middy from '@middy/core';
const logger = new Logger({ serviceName: 'stepfunction-workflow' });
const dynamodb = new DynamoDB.DocumentClient();

const { TABLE_NAME } = process.env;

interface GetEntityStateEvent {
    workflowId: string;
    entityType: string;
    entityId: string;
}

export const lambdaHandler = async (event: GetEntityStateEvent) => {
    const { workflowId, entityType, entityId } = event;

    const params = {
        TableName: TABLE_NAME || '',
        Key: {
            PK: workflowId,
            SK: `${entityType}#${entityId}`,
        },
    };

    try {
        const result = await dynamodb.get(params).promise();
        return result.Item?.state;
    } catch (err) {
        logger.error('Unable to get entity state', err as Error);
        throw err;
    }
};
export const handler = middy(lambdaHandler).use(injectLambdaContext(logger, { logEvent: true }));
