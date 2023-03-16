import { DynamoDB } from 'aws-sdk';
import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger';
import middy from '@middy/core';
const logger = new Logger({ serviceName: 'stepfunction-workflow' });
const dynamodb = new DynamoDB.DocumentClient();

const { TABLE_NAME } = process.env;

interface GetPhasesEvent {
    workflowId: string;
}

export const lambdaHandler = async (event: GetPhasesEvent) => {
    const { workflowId } = event;

    const params = {
        TableName: TABLE_NAME || '',
        KeyConditionExpression: 'PK = :pk and begins_with(SK, :skPrefix)',
        ExpressionAttributeValues: {
            ':pk': `WORKFLOW#${workflowId}`,
            ':skPrefix': `PHASE#`,
        },
    };

    try {
        const res = await dynamodb.query(params).promise();
        return res.Items;
    } catch (err) {
        logger.error('Unable to get phases', err as Error);
        throw err;
    }
};
export const handler = middy(lambdaHandler).use(injectLambdaContext(logger, { logEvent: true }));
