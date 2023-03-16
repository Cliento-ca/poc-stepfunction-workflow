import given from '../../steps/given';
import when from '../../steps/when';
import teardown from '../../steps/teardown';
import init from '../../steps/init';

describe('Given a simple workflow', () => {
    let workflowId: string;
    beforeAll(async () => {
        await init();
        workflowId = (await given.a_simple_workflow()) || '';
    });
    afterAll(async () => {
        await teardown.a_workflow(workflowId);
    });

    describe(`When we invoke get subworkflow for phase`, () => {
        it(`Should return the subworkflow entities`, async () => {
            const res = await when.we_invoke_get_subWorkflow(workflowId, '2');
            expect(res).toBeDefined();
            expect(res.length).toBe(1);
            expect(res[0].SK).toBe('SUBWORKFLOW#1');
        });
    });
});
