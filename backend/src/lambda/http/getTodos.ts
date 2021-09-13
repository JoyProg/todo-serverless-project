import 'source-map-support/register'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { getTodos } from '../../helpers/businessLogic/todos'

const logger = createLogger('todos')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // TODO: Get all TODO items for a current user
    logger.info('Processing event: ', event)

    const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]

    const items = await getTodos(jwtToken)

    if (items.length !== 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({items: items})
      }
    }

  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
