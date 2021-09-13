import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../../models/data/TodoItem'
import { TodoUpdate } from '../../models/data/TodoUpdate'
import { createLogger } from '../../utils/logger'

const logger = createLogger('data-layer')

const XAWS = AWSXRay.captureAWS(AWS)

export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE
  ) {}

  async getTodo(todoId: string, userId: string): Promise<TodoItem> {
   const result = await this.docClient.query({
        TableName: this.todosTable,
        KeyConditionExpression: 'todoId = :todoId AND userId = :userId',
        ExpressionAttributeValues: {
            ':todoId': todoId,
            ':userId': userId
        }
    }).promise()
    
    return result.Items[0] as TodoItem
}

  async getTodos(userId: string): Promise<TodoItem[]> {
    logger.info(`Getting all todo items for user ${userId}`)

    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()

    const items = result.Items

    return items as TodoItem[]
  }

  async createTodo(todoItem: TodoItem): Promise<TodoItem> {
    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todoItem
      })
      .promise()

    return todoItem
  }

  async updateTodo(userId: string, todoId: string, updateTodo: TodoUpdate): Promise<TodoUpdate> {
    
    await this.docClient.update({
      TableName: this.todosTable,
      Key: { userId, todoId },
      ExpressionAttributeNames: { "#N": "name" },
      UpdateExpression: "set #N=:todoName, dueDate=:dueDate, done=:done", 
      ExpressionAttributeValues: {
        ":todoName": updateTodo.name,
        ":dueDate": updateTodo.dueDate,
        ":done": updateTodo.done
      },
      ReturnValues: "UPDATED_NEW"
    })
    .promise();
    
    return updateTodo
  }

  async deleteTodo(todoId: string, userId: string) {
    const param = {
        TableName: this.todosTable,
        Key: {
            "userId": userId,
            "todoId": todoId
        }
    }
    await this.docClient.delete(param).promise()
  }

  async updateTodoWithUrl(userId: string, todoId: string, uploadUrl: string): Promise<string>{
    await this.docClient.update({
      TableName: this.todosTable,
      Key: { userId, todoId },
      UpdateExpression: "set attachmentUrl=:URL",
      ExpressionAttributeValues: {
        ":URL": uploadUrl.split("?")[0]
    },
    ReturnValues: "UPDATED_NEW"
    })
    .promise();

    return uploadUrl
  }

}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    AWSXRay.setContextMissingStrategy('LOG_ERROR')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
