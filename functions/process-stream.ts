import { StepFunctions, DynamoDB } from 'aws-sdk';
import { DynamoDBStreamEvent } from 'aws-lambda';
import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger';
import middy from '@middy/core';
const logger = new Logger({ serviceName: 'stepfunction-workflow' });

const stepFunctions = new StepFunctions();
const dynamoDB = new DynamoDB.DocumentClient();

const { STATE_MACHINE_ARN } = process.env;

const lambdaHandler = async (event: DynamoDBStreamEvent) => {
    try {
        for (const record of event.Records) {
            if (
                record.eventName === 'MODIFY' &&
                record.dynamodb?.NewImage?.status?.S === 'CLOSED'
            ) {
                const PK = record.dynamodb?.Keys?.PK?.S;
                const SK = record.dynamodb?.Keys?.SK?.S;
                const task = await dynamoDB
                    .get({
                        TableName: 'workflow-table',
                        Key: {
                            PK: PK,
                            SK: SK,
                        },
                    })
                    .promise();
                const input = {
                    taskId: taskId,
                    subWorkflowId: task.Item.SubWorkflowId.S,
                    phaseId: task.Item.PhaseId.S,
                };
                await stepFunctions
                    .startExecution({
                        stateMachineArn: STATE_MACHINE_ARN || '',
                        input: JSON.stringify(input),
                    })
                    .promise();
            }
        }
    } catch (error) {
        console.log(error);
    }
};
export const handler = middy(lambdaHandler).use(injectLambdaContext(logger, { logEvent: true }));
