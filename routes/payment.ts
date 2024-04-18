import { Request, ResponseToolkit } from "@hapi/hapi";
import Stripe from "stripe";
import { performPaymentSwagger } from "../swagger/payment";
import { performPaymentSchema } from "../validation/payment";
import dotenv from "dotenv";

dotenv.config();

const options = { abortEarly: false, stripUnknown: true };
const stripe = new Stripe(process.env.STRP_SECRETKEY);

export let paymentRoute = [
  {
    method: "POST",
    path: "/",
    options: {
      // auth: "jwt",
      description: "Perform payment",
      plugins: performPaymentSwagger,
      tags: ["api", "Payment"],
      validate: {
        payload: performPaymentSchema,
        options,
        failAction: (request, h, error) => {
          const details = error.details.map((d) => {
            return { err: d.message, path: d.path };
          });
          return h.response(details).code(400).takeover();
        },
      },
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const data = request.payload;
        const paymentIntent = await stripe.paymentIntents.create({
          amount: data["amount"],
          currency: "usd",

          automatic_payment_methods: {
            enabled: true,
          },
        });
        return response
          .response({
            status: "ok",
            data: { clientSecret: paymentIntent.client_secret },
          })
          .code(200);
      } catch (error) {
        console.log(error);
        return response.response({ status: "err", err: error }).code(501);
      }
    },
  },
];
