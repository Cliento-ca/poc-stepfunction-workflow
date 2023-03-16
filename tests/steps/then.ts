import { DynamoDB } from 'aws-sdk';
import AWS, { StepFunctions } from 'aws-sdk';

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

const item_does_not_exists_in_dynamodb = async (entityId: string, parentId: string) => {
    const params = {
        TableName: process.env.TABLE_NAME || '',
        Key: {
            PK: parentId,
            SK: entityId,
        },
    };

    const dynamodb = new DynamoDB.DocumentClient();
    const response = await dynamodb.get(params).promise();
    expect(response.Item).toBeUndefined();

    return response.Item;
};
const execution_output_is = async (executionArn: string, expectation: any) => {
    const stepFunctions = new StepFunctions({ region: process.env.AWS_REGION });
    const resp = await stepFunctions
        .describeExecution({
            executionArn,
        })
        .promise();

    if (resp.status === 'FAILED') {
        throw new ExecutionFailedError(executionArn);
    }

    expect(resp.output).toEqual(expectation);

    return resp.output;
};

const execution_status_is = async (executionArn: string, expectation: any) => {
    const stepFunctions = new StepFunctions({ region: process.env.AWS_REGION });
    const resp = await stepFunctions
        .describeExecution({
            executionArn,
        })
        .promise();

    expect(resp.status).toEqual(expectation);
};

const then = {
    item_exists_in_dynamodb,
    item_does_not_exists_in_dynamodb,
    execution_output_is,
    execution_status_is,
};
export default then;
