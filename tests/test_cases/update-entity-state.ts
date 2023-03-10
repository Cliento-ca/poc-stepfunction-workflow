import given from '../steps/given';
import when from '../steps/when';
import teardown from '../steps/teardown';
import init from '../steps/init';
import then from '../steps/then';
import { v4 as uuidv4 } from 'uuid';

describe('Given a task', () => {
    const workflowId = uuidv4();
    const taskId = uuidv4();
    const state = 'PENDING';

    beforeAll(async () => {
        init();
        await given.an_item(workflowId, 'TASK', taskId, state);
    });
    afterAll(async () => {
        await teardown.an_item(workflowId, 'TASK', taskId);
    });

    describe(`When we invoke update entity state`, () => {
        it(`Should update the state for that entity`, async () => {
            await when.we_invoke_update_entity_state(workflowId, 'TASK', taskId, 'ACTIVE');
            const fromDB = await then.item_exists_in_dynamodb(workflowId, 'TASK', taskId);
            expect(fromDB).toBeDefined();
            expect(fromDB!.state).toBe('ACTIVE');
        });
    });
});
