import { StepFunctions } from 'aws-sdk';
const stepFunctions = new StepFunctions();
const APP_ROOT = '../../';

const viaHandler = async (event: any, functionName: string) => {
    const handler = require(`${APP_ROOT}/functions/${functionName}`).handler;
    return await handler(event, {});
};

const we_invoke_get_entity_state = async (
    workflowId: string,
    entityType: string,
    entityId: string,
) => {
    return await viaHandler({ workflowId, entityType, entityId }, 'get-entity-state');
};

const we_invoke_update_entity_state = async (
    workflowId: string,
    entityType: string,
    entityId: string,
    state: 'PENDING' | 'ACTIVE' | 'CLOSED',
) => {
    return await viaHandler({ workflowId, entityType, entityId, state }, 'update-entity-state');
};

const we_start_execution = async (stateMachineArn: string, input: any) => {
    const { executionArn } = await stepFunctions
        .startExecution({
            stateMachineArn,
            input: JSON.stringify(input),
        })
        .promise();

    return executionArn;
};

const when = {
    we_invoke_get_entity_state,
    we_invoke_update_entity_state,
    we_start_execution,
};
export default when;
