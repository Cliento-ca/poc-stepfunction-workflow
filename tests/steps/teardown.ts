import { DynamoDB } from 'aws-sdk';

const an_item = async (workflowId: string, entityType: string, entityId: string) => {
    const params = {
        TableName: process.env.TABLE_NAME || '',
        Key: {
            PK: workflowId,
            SK: `${entityType}#${entityId}`,
        },
    };
    const dynamodb = new DynamoDB.DocumentClient();
    await dynamodb.delete(params).promise();

    console.log(`[${entityType}#${entityId}] - task is deleted`);
};

const teardown = {
    an_item,
};

export default teardown;
