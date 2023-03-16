import { DynamoDB } from 'aws-sdk';
import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger';
import middy from '@middy/core';
const logger = new Logger({ serviceName: 'stepfunction-workflow' });
const dynamodb = new DynamoDB.DocumentClient();

const { TABLE_NAME } = process.env;

interface GetSubWorkflowEvent {
    workflowId: string;
    subWorkflowId: string;
}

export const lambdaHandler = async (event: GetSubWorkflowEvent) => {
    const { workflowId, subWorkflowId } = event;

    const params = {
        TableName: TABLE_NAME || '',
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1 = :gsi1 and PK = :pk',
        ExpressionAttributeValues: {
            ':gsi1': `WORKFLOW#${workflowId}`,
            ':pk': `SUBWORKFLOW#${subWorkflowId}`,
        },
    };

    try {
        const res = await dynamodb.query(params).promise();
        const tasks = res.Items || [];
        // Sort tasks based on prerequisites
        const sortedTasks: any[] = [];
        const taskMap: { [key: string]: any } = {};

        tasks.forEach((task) => {
            taskMap[task.SK] = task;
        });

        function addPrerequisites(taskId: string) {
            const task = taskMap[taskId];
            if (!task) return;
            if (task.prerequisites) {
                task.prerequisites.forEach((prerequisite: string) => {
                    addPrerequisites(prerequisite);
                });
            }
            if (!sortedTasks.some((t) => t.SK === taskId)) {
                sortedTasks.push(task);
            }
        }

        Object.keys(taskMap).forEach((taskId) => {
            addPrerequisites(taskId);
        });

        return sortedTasks;
    } catch (err) {
        logger.error('Unable to get subworkflows', err as Error);
        throw err;
    }
};
export const handler = middy(lambdaHandler).use(injectLambdaContext(logger, { logEvent: true }));
