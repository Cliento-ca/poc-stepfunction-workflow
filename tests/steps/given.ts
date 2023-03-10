import { DynamoDB } from 'aws-sdk';

const an_item = async (
    workflowId: string,
    entityType: string,
    entityId: string,
    state: 'ACTIVE' | 'PENDING' | 'CLOSED',
) => {
    const params = {
        TableName: process.env.TABLE_NAME || '',
        Item: {
            PK: workflowId,
            SK: `${entityType}#${entityId}`,
            state: state,
        },
    };
    const dynamodb = new DynamoDB.DocumentClient();
    try {
        await dynamodb.put(params).promise();
    } catch (err) {
        console.error(err);
    }
    console.log(`[${entityType}#${entityId}]  is created`);
};

const given = {
    an_item,
};
export default given;
