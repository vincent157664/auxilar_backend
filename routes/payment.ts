import { Request, ResponseToolkit } from "@hapi/hapi";
import Account from "../models/account";
import { performPaymentSwagger } from "../swagger/payment";
import { performPaymentSchema } from "../validation/payment";
import dotenv from "dotenv";
import Transaction from "../models/transaction";

dotenv.config();

const options = { abortEarly: false, stripUnknown: true };

export let paymentRoute = [
  {
    method: "POST",
    path: "/deposit",
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
        const order = request.payload["order"];
        const account = await Account.findOne({
          email: request.auth.credentials.email,
        });
        const transaction = new Transaction({ transaction: order });
        transaction.save();
        const payload = order.purchase_units[0].amount.value;
        account.balance + parseInt(payload);
        account.save();
        return response
          .response({
            status: "Deposite completed successfully",
            data: { balance: account.balance },
          })
          .code(200);
      } catch (error) {
        console.log(error);
        return response.response({ status: "err", err: error }).code(501);
      }
    },
  },
  {
    method: "POST",
    path: "/withdraw",
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
        const order = request.payload["order"];
        // const amount = order.
        const transaction = new Transaction({ transaction: order });
        transaction.save();
        return response
          .response({
            status: "ok",
            data: {},
          })
          .code(200);
      } catch (error) {
        console.log(error);
        return response.response({ status: "err", err: error }).code(501);
      }
    },
  },
];
