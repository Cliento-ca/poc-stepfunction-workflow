import { DynamoDB } from 'aws-sdk';
import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger';
import middy from '@middy/core';
const logger = new Logger({ serviceName: 'stepfunction-workflow' });
const dynamodb = new DynamoDB.DocumentClient();

const { TABLE_NAME } = process.env;

interface CheckAllClosedEvent {
    entityType: string;
    entityIds: string[];
    parentType: string;
    parentId: string;
}

export const lambdaHandler = async (event: CheckAllClosedEvent) => {
    const { entityType, entityIds, parentType, parentId } = event;
    try {
        if (!entityIds || entityIds.length === 0) {
            return true;
        }
        const keys = entityIds.map((id: string) => ({
            PK: `${parentId}`,
            SK: `${id}`,
        }));
        const params = {
            RequestItems: {
                [TABLE_NAME || '']: {
                    Keys: keys,
                },
            },
        };
        const result = await dynamodb.batchGet(params).promise();
        const states = result.Responses?.[TABLE_NAME || ''].map((item) => item.status.S);
        return !states?.some((s) => s != 'CLOSED');
    } catch (err) {
        logger.error('Unable to check prerequisites status', err as Error);
        throw err;
    }
};
export const handler = middy(lambdaHandler).use(injectLambdaContext(logger, { logEvent: true }));
