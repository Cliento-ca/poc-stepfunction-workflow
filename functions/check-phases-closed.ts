import { DynamoDB } from 'aws-sdk';
import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger';
import middy from '@middy/core';
const logger = new Logger({ serviceName: 'stepfunction-workflow' });

const dynamodb = new DynamoDB.DocumentClient();

const lambdaHandler = async (phaseIds: string[]): Promise<boolean> => {
    for (const phaseId of phaseIds) {
        const phaseState = await dynamodb
            .get({
                TableName: 'workflow-table',
                Key: {
                    PK: `PHASE#${phaseId}`,
                    SK: `PHASE#${phaseId}`,
                },
            })
            .promise();

        if (!phaseState || phaseState.Item?.Status !== 'CLOSED') {
            return false;
        }
    }

    return true;
};
export const handler = middy(lambdaHandler).use(injectLambdaContext(logger, { logEvent: true }));
