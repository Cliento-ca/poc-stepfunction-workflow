import { DynamoDB } from 'aws-sdk';
import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger';
import middy from '@middy/core';
const logger = new Logger({ serviceName: 'stepfunction-workflow' });

const dynamodb = new DynamoDB.DocumentClient();

export const lambdaHandler = async (event: any) => {
    try {
        const subWorkflowId = event.subWorkflowId;
        const phaseId = event.phaseId;

        // Retrieve the state of the subworkflow from the database
        const subWorkflowState = await dynamodb
            .get({
                TableName: 'workflow-table',
                Key: {
                    PK: `SUBWORKFLOW#${subWorkflowId}`,
                    SK: `PHASE#${phaseId}`,
                },
            })
            .promise();

        const tasks = subWorkflowState.Item.tasks;

        // Determine the overall status of the subworkflow
        let subWorkflowStatus = 'ACTIVE';
        for (const task of tasks) {
            if (task.status === 'PENDING') {
                subWorkflowStatus = 'PENDING';
                break;
            } else if (task.status === 'ACTIVE') {
                subWorkflowStatus = 'ACTIVE';
            }
        }

        // Update the status of the subworkflow in the database
        await dynamodb
            .update({
                TableName: 'workflow-table',
                Key: {
                    PK: `SUBWORKFLOW#${subWorkflowId}`,
                    SK: `PHASE#${phaseId}`,
                },
                UpdateExpression: 'SET #s = :status',
                ExpressionAttributeNames: {
                    '#s': 'status',
                },
                ExpressionAttributeValues: {
                    ':status': subWorkflowStatus,
                },
            })
            .promise();

        return {
            status: subWorkflowStatus,
        };
    } catch (err) {
        console.log(err);
        throw err;
    }
};
export const handler = middy(lambdaHandler).use(injectLambdaContext(logger, { logEvent: true }));
