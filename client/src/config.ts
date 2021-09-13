// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = '84pl2qzee2'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

//export const apiEndpoint = `http://localhost:3003/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-ty0v5l81.us.auth0.com',            // Auth0 domain
  clientId: 'j89VYYUsJXUJrmC3atDxd89EYDXeyMeO',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
