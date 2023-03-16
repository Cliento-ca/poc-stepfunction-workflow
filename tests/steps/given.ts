import { DynamoDB } from 'aws-sdk';
import * as fs from 'fs';
import * as path from 'path';

const an_item = async (
    entityType: string,
    entityId: string,
    parentType: string,
    parentId: string,
    workflowId: string,
    status: 'ACTIVE' | 'PENDING' | 'CLOSED',
) => {
    const params = {
        TableName: process.env.TABLE_NAME || '',
        Item: {
            PK: `${parentType}#${parentId}`,
            SK: `${entityType}#${entityId}`,
            GSI1: `WORKFLOW#${workflowId}`,
            status: status,
        },
    };
    const dynamodb = new DynamoDB.DocumentClient();

    await dynamodb.put(params).promise();

    console.log(`[${entityType}#${entityId}]  is created`);
};
/**
 * Creates a workflow with data from simple.csv
 */
const a_simple_workflow = async () => {
    try {
        const filePath = path.join(__dirname, '..', 'data', 'simple.csv');
        const csvData = fs.readFileSync(filePath, 'utf-8');
        const jsonItems = csvData
            .trim()
            .split('\n')
            .slice(1) // skip the header row
            .map((row) => {
                const [SK, PK, GSI1, status, prerequisitesString] = row.split(',');
                const prerequisites = prerequisitesString
                    ? JSON.parse(prerequisitesString.trim())
                    : [];
                return {
                    SK,
                    PK,
                    GSI1,
                    status,
                    prerequisites: prerequisites.map((prereq: string) => prereq),
                };
            });

        const dynamoDBParams = {
            RequestItems: {
                [process.env.TABLE_NAME || '']: jsonItems.map((item) => ({
                    PutRequest: { Item: item },
                })),
            },
        };

        const dynamodb = new DynamoDB.DocumentClient();

        await dynamodb.batchWrite(dynamoDBParams).promise();
        const gsi1 = jsonItems[0].GSI1;
        const workflowId = gsi1.split('#')[1];
        return workflowId;
    } catch (error) {
        console.log(error);
    }
};

const given = {
    an_item,
    a_simple_workflow,
};
export default given;
