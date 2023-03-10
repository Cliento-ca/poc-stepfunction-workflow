import { DynamoDB, StepFunctions } from 'aws-sdk';
import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger';
import middy from '@middy/core';

const logger = new Logger({ serviceName: 'stepfunction-workflow' });

const dynamoDB = new DynamoDB.DocumentClient();
//const stepFunctions = new StepFunctions();
// When the Step Function is started, it first creates the phases, subworkflows, and tasks
// in the DynamoDB table with their status set to "PENDING", except for the first phase,
// which is set to "ACTIVE".
const lambdaHandler = async (event: any): Promise<any> => {
    const { executionArn, stateMachineArn, phases } = event;

    for (const phase of phases) {
        const phaseId = phase.id;
        const subWorkflows = phase.subworkflows;

        // Create Phase
        await dynamoDB
            .put({
                TableName: 'workflow-table',
                Item: {
                    PK: `PHASE#${phaseId}`,
                    SK: `PHASE#${phaseId}`,
                    status: phaseId === phases[0].id ? 'ACTIVE' : 'PENDING', // Set the first phase as active and the rest as pending
                },
            })
            .promise();

        for (const subWorkflow of subWorkflows) {
            const subWorkflowId = subWorkflow.id;
            const tasks = subWorkflow.tasks;

            // Create Sub-Workflow
            await dynamoDB
                .put({
                    TableName: 'workflow-table',
                    Item: {
                        PK: `SUBWORKFLOW#${subWorkflowId}`,
                        SK: `PHASE#${phaseId}`,
                        status: 'PENDING',
                    },
                })
                .promise();

            for (const task of tasks) {
                const taskId = task.id;

                // Create Task
                await dynamoDB
                    .put({
                        TableName: 'workflow-table',
                        Item: {
                            PK: `TASK#${taskId}`,
                            SK: `SUBWORKFLOW#${subWorkflowId}`,
                            status: 'PENDING',
                        },
                    })
                    .promise();
            }
        }
    }

    // // Resume the Step Function execution
    // await stepFunctions
    //     .startExecution({
    //         stateMachineArn: stateMachineArn,
    //         input: JSON.stringify(input),
    //         name: executionArn,
    //     })
    //     .promise();
};

export const handler = middy(lambdaHandler).use(injectLambdaContext(logger, { logEvent: true }));
