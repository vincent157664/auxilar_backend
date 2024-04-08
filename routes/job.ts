import { Request, ResponseToolkit } from "@hapi/hapi";
import {
  JobSwagger,
  deleteJobSwagger,
  findPostedJobSwagger,
  getAllJobSwagger,
  getJobSwagger,
  getMyAllJobSwagger,
  inviteExpertSwagger,
  recommendedExpertsSwagger,
  updateJobSwagger,
} from "../swagger/job";
import {
  JobSchema,
  findPostedJobSchema,
  inviteExpertSchema,
  updateJobSchema,
} from "../validation/job";

import Account from "../models/account";
import Job from "../models/job";
import Client from "../models/profile/client";
import Expert from "../models/profile/expert";
import { getAllCategories } from "../swagger/cateogory";
import Category from "../models/category";

const options = { abortEarly: false, stripUnknown: true };

export let jobRoute = [
  {
    method: "POST",
    path: "/",
    options: {
      auth: "jwt",
      description: "Post job",
      plugins: JobSwagger,
      tags: ["api", "job"],
      validate: {
        payload: JobSchema,
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

        // check whether account is client
        const account = await Account.findOne({
          email: request.auth.credentials.email,
        });
        if (account.account_type !== "client") {
          return response
            .response({ status: "err", err: "Forbidden request!" })
            .code(403);
        }

        // check whether profile exist
        const client = await Client.findOne({ account: account.id });
        if (!client) {
          return response
            .response({ status: "err", err: "Your profile does not exist" })
            .code(406);
        }

        const data = request.payload;

        // // check job already posted by current account
        // const alreadyPostedJob = await Job.findOne({
        //   client_email: account.email,
        //   title: data["title"],
        // });
        // if (alreadyPostedJob) {
        //   return response
        //     .response({ status: "err", err: "Job already posted" })
        //     .code(409);
        // }

        // Todo check expert list

        const jobField = {
          client: client.id,
          client_email: account.email,
          title: data["title"],
          description: data["description"],
          budget_type: data["budget_type"],
          budget_amount: data["budget_amount"],
          end_date: data["end_date"],
          // expire_date: data["expire_date"],
          category: data["category"],
          skill_set: data["skill_set"],
          job_type: data["job_type"],
          project_duration: data["project_duration"],
          pub_date: currentDate,
          // invited_expert: data["invited_expert"],
        };

        const newJob = new Job(jobField);

        await newJob.save();

        // add posted job to client
        await Client.findOneAndUpdate(
          { email: account.email },
          {
            $push: {
              ongoing_project: { project: newJob._id },
            },
          },
          { new: true }
        );

        return response.response({ status: "ok", data: newJob }).code(201);
      } catch (error) {
        return response.response({ err: error }).code(501);
      }
    },
  },

  {
    method: "PUT",
    path: "/{jobId}",
    options: {
      auth: "jwt",
      description: "Update posted job",
      plugins: updateJobSwagger,
      tags: ["api", "job"],
      validate: {
        payload: updateJobSchema,
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

        const account = await Account.findOne({
          email: request.auth.credentials.email,
        });
        // check whether account is client
        if (account.account_type !== "client") {
          return response
            .response({ status: "err", err: "Forbidden requeset!" })
            .code(403);
        }

        // check whether job exist
        try {
          await Job.findById(request.params.jobId);
        } catch (error) {
          return response
            .response({ status: "err", err: "Posted Job not found!" })
            .code(404);
        }

        const data = request.payload;
        const jobField = {
          title: data["title"],
          description: data["description"],
          budget_type: data["budget_type"],
          budget_amount: data["budget_amount"],
          end_date: data["end_date"],
          // expire_date: data["expire_date"],
          state: data["state"],
          category: data["category"],
          skill_set: data["skill_set"],
          job_type: data["job_type"],
          project_duration: data["project_duration"],
          hours_per_week: data["hours_per_week"],
        };

        // data["invited_expert"]
        //   ? (jobField["invitied_expert"] = data["invited_expert"])
        //   : null;

        const job = await Job.findOneAndUpdate(
          { _id: request.params.jobId, client_email: account.email },
          {
            $set: jobField,
          },
          { new: true }
        );

        // await job.save();

        return response
          .response({ status: "ok", data: "Job updated successfully" })
          .code(201);
      } catch (error) {
        return response.response({ status: "err", err: error }).code(501);
      }
    },
  },

  {
    method: "GET",
    path: "/",
    options: {
      auth: "jwt",
      description: "Get all posted job",
      plugins: getAllJobSwagger,
      tags: ["api", "job"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();

        // check whether account is expert
        const account = await Account.findOne({
          email: request.auth.credentials.email,
        });
        if (account.account_type !== "expert") {
          return response
            .response({ status: "err", err: "Forbidden request" })
            .code(403);
        }

        const allJobs: Array<Object> = await Job.find().sort({ pub_date: -1 });
        const responseData: object = {
          length: allJobs.length,
          allJobs,
        };
        return response
          .response({ status: "ok", data: responseData })
          .code(200);
      } catch (error) {
        return response
          .response({ status: "err", err: "Request not implemented!" })
          .code(501);
      }
    },
  },
  {
    method: "GET",
    path: "/myjob",
    options: {
      auth: "jwt",
      description: "Get my all posted job",
      plugins: getMyAllJobSwagger,
      tags: ["api", "job"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();

        // Check whether account is client
        const account = await Account.findOne({
          email: request.auth.credentials.email,
        });
        if (account.account_type !== "client") {
          return response
            .response({ status: "err", err: "Forbidden request!" })
            .code(403);
        }

        // const allMyJobs: Array<Object> = await Job.find({
        //   client_email: account.email,
        // }).sort({
        //   pub_date: -1,
        // });
        const allMyJobs = await Job.aggregate([
          {
            $match: {
              client_email: account.email,
            },
          },
          {
            $project: {
              client_email: 1,
              title: 1,
              description: 1,
              budget_type: 1,
              budget_amount: 1,
              pub_date: 1,
              end_date: 1,
              state: 1,
              category: 1,
              skill_set: 1,
              job_type: 1,
              hours_per_week: 1,
              project_duration: 1,
              invited_expert: 1,
              proposals: {
                $filter: {
                  input: "$proposals",
                  as: "proposal",
                  cond: {
                    // $eq: ["$$proposal.proposal_status", 2],
                    $in: ["$$proposal.proposal_status", [2, 3, 4, 5, 6, 7]],
                  },
                },
              },
            },
          },
          {
            $sort: { pub_date: -1 },
          },
        ]);

        if (allMyJobs.length === 0) {
          return response
            .response({ status: "err", err: "Posted job not found!" })
            .code(404);
        }
        const responseData: Object = {
          length: allMyJobs.length,
          allMyJobs,
        };
        return response
          .response({ status: "ok", data: responseData })
          .code(200);
      } catch (error) {
        return response
          .response({ status: "err", err: "Request not implemented!" })
          .code(501);
      }
    },
  },
  {
    method: "GET",
    path: "/{jobId}",
    options: {
      auth: "jwt",
      description: "Get posted job",
      plugins: getJobSwagger,
      tags: ["api", "job"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();

        try {
          const job = await Job.find({
            _id: request.params.jobId,
          });
          return response.response({ status: "ok", data: job }).code(200);
        } catch (error) {
          return response
            .response({ status: "err", err: "Posted job not found!" })
            .code(404);
        }
      } catch (error) {
        return response
          .response({ status: "err", err: "Request not implemented!" })
          .code(501);
      }
    },
  },
  {
    method: "DELETE",
    path: "/{jobId}",
    options: {
      auth: "jwt",
      description: "Delete posted job",
      plugins: deleteJobSwagger,
      tags: ["api", "job"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        // Check account whether it's client
        const account = await Account.findOne({
          email: request.auth.credentials.email,
        });
        if (account.account_type !== "client") {
          return response
            .response({ status: "err", err: "Forbidden request!" })
            .code(403);
        }

        try {
          await Job.deleteOne({
            _id: request.params.jobId,
            client_email: account.email,
          });

          // remove job id from client ongoing project
          await Client.findOneAndUpdate(
            {
              email: account.email,
              "ongoing_project.project": request.params.jobId,
            },
            {
              $pull: {
                ongoing_project: { project: request.params.jobId },
              },
            },
            { new: true }
          );
          return response
            .response({ status: "ok", data: "successfully deleted!" })
            .code(200);
        } catch (error) {
          return response
            .response({ status: "err", err: "Posted job not found!" })
            .code(404);
        }
      } catch (error) {
        return response
          .response({ status: "err", err: "Request not implemented!" })
          .code(501);
      }
    },
  },

  {
    method: "POST",
    path: "/findjobs",
    options: {
      auth: "jwt",
      description: "Find Posted Jobs",
      plugins: findPostedJobSwagger,
      tags: ["api", "job"],
      validate: {
        payload: findPostedJobSchema,
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

        // Check whether account is expert
        const account = await Account.findOne({
          email: request.auth.credentials.email,
        });
        if (account.account_type !== "expert") {
          return response
            .response({ status: "err", err: "Forbidden request!" })
            .code(403);
        }

        // check whether profile exist
        const expert = await Expert.findOne({ account: account.id });
        if (!expert) {
          return response
            .response({ status: "err", err: "Your profile does not exist" })
            .code(406);
        }

        const data = request.payload;
        const skill_set = data["skill_set"] as string[];
        const title = data["title"] as string;
        const category = data["category"] as string[];
        const budget_type = data["budget_type"];
        const clientInfo = data["client_info"];
        const hours_week = data["hours_per_week"];
        const project_duration = data["project_duration"];
        const jobs_per_page = data["jobs_per_page"] as number;
        const page_index = data["page_index"] as number;
        const sortBy = data["sortBy"];
        let query = [];
        let objectParam = {};
        let matchObject = {};
        let lookupParam = {};
        let unwindParam = { $unwind: "$clientData" };
        let aggregationStages = [];
        const pageCriteria = {
          $skip: jobs_per_page * (page_index - 1),
        };
        const indexCriteria = {
          $limit: jobs_per_page,
        };

        if (skill_set.length !== 0) {
          objectParam = { skill_set: { $in: skill_set } };
          query.push(objectParam);
        }
        if (title !== "") {
          objectParam = {
            $or: [
              { title: { $regex: title, $options: "i" } },
              { description: { $regex: title, $options: "i" } },
            ],
          };
          query.push(objectParam);
        }
        if (category.length !== 0) {
          objectParam = { category: { $in: category } };
          query.push(objectParam);
        }
        if (budget_type !== null) {
          objectParam = {
            $or: [
              {
                $and: [
                  { budget_type: 0 },
                  budget_type.fixed.fixed_range.length > 0
                    ? {
                        $or: budget_type.fixed.fixed_range.map((range) => ({
                          budget_amount: {
                            $gte: range.min_value,
                            $lte: range.max_value,
                          },
                        })),
                      }
                    : {},
                ],
              },
              {
                $and: [
                  { budget_type: 1 },
                  budget_type.hourly.hourly_range.length > 0
                    ? {
                        budget_amount: {
                          $gte: budget_type.hourly.hourly_range[0],
                          $lte: budget_type.hourly.hourly_range[1],
                        },
                      }
                    : {},
                ],
              },
            ],
          };
          console.log(objectParam);
          query.push(objectParam);
        }
        if (clientInfo !== null) {
          if (clientInfo.payment_verified === true) {
            lookupParam = {
              $lookup: {
                from: "clients",
                localField: "client",
                foreignField: "_id",
                as: "clientData",
                pipeline: [
                  {
                    $project: {
                      payment_verify: 1,
                    },
                  },
                ],
              },
            };
            aggregationStages.push(lookupParam);
            aggregationStages.push(unwindParam);
          } else if (clientInfo.payment_unverified === true) {
            lookupParam = {
              $lookup: {
                from: "clients",
                localField: "client",
                foreignField: "_id",
                as: "clientData",
                pipeline: [
                  {
                    $project: {
                      payment_verify: 0,
                    },
                  },
                ],
              },
            };

            aggregationStages.push(lookupParam);
            aggregationStages.push(unwindParam);
          } else {
            lookupParam = {
              $lookup: {
                from: "clients",
                localField: "client",
                foreignField: "_id",
                as: "clientData",
                pipeline: [
                  {
                    $project: {
                      "client.payment_verify": { $or: [0, 1] },
                    },
                  },
                ],
              },
            };

            aggregationStages.push(lookupParam);
            aggregationStages.push(unwindParam);
          }
        }
        if (hours_week.length !== 0) {
          objectParam = {
            hours_per_week: { $in: hours_week },
          };
          query.push(objectParam);
        }
        if (project_duration.length !== 0) {
          objectParam = {
            project_duration: { $in: project_duration },
          };
          query.push(objectParam);
        }
        if (query.length !== 0) matchObject = { $and: query };
        console.log("query", query);
        aggregationStages.push({ $match: matchObject });

        if (sortBy === "Relevance") {
          aggregationStages.unshift({
            $project: {
              score: { $meta: "textScore" },
            },
          });
          aggregationStages.push({ $sort: { score: { $meta: "textScore" } } });
        } else if (sortBy === "Latest") {
          aggregationStages.push({ $sort: { "job.pub_date": -1 } });
        }
        console.log(aggregationStages);
        const findedjobs = await Job.aggregate(aggregationStages).exec();

        return response.response({ status: "ok", data: findedjobs }).code(200);
      } catch (error) {
        console.log(error);
        return response.response({ status: "err", err: error }).code(501);
      }
    },
  },
  {
    method: "POST",
    path: "/invite",
    options: {
      auth: "jwt",
      description: "Invite expert to the posted job",
      plugins: inviteExpertSwagger,
      tags: ["api", "job"],
      validate: {
        payload: inviteExpertSchema,
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
        // check whether account is client
        const account = await Account.findOne({
          email: request.auth.credentials.email,
        });
        if (account.account_type !== "client") {
          return response
            .response({ status: "err", err: "Forbidden Request" })
            .code(403);
        }

        // Check whether expert profile exist
        const expert = await Expert.findOne({
          account: request.payload["expertId"],
        }).populate("account", ["first_name", "last_name"]);
        if (!expert) {
          return response
            .response({ status: "err", err: "Expert does not exist" })
            .code(404);
        }
        const jobId = request.payload["jobId"];
        const expertId = request.payload["expertId"];

        // check already invited
        const isAreadyInvited = await Job.findOne({
          _id: jobId,
          client_email: account.email,
          "invited_expert.id": expert.account._id,
        });
        if (isAreadyInvited) {
          return response
            .response({ status: "err", err: "Expert already invited!" })
            .code(409);
        }

        let inviteExpertToJob;
        try {
          const inviteExpertField = {
            id: expertId,
            first_name: expert.account.first_name,
            last_name: expert.account.last_name,
          };
          inviteExpertToJob = await Job.findOneAndUpdate(
            {
              _id: jobId,
              client_email: account.email,
            },
            {
              $push: {
                invited_expert: inviteExpertField,
              },
            },
            { new: true }
          );
        } catch (err) {
          return response
            .response({ status: "err", err: "Posted Job not found!" })
            .code(404);
        }
        return response
          .response({ code: 200, data: inviteExpertToJob.invited_expert })
          .code(200);
      } catch (err) {
        return response
          .response({ status: "err", err: "Not implemented!" })
          .code(501);
      }
    },
  },

  {
    method: "GET",
    path: "/{jobId}/recommendedExperts",
    options: {
      auth: "jwt",
      description: "Find expert",
      plugins: recommendedExpertsSwagger,
      tags: ["api", "expert"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();

        // check whether account is client
        const account = await Account.findOne({
          email: request.auth.credentials.email,
        });
        if (account.account_type !== "client") {
          return response
            .response({ status: "err", err: "Forbidden request!" })
            .code(403);
        }

        // Get Job
        const job = await Job.findOne({
          _id: request.params.jobId,
          client_email: account.email,
        });
        if (!job) {
          return response.response({ status: "err", err: "Job is not found!" });
        }

        let skills = [];
        if (job.skill_set.length) skills = job.skill_set;
        let queryAll = { skills: { $in: skills } };

        const findExperts = await Expert.aggregate([
          {
            $lookup: {
              from: "accounts",
              localField: "account",
              foreignField: "_id",
              as: "accountData",
            },
          },
          {
            $match: queryAll,
          },
        ]);

        return response.response({ status: "ok", data: findExperts }).code(200);
      } catch (err) {
        return response
          .response({ status: "err", err: "Not implemented!" })
          .code(501);
      }
    },
  },

  {
    method: "GET",
    path: "/all-categories",
    options: {
      auth: "jwt",
      description: "Get all recorded Categories",
      plugins: getAllCategories,
      tags: ["api", "job"],
    },

    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();
        const allCategories = await Category.find();
        if (!allCategories) {
          return response
            .response({ status: "err", err: "Recorded category not found!" })
            .code(404);
        }
        return response
          .response({ status: "ok", data: allCategories })
          .code(200);
      } catch (error) {
        return response.response({ status: "err", err: error }).code(501);
      }
    },
  },
];
