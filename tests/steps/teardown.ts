import { DynamoDB } from 'aws-sdk';

const an_item = async (entityId: string, parentId: string) => {
    const params = {
        TableName: process.env.TABLE_NAME || '',
        Key: {
            PK: `${parentId}`,
            SK: `${entityId}`,
        },
    };
    const dynamodb = new DynamoDB.DocumentClient();
    await dynamodb.delete(params).promise();

    console.log(`[${entityId}] - task is deleted`);
};

const a_workflow = async (workflowId: string) => {
    try {
        const queryInput = {
            TableName: process.env.TABLE_NAME || '',
            IndexName: 'GSI1',
            KeyConditionExpression: `GSI1 = :pk`,
            ExpressionAttributeValues: {
                ':pk': workflowId,
            },
        };
        const dynamodb = new DynamoDB.DocumentClient();
        const queryResult = await dynamodb.query(queryInput).promise();
        const deleteRequests = queryResult.Items?.map((item) => ({
            DeleteRequest: {
                Key: { PK: item.PK, SK: item.SK },
            },
        }));

        const batchWriteInput = {
            RequestItems: {
                [process.env.TABLE_NAME || '']: deleteRequests || [],
            },
        };

        await dynamodb.batchWrite(batchWriteInput).promise();
    } catch (error) {
        console.error(error);
    }
};
const teardown = {
    an_item,
    a_workflow,
};

export default teardown;
