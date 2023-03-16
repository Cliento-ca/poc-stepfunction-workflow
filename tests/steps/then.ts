import { DynamoDB } from 'aws-sdk';

const item_exists_in_dynamodb = async (
    entityType: string,
    entityId: string,
    parentType: string,
    parentId: string,
) => {
    const params = {
        TableName: process.env.TABLE_NAME || '',
        Key: {
            PK: `${parentType}#${parentId}`,
            SK: `${entityType}#${entityId}`,
        },
    };

    const dynamodb = new DynamoDB.DocumentClient();
    const response = await dynamodb.get(params).promise();

    expect(response.Item).not.toBeNull();

    return response.Item;
};

const item_does_not_exists_in_dynamodb = async (
    entityType: string,
    entityId: string,
    parentType: string,
    parentId: string,
) => {
    const params = {
        TableName: process.env.TABLE_NAME || '',
        Key: {
            PK: `${parentType}#${parentId}`,
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
