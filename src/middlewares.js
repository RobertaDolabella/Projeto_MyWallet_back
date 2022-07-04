import { db } from './dbStrategy/mongo.js';

async function validateUser(request, response, next) {
    const { authorization } = request.headers
    const token = authorization?.replace('Bearer ', "")
    const user = await db.collection("usuarios").findOne({ token: token })


  if (!user) {
    return res.sendStatus(401);
  }

  response.locals.user = user;
  response.locals.token = token;

  next();
}

export default validateUser;
