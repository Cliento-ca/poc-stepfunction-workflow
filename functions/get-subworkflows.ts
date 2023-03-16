import { DynamoDB } from 'aws-sdk';
import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger';
import middy from '@middy/core';
const logger = new Logger({ serviceName: 'stepfunction-workflow' });
const dynamodb = new DynamoDB.DocumentClient();

const { TABLE_NAME } = process.env;

interface GetSubWorkflowEvent {
    workflowId: string;
    phaseId: string;
}

export const lambdaHandler = async (event: GetSubWorkflowEvent) => {
    const { workflowId, phaseId } = event;

    const params = {
        TableName: TABLE_NAME || '',
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1 = :gsi1 and PK = :pk',
        ExpressionAttributeValues: {
            ':gsi1': `WORKFLOW#${workflowId}`,
            ':pk': `PHASE#${phaseId}`,
        },
    };

    try {
        const res = await dynamodb.query(params).promise();
        return res.Items;
    } catch (err) {
        logger.error('Unable to get subworkflows', err as Error);
        throw err;
    }
};
export const handler = middy(lambdaHandler).use(injectLambdaContext(logger, { logEvent: true }));
