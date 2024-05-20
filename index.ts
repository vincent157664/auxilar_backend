import * as hapi from "@hapi/hapi";
import Vision from "@hapi/vision";
import Inert from "@hapi/inert";

import HapiSwagger from "hapi-swagger";
import HapiAuthJwt2 from "hapi-auth-jwt2";

import fs from "fs";
import Path from "path";
import process from "process";

import config from "./config";
import connectDB from "./lib/dbConnect";
import setRoutes from "./routes";
import registerSocketServer from "./utils/socketServer";

const vadliateAccount = async (decoded, request, h) => {
  return { isValid: true, accountId: decoded.accountId };
};

const path = process.cwd();
const init = async () => {
 const server: hapi.Server = new hapi.Server({
    port: 3030,
    routes: { cors: { origin: ["*"] }, payload:{maxBytes:9999999} },
    host: "0.0.0.0",
  });
  await server.register(Inert);
  await server.register(Vision);
  await server.register({
    plugin: HapiSwagger,
    options: {
      info: {
        title: "Auxilar Backend API",
        version: "1.0.0",
      },
      securityDefinitions: {
        jwt: {
          type: "apiKey",
          name: "Authorization",
          in: "header",
        },
      },
    },
  });
  await server.register(HapiAuthJwt2);

  await server.auth.strategy("jwt", "jwt", {
    key: config.jwtSecret,
    validate: vadliateAccount,
    verifyOptions: { algorithms: ["HS256"] },
  });
  server.route({
    method: "GET",
    path: "/static/{param*}",
    handler: {
      directory: {
        path: Path.join(path, "static"),
      },
    },
  });
  await setRoutes(server);

  await server.start();

  await registerSocketServer(server.listener);
  let fileName = path + "/static";
  if (!fs.existsSync(fileName)) {
    fs.mkdirSync(fileName);
  }

  fileName += "/uploads";
  if (!fs.existsSync(fileName)) {
    fs.mkdirSync(fileName);
  }

  const kyc = fileName + "/kyc";
  const project = fileName + "/project";

  if (!fs.existsSync(kyc)) {
    fs.mkdirSync(kyc);
  }
  if (!fs.existsSync(project)) {
    fs.mkdirSync(project);
  }
  console.log(`🚀 Server running on ${server.info.uri} 🚀`);
  // ----------------------------------------------------- Initialize Skill, Major database -------------------------------------------------------------------//

  return server;
};

init();

export default init;
