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

        console.log(
          `POST api/v1/job request from ${request.auth.credentials.email} Time: ${currentDate}`
        );
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

        const newJob = new Job(
          jobField
          // { client_email: account.email },
          // { $set: jobField },
          // { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        await newJob.save();
        console.log("job posted successfully!", newJob);

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
        console.log(
          `PUT api/v1/job/${request.params.jobId} request from ${request.auth.credentials.email} Time: ${currentDate}`
        );
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
        console.log("job updated successfully!", job);

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
        console.log(
          `GET api/v1/job request from ${request.auth.credentials.email} Time: ${currentDate}`
        );

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
        console.log(
          `GET api/v1/job/myjob request from ${request.auth.credentials.email} Time: ${currentDate}`
        );
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
        console.log(
          `GET api/v1/job/${request.params.jobId} request from ${request.auth.credentials.email} Time: ${currentDate}`
        );
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
        console.log(
          `DELETE api/v1/job/${request.params.jobId} request from ${request.auth.credentials.email}`
        );
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
        console.log(
          `POST api/v1/job/findjobs request from ${request.auth.credentials.email} Time: ${currentDate}`
        );

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
        const filter = {};

        data["skill_set"].length !== 0
          ? (filter["skill_set"] = data["skill_set"])
          : null;
        data["category"].length !== 0
          ? (filter["category"] = data["category"])
          : null;
        data["title"] !== "emptystringtitle"
          ? (filter["title"] = data["title"])
          : null;

        data["budget_type"]?.["hourly"] ? (filter["hourly"] = true) : null;

        const query_skillandtitle = {};
        filter["skill_set"]
          ? (query_skillandtitle["skill_set"] = { $in: filter["skill_set"] })
          : null;

        filter["category"]
          ? (query_skillandtitle["category"] = { $in: filter["category"] })
          : null;

        filter["title"]
          ? (query_skillandtitle["title"] = {
              $regex: new RegExp("^" + filter["title"].toLowerCase(), "i"),
            })
          : null;

        console.log(
          "query_skillandtitle---------------------->>>>>>>>>>>>>>",
          query_skillandtitle
        );

        // ----------------------------- query for budget type is hourly ---------------------------

        let query_hourly_budget = {};
        const query_hourly = [];
        if (data["budget_type"]?.["hourly"]?.["ishourly"] === true) {
          query_hourly_budget = {
            budget_type: 1,
          };
        }
        if (data["budget_type"]?.["hourly"]?.["hourly_range"].length !== 0) {
          data["budget_type"]?.["hourly"]?.["hourly_range"].forEach((item) => {
            query_hourly.push({
              $and: [
                { budget_amount: { $gte: item.min_value } },
                { budget_amount: { $lt: item.max_value } },
              ],
            });
          });
        }
        console.log(
          "query_hourly_budget-------------------->>>>>>>>>>>>>",
          query_hourly_budget
        );
        console.log(
          "query_hourly-------------------->>>>>>>>>>>>>",
          query_hourly
        );

        // ------------------------------- query for budget type is fixed --------------------------
        let query_fixed_budget = {};
        const query_fixed = [];

        if (data["budget_type"]?.["fixed"]?.["isfixed"] === true) {
          query_fixed_budget = {
            budget_type: 0,
          };
        }
        if (data["budget_type"]?.["fixed"]?.["fixed_range"].length !== 0) {
          data["budget_type"]?.["fixed"]?.["fixed_range"].forEach((item) => {
            query_fixed.push({
              $and: [
                { budget_amount: { $gte: item.min_value } },
                { budget_amount: { $lt: item.max_value } },
              ],
            });
          });
        }

        console.log(
          "query_fixed_budget-------------------->>>>>>>>>>>>>",
          query_fixed_budget
        );
        console.log(
          "query_fixed-------------------->>>>>>>>>>>>>",
          query_fixed
        );

        const query_number_of_proposals = [];
        if (data["number_of_proposals"].length !== 0) {
          data["number_of_proposals"].forEach((item) => {
            query_number_of_proposals.push({
              $expr: {
                $and: [
                  { $gte: [{ $size: "$proposals" }, item.min_value] },
                  { $lt: [{ $size: "$proposals" }, item.max_value] },
                ],
              },
            });
          });
        }
        console.log(
          "query_number_of_proposals-------------------->>>>>>>>>>>>>",
          query_number_of_proposals
        );

        const query_client_info = [];
        if (data["client_info"]?.["payment_verified"])
          query_client_info.push({ "clientData.payment_verify": true });
        if (data["client_info"]?.["payment_unverified"])
          query_client_info.push({ "clientData.payment_verify": false });

        console.log(
          "query_client_info ------------------>>>>>>>>>>>>>",
          query_client_info
        );

        const query_hours_per_week = [];
        if (data["hours_per_week"].length !== 0) {
          data["hours_per_week"].forEach((item) => {
            query_hours_per_week.push({ hours_per_week: item });
          });
        }
        console.log(
          "query_hours_per_week ------------------>>>>>>>>>>",
          query_hours_per_week
        );

        const query_project_duration = [];
        if (data["project_duration"].length !== 0) {
          data["project_duration"].forEach((item) => {
            query_project_duration.push({ project_duration: item });
          });
        }
        console.log(
          "query_project_duration ------------------>>>>>>>>>>",
          query_project_duration
        );

        data["jobs_per_page"]
          ? (filter["jobs_per_page"] = data["jobs_per_page"])
          : null;

        data["page_index"] ? (filter["page_index"] = data["page_index"]) : null;

        const queryAll = {
          $and: [
            query_skillandtitle,
            // {
            //   $or: [
            // query_hourly_budget,
            //     // {
            //     // $and: [
            //     // query_fixed_budget,
            //     // {
            //     //   $or: query_fixed,
            //     // },
            //     // ],
            //     // },
            //     {
            //       $or: query_number_of_proposals,
            //     },
            //     {
            //       $or: query_client_info,
            //     },
            //     {
            //       $or: query_hours_per_week,
            //     },
            //   ],
            // },
          ],
        };

        if (Object.keys(query_hourly_budget).length !== 0) {
          if (queryAll.$and[1]) {
            if (query_hourly.length !== 0) {
              queryAll.$and[1]["$or"].push({
                $and: [query_hourly_budget, { $or: query_hourly }],
              });
            } else {
              queryAll.$and[1]["$or"].push({ $and: [query_hourly_budget] });
            }
          } else {
            if (query_hourly.length !== 0) {
              queryAll.$and.push({
                $or: [{ $and: [query_hourly_budget, { $or: query_hourly }] }],
              });
            } else {
              queryAll.$and.push({ $or: [{ $and: [query_hourly_budget] }] });
            }
          }
          console.log(
            "queryAll.and[1]----------------------->>>>>>>>>>>",
            queryAll.$and[1]["$or"][0]
          );
        }

        if (Object.keys(query_fixed_budget).length !== 0) {
          if (queryAll.$and[1]) {
            if (query_fixed.length !== 0) {
              queryAll.$and[1]["$or"].push({
                $and: [query_fixed_budget, { $or: query_fixed }],
              });
            } else {
              queryAll.$and[1]["$or"].push({ $and: [query_fixed_budget] });
            }
          } else {
            if (query_fixed.length !== 0) {
              queryAll.$and.push({
                $or: [{ $and: [query_fixed_budget, { $or: query_fixed }] }],
              });
            } else {
              queryAll.$and.push({ $or: [{ $and: [query_fixed_budget] }] });
            }
          }
          console.log(
            "queryAll.and[1]----------------------->>>>>>>>>>>",
            queryAll.$and[1]["$or"][0]
          );
        }

        if (query_number_of_proposals.length !== 0) {
          queryAll.$and[1]
            ? queryAll.$and[1]["$or"].push({ $or: query_number_of_proposals })
            : queryAll.$and.push({ $or: [{ $or: query_number_of_proposals }] });
        }

        if (query_client_info.length !== 0) {
          queryAll.$and[1]
            ? queryAll.$and[1]["$or"].push({ $or: query_client_info })
            : queryAll.$and.push({ $or: [{ $or: query_client_info }] });
        }

        if (query_hours_per_week.length !== 0) {
          queryAll.$and[1]
            ? queryAll.$and[1]["$or"].push({ $or: query_hours_per_week })
            : queryAll.$and.push({ $or: [{ $or: query_hours_per_week }] });
        }

        if (query_project_duration.length !== 0) {
          queryAll.$and[1]
            ? queryAll.$and[1]["$or"].push({ $or: query_project_duration })
            : queryAll.$and.push({ $or: [{ $or: query_project_duration }] });
        }

        console.log(
          "queryAll-------------------------------->>>>>>>>>>",
          queryAll
        );
        // console.log(
        //   "query_client_info------------------->>>>>>>>>>>",
        //   query_client_info
        // );
        const findedjobs = await Job.aggregate([
          {
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
          },
          {
            $match: queryAll,
          },
          {
            $skip: filter["jobs_per_page"] * (filter["page_index"] - 1),
          },
          {
            $limit: filter["jobs_per_page"],
          },
        ]);

        return response.response({ status: "ok", data: findedjobs }).code(200);
      } catch (error) {
        return response.response({ status: "err", err: error }).code(501);
      }
    },
  },
  {
    method: "PATCH",
    path: "/{jobId}/invite/{expertId}",
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
        const currentDate = new Date().toUTCString();
        console.log(
          `PATCH api/v1/job/${request.params.jobId}/invite/${request.params.expertId} request from
           ${request.auth.credentials.email} Time: ${currentDate}`
        );

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
          account: request.params.expertId,
        }).populate("account", ["first_name", "last_name"]);
        if (!expert) {
          return response
            .response({ status: "err", err: "Expert does not exist" })
            .code(404);
        }

        // check already invited
        const isAreadyInvited = await Job.findOne({
          _id: request.params.jobId,
          client_email: account.email,
          "invited_expert.id": expert.account._id,
        });
        if (isAreadyInvited) {
          return response
            .response({ status: "err", err: "Expert already invited!" })
            .code(409);
        }

        console.log("expert------------------>>>>>>>>>>>>>>>>>>>", expert);
        let inviteExpertToJob;
        const data = request.payload;

        try {
          const inviteExpertField = {
            id: request.params.expertId,
            first_name: expert.account.first_name,
            last_name: expert.account.last_name,
            type: data["type"],
            content: data["content"],
          };
          inviteExpertToJob = await Job.findOneAndUpdate(
            {
              _id: request.params.jobId,
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
          .response({ status: "ok", data: inviteExpertToJob })
          .code(201);
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
        console.log(
          `POST api/v1/job/${request.params.jobId}/recommendedExperts request from ${request.auth.credentials.email} Time: ${currentDate}`
        );

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

        const queryAll = {};
        if (job.skill_set.length) queryAll["skills"] = { $in: job.skill_set };
        console.log("queryAll------------------->>>>>>>>>>>>>>>>", queryAll);

        const findExperts = await Expert.aggregate([
          {
            $lookup: {
              from: "accounts",
              localField: "account",
              foreignField: "_id",
              as: "accountData",
              pipeline: [
                {
                  $project: {
                    first_name: 1,
                    last_name: 1,
                  },
                },
              ],
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
        console.log(
          `GET api/v1/job/all-categories request from ${request.auth.credentials.email} Time: ${currentDate}`
        );
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
