import { Server } from "@hapi/hapi";

import config from "../config";

import { accountRoute } from "./account";
import { expertRoute } from "./profile/expert";
import { clientRoute } from "./profile/client";
import { mentorRoute } from "./profile/mentor";
import { jobRoute } from "./job";
import { proposalRoute } from "./proposal";
import { adminRoute } from "./admin";
import { conversationRoute } from "./converstaion";
import { availableTimeRoute } from "./availableTime";
import { contractRoute } from "./contract";
import { bookingCallRoute } from "./bookingCall";
import { paymentRoute } from "./payment";
// const prefix = `/api/${config.apiVersion}`;

const setRoutes = async (server: Server) => {
  server.realm.modifiers.route.prefix = `/api/${config.apiVersion}/account`;
  server.route(accountRoute);
  server.realm.modifiers.route.prefix = `/api/${config.apiVersion}/expert`;
  server.route(expertRoute);
  server.realm.modifiers.route.prefix = `/api/${config.apiVersion}/client`;
  server.route(clientRoute);
  server.realm.modifiers.route.prefix = `/api/${config.apiVersion}/mentor`;
  server.route(mentorRoute);
  server.realm.modifiers.route.prefix = `/api/${config.apiVersion}/job`;
  server.route(jobRoute);
  server.realm.modifiers.route.prefix = `/api/${config.apiVersion}/proposal`;
  server.route(proposalRoute);
  server.realm.modifiers.route.prefix = `/api/${config.apiVersion}/admin`;
  server.route(adminRoute);
  server.realm.modifiers.route.prefix = `/api/${config.apiVersion}/conversation`;
  server.route(conversationRoute);
  server.realm.modifiers.route.prefix = `/api/${config.apiVersion}/schedule`;
  server.route(availableTimeRoute);
  server.realm.modifiers.route.prefix = `/api/${config.apiVersion}/contract`;
  server.route(contractRoute);
  server.realm.modifiers.route.prefix = `/api/${config.apiVersion}/book`;
  server.route(bookingCallRoute);
  server.realm.modifiers.route.prefix = `/api/${config.apiVersion}/payment`;
  server.route(paymentRoute);
};
export default setRoutes;
