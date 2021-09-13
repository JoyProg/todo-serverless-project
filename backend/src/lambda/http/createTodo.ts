import 'source-map-support/register'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { createTodo } from '../../helpers/businessLogic/todos'

import { CreateTodoRequest } from '../../models/requests/CreateTodoRequest'

const logger = createLogger('todos')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)

  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  logger.info(`new todo: ${newTodo}`)
  console.log(newTodo)

  // TODO: Implement creating a new TODO item
  const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]

  const newItem = await createTodo(newTodo, jwtToken)

  return {
    statusCode: 201,
    body: JSON.stringify({
      item: newItem
    })
  }
})

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)