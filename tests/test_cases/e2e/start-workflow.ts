import given from '../../steps/given';
import when from '../../steps/when';
import then from '../../steps/then';
import teardown from '../../steps/teardown';
import init from '../../steps/init';
import retry from 'async-retry';

describe('Test case: workflow ', () => {
    let workflowId: string;
    beforeAll(async () => {
        await init();
        workflowId = (await given.a_simple_workflow()) || '';
    });

    afterAll(async () => {
        await teardown.a_workflow(workflowId);
    });

    describe('When we start an execution with an Active parent', () => {
        let executionArn: string;

        beforeAll(async () => {
            executionArn = await when.we_start_execution(
                process.env.WORKFLOW_STATE_MACHINE_ARN || '',
                { workflowId: workflowId, parentId: '1', parentState: 'ACTIVE' },
            );
        });

        it('Should activate the first task', async () => {
            await retry(
                async () => {
                    const task = await then.item_exists_in_dynamodb('TASK#1', 'SUBWORKFLOW#1');
                    expect(task!.status).toEqual('ACTIVE');
                },
                {
                    retries: 3,
                    maxTimeout: 1000,
                },
            );
        });
    });
});
