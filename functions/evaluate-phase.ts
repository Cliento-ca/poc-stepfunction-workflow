import { DynamoDB } from 'aws-sdk';
import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger';
import middy from '@middy/core';
const logger = new Logger({ serviceName: 'stepfunction-workflow' });

const dynamodb = new DynamoDB.DocumentClient();

const lambdaHandler = async (event: any) => {
    const phaseId = event.PhaseId;

    // Get all prerequisite phases for this phase
    const prerequisitePhaseIds: string[] = await dynamodb
        .query({
            TableName: 'workflow-table',
            KeyConditionExpression: 'PK = :pk',
            ExpressionAttributeValues: {
                ':pk': `PHASE#${phaseId}`,
            },
            ProjectionExpression: 'PrerequisitePhases',
        })
        .promise()
        .then((data) => data.Items?.[0]?.PrerequisitePhases ?? []);

    // Get status of all prerequisite phases
    const prerequisitePhaseStatuses = await Promise.all(
        prerequisitePhaseIds.map((prerequisitePhaseId) =>
            dynamodb
                .get({
                    TableName: 'workflow-table',
                    Key: {
                        PK: `PHASE#${prerequisitePhaseId}`,
                        SK: `PHASE#${prerequisitePhaseId}`,
                    },
                    ProjectionExpression: 'Status',
                })
                .promise()
                .then((data) => data.Item?.Status ?? 'PENDING'),
        ),
    );

    // Determine status of this phase based on prerequisite phases' statuses
    let status: string;
    if (prerequisitePhaseStatuses.includes('PENDING')) {
        status = 'PENDING';
    } else if (prerequisitePhaseStatuses.includes('ACTIVE')) {
        status = 'ACTIVE';
    } else {
        // All prerequisite phases are CLOSED
        // Check if all subworkflows are CLOSED
        const subworkflowStatuses = await dynamodb
            .query({
                TableName: 'workflow-table',
                KeyConditionExpression: 'PK = :pk',
                ExpressionAttributeValues: {
                    ':pk': `PHASE#${phaseId}`,
                },
                ProjectionExpression: 'Subworkflows',
            })
            .promise()
            .then(
                (data) =>
                    data.Items?.[0]?.Subworkflows?.map((subworkflow: any) => subworkflow.Status) ??
                    [],
            );

        if (subworkflowStatuses.includes('PENDING')) {
            status = 'ACTIVE';
        } else if (subworkflowStatuses.includes('ACTIVE')) {
            status = 'ACTIVE';
        } else {
            status = 'CLOSED';
        }
    }

    // Update the status of the phase in the database
    await dynamodb
        .update({
            TableName: 'workflow-table',
            Key: {
                PK: `PHASE#${phaseId}`,
                SK: `PHASE#${phaseId}`,
            },
            UpdateExpression: 'SET #s = :s',
            ExpressionAttributeNames: {
                '#s': 'Status',
            },
            ExpressionAttributeValues: {
                ':s': status,
            },
        })
        .promise();

    return status;
};
export const handler = middy(lambdaHandler).use(injectLambdaContext(logger, { logEvent: true }));
