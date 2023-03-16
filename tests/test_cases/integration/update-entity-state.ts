import given from '../../steps/given';
import when from '../../steps/when';
import teardown from '../../steps/teardown';
import init from '../../steps/init';
import then from '../../steps/then';
import { v4 as uuidv4 } from 'uuid';

describe('Given a task', () => {
    const id = uuidv4();
    const status = 'PENDING';

    beforeAll(async () => {
        init();
        await given.an_item('TASK', id, 'PHASE', id, id, status);
    });
    afterAll(async () => {
        await teardown.an_item('TASK', id, 'PHASE', id);
    });

    describe(`When we invoke update entity status`, () => {
        it(`Should update the status for that entity`, async () => {
            await when.we_invoke_update_entity_state('TASK', id, 'PHASE', id, 'ACTIVE');
            const fromDB = await then.item_exists_in_dynamodb('TASK', id, 'PHASE', id);
            expect(fromDB).toBeDefined();
            expect(fromDB!.status).toBe('ACTIVE');
        });
    });
});
