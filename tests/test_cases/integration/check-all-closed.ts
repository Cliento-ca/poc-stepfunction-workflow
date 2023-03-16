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

    describe(`When we invoke check all closed`, () => {
        it(`Should return false for prerequisites TASK#1`, async () => {
            const res = await when.we_invoke_check_all_closed('TASK', ['1'], 'SUBWORKFLOW', '1');
            expect(res).toBe(false);
        });
    });
});
