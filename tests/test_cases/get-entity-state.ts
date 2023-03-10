import given from '../steps/given';
import when from '../steps/when';
import teardown from '../steps/teardown';
import init from '../steps/init';
import { v4 as uuidv4 } from 'uuid';

describe('Given a task', () => {
    const workflowId = uuidv4();
    const taskId = uuidv4();
    const state = 'PENDING';
    beforeAll(async () => {
        await init();
        await given.an_item(workflowId, 'TASK', taskId, state);
    });
    afterAll(async () => {
        await teardown.an_item(workflowId, 'TASK', taskId);
    });

    describe(`When we invoke get entity state`, () => {
        it(`Should return the state for the entity`, async () => {
            const res = await when.we_invoke_get_entity_state(workflowId, 'TASK', taskId);
            expect(res).toBe(state);
        });
    });
});
