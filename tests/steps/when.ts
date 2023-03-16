import AWS, { StepFunctions } from 'aws-sdk';

const APP_ROOT = '../../';

const viaHandler = async (event: any, functionName: string) => {
    const handler = require(`${APP_ROOT}/functions/${functionName}`).handler;
    return await handler(event, {});
};

const we_invoke_get_entity_state = async (
    entityType: string,
    entityId: string,
    parentType: string,
    parentId: string,
) => {
    return await viaHandler({ entityType, entityId, parentType, parentId }, 'get-entity-status');
};

const we_invoke_update_entity_state = async (
    entityType: string,
    entityId: string,
    parentType: string,
    parentId: string,
    status: 'PENDING' | 'ACTIVE' | 'CLOSED',
) => {
    return await viaHandler(
        { entityType, entityId, parentType, parentId, status },
        'update-entity-status',
    );
};

const we_invoke_check_all_closed = async (
    entityType: string,
    entityIds: string[],
    parentType: string,
    parentId: string,
) => {
    return await viaHandler({ entityType, entityIds, parentType, parentId }, 'check-all-closed');
};

const we_invoke_get_phases = async (workflowId: string) => {
    return await viaHandler({ workflowId }, 'get-phases');
};
const we_invoke_get_subWorkflow = async (workflowId: string, phaseId: string) => {
    return await viaHandler({ workflowId, phaseId }, 'get-subworkflows');
};
const we_invoke_get_tasks = async (workflowId: string, subWorkflowId: string) => {
    return await viaHandler({ workflowId, subWorkflowId }, 'get-tasks');
};
const we_start_execution = async (stateMachineArn: string, input: any) => {
    try {
        const stepFunctions = new StepFunctions({ region: process.env.AWS_REGION });
        const { executionArn } = await stepFunctions
            .startExecution({
                stateMachineArn,
                input: JSON.stringify(input),
            })
            .promise();
        return executionArn;
    } catch (error) {
        console.log(error);
    }
    return '';
};

const when = {
    we_invoke_get_entity_state,
    we_invoke_update_entity_state,
    we_invoke_check_all_closed,
    we_invoke_get_phases,
    we_invoke_get_subWorkflow,
    we_invoke_get_tasks,
    we_start_execution,
};
export default when;
