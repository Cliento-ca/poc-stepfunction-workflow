import given from '../../steps/given';
import when from '../../steps/when';
import then from '../../steps/then';
import teardown from '../../steps/teardown';
import init from '../../steps/init';

describe('Test case: workflow ', () => {
    let workflowId: string;
    beforeAll(async () => {
        await init();
        workflowId = (await given.a_simple_workflow()) || '';
    });

    afterAll(async () => {
        // await teardown.a_simple_workflow();
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
            const fromDB = await then.item_exists_in_dynamodb('TASK', '1', 'SUBWORKFLOW', '1');
            //Todo: Code execute faster then the value is updated in the db.
            expect(fromDB!.status).toEqual('ACTIVE');
        });

        // describe('When we close the originator task', () => {
        //     beforeAll(async () => {
        //         // await when.we_close_a_task(workflowId, taskId);
        //     });

        //     it('Should update task status to "CLOSE"', async () => {
        //         const fromDB = await then.item_exists_in_dynamodb('TASK', '1', 'PHASE', '1');
        //         expect(fromDB!.status).toEqual('CLOSE');
        //     });

        //     it('Should activate the rest of the workflow', async () => {});
        // });
    });
});
