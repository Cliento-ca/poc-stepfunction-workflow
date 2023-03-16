import given from '../../steps/given';
import when from '../../steps/when';
import teardown from '../../steps/teardown';
import init from '../../steps/init';
import then from '../../steps/then';
import { v4 as uuidv4 } from 'uuid';

describe('Given a task', () => {
    const taskId = `TASK#${uuidv4()}`;
    const subworkflowId = `SUBWORKFLOW#${uuidv4()}`;
    const workflowId = `WORKFLOW#${uuidv4()}`;
    const status = 'PENDING';

    beforeAll(async () => {
        init();
        await given.an_item(taskId, subworkflowId, workflowId, status);
    });
    afterAll(async () => {
        await teardown.an_item(taskId, subworkflowId);
    });

    describe(`When we invoke update entity status`, () => {
        it(`Should update the status for that entity`, async () => {
            await when.we_invoke_update_entity_state(taskId, subworkflowId, 'ACTIVE');
            const fromDB = await then.item_exists_in_dynamodb(taskId, subworkflowId);
            expect(fromDB).toBeDefined();
            expect(fromDB!.status).toBe('ACTIVE');
        });
    });
});
