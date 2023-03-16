import { DynamoDB } from 'aws-sdk';

const item_exists_in_dynamodb = async (entityId: string, parentId: string) => {
    const params = {
        TableName: process.env.TABLE_NAME || '',
        Key: {
            PK: parentId,
            SK: entityId,
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
const execution_output_is = async (executionArn, expectation) => {
    const resp = await StepFunctions.describeExecution({
        executionArn,
    }).promise();

    if (resp.status === 'FAILED') {
        throw new ExecutionFailedError(executionArn);
    }

    expect(resp.output).toEqual(expectation);

    return resp.output;
};

const execution_status_is = async (executionArn, expectation) => {
    const resp = await StepFunctions.describeExecution({
        executionArn,
    }).promise();

    expect(resp.status).toEqual(expectation);
};

const then = {
    item_exists_in_dynamodb,
    item_does_not_exists_in_dynamodb,
    execution_output_is,
    execution_status_is,
};
export default then;
