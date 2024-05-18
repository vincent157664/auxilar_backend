import { Request, ResponseToolkit } from "@hapi/hapi";
import {
  completeContractSwagger,
  deleteContractSwagger,
  getContractSwagger,
  makeContractSwagger,
  updateContractSwagger,
} from "../swagger/contract";
import {
  completeContractSchema,
  makeContractSchema,
  updateContractSchema,
} from "../validation/contract";
import Account from "../models/account";
import Expert from "../models/profile/expert";
import Contract from "../models/contract";
import Client from "../models/profile/client";

const options = { abortEarly: false, stripUnknown: true };

export let contractRoute = [
  {
    method: "POST",
    path: "/",
    options: {
      auth: "jwt",
      description: "Make contract",
      plugins: makeContractSwagger,
      tags: ["api", "contract"],
      validate: {
        payload: makeContractSchema,
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
        const currentDate = new Date().toUTCString();

        // check wheter account is client
        const account = await Account.findOne({
          email: request.auth.credentials.email,
        });
        const systemAccount = await Account.findOne({
          email: "auxilarorg@gmail.com",
        });

        if (account.account_type !== "client") {
          return response
            .response({ status: "err", err: "Forbidden request!" })
            .code(403);
        }

        // Get contract data
        const data = request.payload;

        // Check wheter expert exist
        const expert = await Expert.findOne({ account: data["expert_id"] });
        if (!expert) {
          return response
            .response({ status: "err", err: "Expert doesn't exist" })
            .code(404);
        }

        const contractData = {
          job: data["job"],
          proposal: data["proposal"],
          client_id: account._id,
          expert_id: data["expert_id"],
          milestones: data["milestones"],
          additional_information: data["additional_information"] ?? null,
          total_budget: data["total_budget"],
          paymentTerms: data["paymentTerms"],
        };

        // check whether contract exist
        const contract = await Contract.findOne({
          job: data["job"],
          proposal: data["proposal"],
          client_id: account._id,
          expert_id: data["expert_id"],
        });

        if (contract) {
          return response
            .response({
              stauts: "err",
              err: "You have already hired this expert.",
            })
            .code(409);
        }

        const newContract = new Contract(contractData);
        await newContract.save();
        if (data["milestones"].length !== 0) {
          const totalBudget = data["milestones"].reduce(
            (budget: number, milestone) => budget + milestone.amount,
            0
          );
          account.balance -= totalBudget;
          account.totlaEarning += totalBudget;
          systemAccount.balance += totalBudget;
          await account.save();
          await systemAccount.save();
        } else {
          account.balance -= data["total_budget"].proposed_budget;
          account.totlaEarning += data["total_budget"].proposed_budget;
          systemAccount.balance += data["total_budget"].proposed_budget;
          await systemAccount.save();
          await account.save();
        }

        // Add ongoing_project to expert
        await Expert.findOneAndUpdate(
          {
            account: expert.account,
          },
          {
            $push: {
              ongoing_project: { project: contractData.job },
            },
          }
        );

        // Add ongoing_project to client
        await Client.findOneAndUpdate(
          {
            account: request.auth.credentials.accountId,
          },
          {
            $push: {
              ongoing_project: { project: contractData.job },
            },
          }
        );

        return response
          .response({ staus: "ok", data: "Contract successfully created!" })
          .code(201);
      } catch (err) {
        console.log(err);
        return response.response(err).code(500);
      }
    },
  },
  {
    method: "POST",
    path: "/complete",
    options: {
      auth: "jwt",
      description: "Complete contract",
      plugins: completeContractSwagger,
      tags: ["api", "contract"],
      validate: {
        payload: completeContractSchema,
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
        const currentDate = new Date().toUTCString();

        // check wheter account is client
        const account = await Account.findOne({
          email: request.auth.credentials.email,
        });
        const systemAccount = await Account.findOne({
          email: "auxilarorg@gmail.com",
        });
        const expertAccount = await Account.findById(
          request.payload["expert_id"]
        );

        if (account.account_type !== "client") {
          return response
            .response({ status: "err", err: "Forbidden request!" })
            .code(403);
        }

        // Get contract data
        const data = request.payload;

        // Check wheter expert exist
        const expert = await Expert.findOne({ account: data["expert_id"] });
        if (!expert) {
          return response
            .response({ status: "err", err: "Expert doesn't exist" })
            .code(404);
        }

        // check whether contract exist
        const contract = await Contract.findOne({
          job: data["job"],
          client_id: account._id,
          expert_id: data["expert_id"],
        });

        if (!contract) {
          return response
            .response({
              stauts: "err",
              err: "You don't have created this contract.",
              code: 409,
            })
            .code(404);
        }
        if (contract.status === "Completed") {
          return response
            .response({
              stauts: "err",
              err: "Contract already completed.",
              code: 404,
            })
            .code(409);
        }
        if (contract.paymentTerms === "Fixed") {
          if (contract.milestones.length !== 0) {
            const totalBudget = contract.milestones.reduce(
              (budget: number, milestone) => budget + milestone.amount,
              0
            );
            systemAccount.balance -= totalBudget * 0.9;
            expertAccount.balance += totalBudget * 0.9;
            expertAccount.totlaEarning += totalBudget * 0.9;
            await account.save();
            await systemAccount.save();
          } else {
            systemAccount.balance -=
              contract.total_budget.proposed_budget * 0.9;
            expertAccount.balance +=
              contract.total_budget.proposed_budget * 0.9;
            expertAccount.totlaEarning +=
              contract.total_budget.proposed_budget * 0.9;
            await systemAccount.save();
            await expertAccount.save();
          }
        } else if (contract.paymentTerms === "Hourly") {
          if (account.balance < data["budget"]) {
            return response
              .response({
                message: "Low balance",
                err: "You do not have sufficient balance",
                code: 402,
              })
              .code(402);
          } else {
            account.balance -= data["budget"] * 0.9;
            expertAccount.balance += data["budget"] * 0.9;
            expertAccount.totlaEarning += data["budget"] * 0.9;
            systemAccount.balance += data["budget"] * 0.2;
            await account.save();
            await expertAccount.save();
            await systemAccount.save();
          }
        }
        contract.status = "Completed";
        contract.save();
        return response
          .response({
            message: "Contract Completed Successfully",
            data: contract,
          })
          .code(200);
      } catch (err) {
        console.log(err);
        return response.response(err).code(500);
      }
    },
  },
  {
    method: "GET",
    path: "/{jobId}/{proposalId}/{expertId}",
    options: {
      auth: "jwt",
      description: "Get contract",
      plugins: getContractSwagger,
      tags: ["api", "contract"],
    },

    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();

        // check wheter account is client
        const account = await Account.findOne({
          email: request.auth.credentials.email,
        });

        if (account.account_type === "mentor") {
          return response
            .response({ status: "err", err: "Forbidden request!" })
            .code(403);
        }

        // Get contract data
        const data = request.payload;

        // Check wheter expert exist
        const expert = await Expert.findOne({
          account: request.params.expertId,
        });
        if (!expert) {
          return response
            .response({ status: "err", err: "Expert doesn't exist" })
            .code(404);
        }

        // Get contract
        const contract = await Contract.findOne({
          job: request.params.jobId,
          proposal: request.params.proposalId,
          client_id: request.auth.credentials.accountId,
          expert_id: request.params.expertId,
        });
        if (!contract) {
          return response
            .response({ stauts: "err", err: "Contract doesn't exist" })
            .code(404);
        }
        return response.response({ status: "ok", data: contract }).code(200);
      } catch (err) {
        return response.response(err).code(500);
      }
    },
  },
  {
    method: "GET",
    path: "/all",
    options: {
      auth: "jwt",
      description: "Get my all contracts",
      plugins: getContractSwagger,
      tags: ["api", "contract"],
    },

    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();

        // check wheter account is client
        const account = await Account.findOne({
          email: request.auth.credentials.email,
        });

        if (account.account_type === "mentor") {
          return response
            .response({ status: "err", err: "Forbidden request!" })
            .code(403);
        }

        // Get contract
        const contract = await Contract.find({
          expert_id: account._id,
        });

        if (!contract) {
          return response
            .response({ stauts: "err", err: "Contract doesn't exist" })
            .code(404);
        }
        return response.response({ status: "ok", data: contract }).code(200);
      } catch (err) {
        return response.response(err).code(500);
      }
    },
  },
  {
    method: "PUT",
    path: "/{jobId}/{proposalId}/{expertId}",
    options: {
      auth: "jwt",
      description: "Update contract",
      plugins: updateContractSwagger,
      tags: ["api", "contract"],
      validate: {
        payload: updateContractSchema,
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
        const currentDate = new Date().toUTCString();

        // check wheter account is client
        const account = await Account.findOne({
          email: request.auth.credentials.email,
        });

        if (account.account_type !== "client") {
          return response
            .response({ status: "err", err: "Forbidden request!" })
            .code(403);
        }

        // Get contract data
        const data = request.payload;

        // Check wheter expert exist
        const expert = await Expert.findOne({
          account: request.params.expertId,
        });
        if (!expert) {
          return response
            .response({ status: "err", err: "Expert doesn't exist" })
            .code(404);
        }

        const updateContractData = {
          milestones: data["milestones"],
          total_budget: data["total_budget"],
          additional_information: data["additional_information"] ?? null,
        };

        //Update contract
        let updateContract;
        try {
          updateContract = await Contract.findOneAndUpdate(
            {
              job: request.params.jobId,
              proposal: request.params.proposalId,
              client_id: request.auth.credentials.accountId,
              expert_id: request.params.expertId,
            },
            {
              milestones: updateContractData.milestones,
              total_budget: updateContractData.total_budget,
              additional_information: updateContractData.additional_information,
            },
            { new: true }
          );
        } catch (error) {
          return response
            .response({ stauts: "err", err: "Contract doesn't exist" })
            .code(404);
        }
        return response
          .response({ status: "ok", data: updateContract })
          .code(200);
      } catch (err) {
        return response.response(err).code(500);
      }
    },
  },
  {
    method: "DELETE",
    path: "/{jobId}/{proposalId}/{expertId}",
    options: {
      auth: "jwt",
      description: "Delete contract",
      plugins: deleteContractSwagger,
      tags: ["api", "contract"],
    },

    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();

        // check wheter account is client
        const account = await Account.findOne({
          email: request.auth.credentials.email,
        });

        if (account.account_type === "mentor") {
          return response
            .response({ status: "err", err: "Forbidden request!" })
            .code(403);
        }

        // Check wheter expert exist
        const expert = await Expert.findOne({
          account: request.params.expertId,
        });
        if (!expert) {
          return response
            .response({ status: "err", err: "Expert doesn't exist" })
            .code(404);
        }

        //Delete contract
        const deletedContract = await Contract.deleteOne({
          job: request.params.jobId,
          proposal: request.params.proposalId,
          client_id: request.auth.credentials.accountId,
          expert_id: request.params.expertId,
        });
        if (!deletedContract) {
          return response
            .response({ stauts: "err", err: "Contract doesn't exist" })
            .code(404);
        }
        return response
          .response({ status: "ok", data: "Contract deleted successfully!" })
          .code(200);
      } catch (err) {
        return response.response(err).code(500);
      }
    },
  },
];
