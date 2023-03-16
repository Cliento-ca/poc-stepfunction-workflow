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

    describe(`When we invoke get phases`, () => {
        it(`Should return the phases entities`, async () => {
            const res = await when.we_invoke_get_phases(workflowId);
            expect(res).toBeDefined();
            expect(res.length).toBe(2);
            expect(res[0].SK).toBe('PHASE#1');
            expect(res[1].SK).toBe('PHASE#2');
        });
    });
});
