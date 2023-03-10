import { DynamoDB } from 'aws-sdk';

const item_exists_in_dynamodb = async (
    workflowId: string,
    entityType: string,
    entityId: string,
) => {
    const params = {
        TableName: process.env.TABLE_NAME || '',
        Key: {
            PK: workflowId,
            SK: `${entityType}#${entityId}`,
        },
    };

    const dynamodb = new DynamoDB.DocumentClient();
    const response = await dynamodb.get(params).promise();

    expect(response.Item).not.toBeNull();

    return response.Item;
};

const item_does_not_exists_in_dynamodb = async (
    workflowId: string,
    entityType: string,
    entityId: string,
) => {
    const params = {
        TableName: process.env.TABLE_NAME || '',
        Key: {
            PK: workflowId,
            SK: `${entityType}#${entityId}`,
        },
    };

    const dynamodb = new DynamoDB.DocumentClient();
    const response = await dynamodb.get(params).promise();
    expect(response.Item).toBeUndefined();

    return response.Item;
};

const then = {
    item_exists_in_dynamodb,
    item_does_not_exists_in_dynamodb,
};
export default then;
