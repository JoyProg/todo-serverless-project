import 'source-map-support/register'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { getUserIdByToken, getTodo, deleteTodo } from '../../helpers/businessLogic/todos'

const logger = createLogger('todos')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)

  const todoId = event.pathParameters.todoId

  // TODO: Remove a TODO item by
  if(!todoId){
    logger.error(`Invalid todo item with id: ${todoId}`)
    return {
        statusCode: 400,
        body: JSON.stringify({
            errorMessage: 'Invalid id',
            input: event 
          })
    }
  } 

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const userId = await getUserIdByToken(jwtToken)

  const todoItem = await getTodo(todoId, userId)

  if(Object.keys(todoItem).length === 0){
    logger.error(`user with id: ${userId} is attempting to delete a non-existent todo item with id ${todoId}`)
    return {
        statusCode: 400,
        body: JSON.stringify({
            errorMessage: 'todo item does not exist',
            input: event,
        })
    }
  }

  if(todoItem.userId !== userId){
    logger.error(`item with id ${todoId} was created by a different user and not by user with id ${userId}`)
    return {
        statusCode: 400,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentialls': true,
        },
        body: JSON.stringify({
            errorMessage: 'todo item was not created by user',
            input: event,
        })
    }
  }

  await deleteTodo(todoId, userId) 
  return {
    statusCode: 204,
    body: JSON.stringify({
      input: event,
    })
  }
})

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)