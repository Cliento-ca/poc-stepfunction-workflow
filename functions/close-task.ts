import { DynamoDB } from 'aws-sdk';
import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger';
import { StepFunctions } from 'aws-sdk';
import middy from '@middy/core';

const logger = new Logger({ serviceName: 'stepfunction-workflow' });
const dynamodb = new DynamoDB.DocumentClient();
const stepFunctions = new StepFunctions();

const { TABLE_NAME } = process.env;

interface CloseTaskEvent {
    entityId: string;
    parentId: string;
}

export const lambdaHandler = async (event: any) => {
    const { entityId, parentId } = event.arguments.input as CloseTaskEvent;
    let taskToken;
    const params = {
        TableName: TABLE_NAME || '',
        Key: {
            PK: `${parentId}`,
            SK: `${entityId}`,
        },
    };

    try {
        const result = await dynamodb.get(params).promise();
        taskToken = result.Item?.taskToken;
    } catch (err) {
        logger.error('Unable to get entity ', err as Error);
        throw err;
    }

    if (!taskToken) {
        logger.error('Missing taskToken to close task');
    }

    const taskSuccessParams = {
        taskToken,
        output: JSON.stringify({ result: 'Task closed successfully' }),
    };

    try {
        await stepFunctions.sendTaskSuccess(taskSuccessParams).promise();
        logger.info('Task closed successfully');
    } catch (error) {
        logger.error('Failed to close task', error as Error);
        throw error;
    }
};
export const handler = middy(lambdaHandler).use(injectLambdaContext(logger, { logEvent: true }));
