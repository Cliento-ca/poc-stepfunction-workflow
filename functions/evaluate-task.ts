import { DynamoDB } from 'aws-sdk';
import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger';
import middy from '@middy/core';
const logger = new Logger({ serviceName: 'stepfunction-workflow' });
const dynamodb = new DynamoDB.DocumentClient();

const lambdaHandler = async (event: any) => {
    try {
        const task = event.task;
        const subWorkflow = event.subWorkflow;
        const phase = event.phase;

        const taskId = task.id;
        const subWorkflowId = subWorkflow.id;
        const phaseId = phase.id;

        // Retrieve the task state from DynamoDB
        const taskState = await dynamodb
            .get({
                TableName: 'workflow-table',
                Key: {
                    PK: `TASK#${taskId}`,
                    SK: `SUBWORKFLOW#${subWorkflowId}`,
                },
            })
            .promise();

        if (!taskState.Item) {
            throw new Error(
                `Task state not found for task ${taskId} and subworkflow ${subWorkflowId}`,
            );
        }

        const status = taskState.Item.status;

        if (status === 'PENDING') {
            // Evaluate the task prerequisites
            const prerequisites = task.prerequisites || [];
            for (const prerequisite of prerequisites) {
                const prerequisiteStatus = await getTaskStatus(
                    prerequisite.id,
                    subWorkflowId,
                    phaseId,
                );
                if (prerequisiteStatus !== 'CLOSED') {
                    return { status: 'PENDING' };
                }
            }

            // All prerequisites are CLOSED
            return { status: 'ACTIVE' };
        } else if (status === 'ACTIVE') {
            // Evaluate the task prerequisites
            const prerequisites = task.prerequisites || [];
            for (const prerequisite of prerequisites) {
                const prerequisiteStatus = await getTaskStatus(
                    prerequisite.id,
                    subWorkflowId,
                    phaseId,
                );
                if (prerequisiteStatus !== 'CLOSED') {
                    return { status: 'PENDING' };
                }
            }

            // All prerequisites are CLOSED
            // Evaluate the parent subworkflow status
            const subWorkflowStatus = await getSubWorkflowStatus(subWorkflowId, phaseId);
            if (subWorkflowStatus !== 'ACTIVE') {
                return { status: 'PENDING' };
            }

            // Parent subworkflow is ACTIVE
            return { status: 'ACTIVE' };
        } else {
            // Task is CLOSED
            return { status: 'CLOSED' };
        }
    } catch (err) {
        console.error(err);
        throw err;
    }
};

async function getTaskStatus(taskId: string, subWorkflowId: string, phaseId: string) {
    const taskState = await dynamodb
        .get({
            TableName: 'workflow-table',
            Key: {
                PK: `TASK#${taskId}`,
                SK: `SUBWORKFLOW#${subWorkflowId}`,
            },
        })
        .promise();

    if (!taskState.Item) {
        throw new Error(`Task state not found for task ${taskId} and subworkflow ${subWorkflowId}`);
    }

    return taskState.Item.status;
}

async function getSubWorkflowStatus(subWorkflowId: string, phaseId: string) {
    const subWorkflowState = await dynamodb
        .get({
            TableName: 'workflow-table',
            Key: {
                PK: `SUBWORKFLOW#${subWorkflowId}`,
                SK: `PHASE#${phaseId}`,
            },
        })
        .promise();

    if (!subWorkflowState.Item) {
        throw new Error(
            `Subworkflow state not found for subworkflow ${subWorkflowId} and phase ${phaseId}`,
        );
    }

    return subWorkflowState.Item.status;
}
export const handler = middy(lambdaHandler).use(injectLambdaContext(logger, { logEvent: true }));
