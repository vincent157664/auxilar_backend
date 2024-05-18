import { Request, ResponseToolkit } from "@hapi/hapi";
import Account from "../models/account";
import { performPaymentSwagger, withdrawSwagger } from "../swagger/payment";
import { performPaymentSchema, withdrawSchema } from "../validation/payment";
import dotenv from "dotenv";
import Transaction from "../models/transaction";
import axios from "axios";
import config from "../config";

dotenv.config();

const options = { abortEarly: false, stripUnknown: true };
const base = "https://api-m.sandbox.paypal.com";

const generateAccessToken = async () => {
  try {
    if (!config.paypalClientId || !config.paypalClientSecret) {
      throw new Error("MISSING_API_CREDENTIALS");
    }

    const auth = Buffer.from(
      config.paypalClientId + ":" + config.paypalClientSecret
    ).toString("base64");

    const response = await axios.post(
      `${base}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    console.log("access token is ", response.data.access_token);
    return response.data.access_token;
  } catch (error) {
    console.error("Failed to generate Access Token:", error);
  }
};

export let paymentRoute = [
  {
    method: "POST",
    path: "/deposit",
    options: {
      auth: "jwt",
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
        return response.response(error).code(500);
      }
    },
  },
  {
    method: "POST",
    path: "/withdraw",
    options: {
      auth: "jwt",
      description: "Perform payment",
      plugins: withdrawSwagger,
      tags: ["api", "Payment"],
      validate: {
        payload: withdrawSchema,
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
        const account = Account.findOne({
          email: request.auth.credentials.email,
        });
        const balance = request.payload["balance"];
        const receiver = request.payload["receiver"];
        const senderBatchId = new Date().getMilliseconds().toString();
        const access_token = await generateAccessToken();
        if (!account) {
          return response
            .response({
              code: 404,
              message: "Account not found",
            })
            .code(404);
        }
        if (account.balance < balance) {
          return response
            .response({
              status: 400,
              message: "Insufficient balance",
            })
            .code(400);
        }
        const payoutRequest = {
          sender_batch_header: {
            sender_batch_id: senderBatchId,
            email_subject: "Payment Notification",
            email_message: "You have received a payment.",
          },
          items: [
            {
              recipient_type: "EMAIL",
              amount: {
                value: balance,
                currency: "USD",
              },
              receiver: receiver,
            },
          ],
        };
        const result = await axios.post(
          `${base}/v1/payments/payouts`,
          payoutRequest,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${access_token}`,
            },
          }
        );
        console.log(result.data);

        if (result.status !== 201) {
          return response
            .response({
              status: 500,
              data: result.data,
            })
            .code(500);
        } else {
          const transaction = await axios.get(`${result.data.links[0].href}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${access_token}`,
            },
          });
          console.log(transaction.data.amount);
          account.balance -= parseInt(transaction?.data?.amount?.value);
          account.save();
          const transactionData = new Transaction({
            transaction: transaction.data,
          });
          transactionData.save();

          return response
            .response({
              status: 200,
              data: result.data,
            })
            .code(200);
        }
      } catch (error) {
        console.log(error);
        return response.response(error).code(500);
      }
    },
  },
];
