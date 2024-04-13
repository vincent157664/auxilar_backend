import { Request, ResponseToolkit } from "@hapi/hapi";
// import Jwt from 'jsonwebtoken';
// import bcrypt from 'bcrypt';
// import fs from 'fs';
// import { Path } from "mongoose";
// import process from "process";

import Account from "../../models/account";
// import config from '../config';
import {
  ProfileSwagger,
  addPortfolioItemSwagger,
  deletePortfolioItemSwagger,
  deleteProfileSwagger,
  findExpertSwagger,
  getProfileSwagger,
  updateBaseInfoSwagger,
  updateEducationSwagger,
  updatePersonDetailSwagger,
  updatePortfolioItemSwagger,
  updatePortfolioSwagger,
  updateResumeSwagger,
  updateSummarySwagger,
  updateVerifierSwagger,
} from "../../swagger/profile/expert";
import {
  ProfileSchema,
  addPortfolioItemSchema,
  findExpertSchema,
  updateBaseInfoSchema,
  updateEducationSchema,
  updatePersonDetailSchema,
  updatePortfolioItemSchema,
  updatePortfolioSchema,
  updateResumeSchema,
  updateSummarySchema,
  updateVerifierSchema,
} from "../../validation/profile/expert";
import Expert from "../../models/profile/expert";
import { getAllSkills } from "../../swagger/skill";
import Skill from "../../models/skill";
import Major from "../../models/major";

const options = { abortEarly: false, stripUnknown: true };

export let expertRoute = [
  {
    method: "POST",
    path: "/",
    options: {
      auth: "jwt",
      description: "Create  expert profile",
      plugins: ProfileSwagger,
      tags: ["api", "expert"],
      validate: {
        payload: ProfileSchema,
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
        const account = await Account.findById(
          request.auth.credentials.accountId
        );
        // check account type
        if (account.account_type !== "expert") {
          return response
            .response({ status: "err", err: "Not allowed expert profile!" })
            .code(403);
        }

        const data = request.payload;

        const expertField = {
          account: account.id,
          email: account.email,
          address: data["address"],
          country: data["country"],
          state: data["state"] ?? null,
          city: data["city"] ?? null,
          languages: data["languages"],
          avatar: data["avatar"],
          hourly_rate: data["hourly_rate"],
          summary: data["summary"],
          verified_by: data["verified_by"],
          portfolios: data["portfolios"],
          skills: data["skills"],
          majors: data["majors"],
          // notification_preferences: data['notification_preferences'] ?? null,
          resume: data["resume"],
          profile_links: data["profile_links"],
          linkedin: data["linkedin"],
          education: data["education"],
          certification: data["certification"],
        };

        const expertExist = await Expert.findOne({
          account: request.auth.credentials.accountId,
        });

        if (expertExist)
          return response
            .response({ status: "err", err: "already exists" })
            .code(403);

        const expert = new Expert(expertField);
        await expert.save();

        const responseData = await expert.populate("account", [
          "first_name",
          "last_name",
          "email",
        ]);
        return response
          .response({ status: "ok", data: "Profile created successfully" })
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
      description: "Get expert profile",
      plugins: getProfileSwagger,
      tags: ["api", "expert"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const expert = await Expert.findOne({
          account: request.auth.credentials.accountId,
        });
        if (!expert) {
          return response
            .response({ status: "err", err: "Profile not found!" })
            .code(404);
        }

        const responseData = await Expert.findOne({
          account: request.auth.credentials.accountId,
        })
          .populate("account", ["first_name", "last_name"])
          .select("-ongoing_project");

        return response
          .response({ status: "ok", data: responseData })
          .code(200);
      } catch (error) {
        return response.response({ status: "err", err: error }).code(501);
      }
    },
  },

  {
    method: "PUT",
    path: "/person-info",
    options: {
      auth: "jwt",
      description: "Update expert base info",
      plugins: updateBaseInfoSwagger,
      tags: ["api", "expert"],
      validate: {
        payload: updateBaseInfoSchema,
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
        const account = await Account.findById(
          request.auth.credentials.accountId
        );

        const data = request.payload;

        const expert = await Expert.findOneAndUpdate(
          { account: account.id },
          {
            $set: {
              avatar: data["avatar"],
              titleName: data["titleName"],
              hourly_rate: data["hourly_rate"],
            },
          }
        );

        const responseData = await Expert.findOne({
          account: request.auth.credentials.accountId,
        }).select("avatar hourly_rate");

        return response.response({
          status: "ok",
          data: responseData,
        });
      } catch (error) {
        return response.response({ status: "err", err: error }).code(501);
      }
    },
  },

  {
    method: "PUT",
    path: "/summary",
    options: {
      auth: "jwt",
      description: "Update expert summary",
      plugins: updateSummarySwagger,
      tags: ["api", "expert"],
      validate: {
        payload: updateSummarySchema,
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
        const account = await Account.findById(
          request.auth.credentials.accountId
        );

        const data = request.payload;

        const expert = await Expert.findOneAndUpdate(
          { account: account.id },
          {
            $set: {
              summary: data["summary"],
            },
          }
        );

        const responseData = await Expert.findOne({
          account: request.auth.credentials.accountId,
        })
          .populate("account", ["first_name", "last_name", "email"])
          .select("-ongoing_project");

        return response.response({
          status: "ok",
          // data: "Profile updated successfully",
          data: responseData,
        });
      } catch (error) {
        return response.response({ status: "err", err: error }).code(501);
      }
    },
  },

  {
    method: "PUT",
    path: "/portfolio",
    options: {
      auth: "jwt",
      description: "Update expert portfolio",
      plugins: updatePortfolioSwagger,
      tags: ["api", "expert"],
      validate: {
        payload: updatePortfolioSchema,
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
        const account = await Account.findById(
          request.auth.credentials.accountId
        );

        const data = request.payload;

        const expert = await Expert.findOneAndUpdate(
          { account: account.id },
          {
            $set: {
              portfolios: data["portfolios"],
            },
          }
        );

        const responseData = await Expert.findOne({
          account: request.auth.credentials.accountId,
        })
          .populate("account", ["first_name", "last_name", "email"])
          .select("-ongoing_project");

        return response.response({
          status: "ok",
          // data: "Profile updated successfully",
          data: responseData,
        });
      } catch (error) {
        return response.response({ status: "err", err: error }).code(501);
      }
    },
  },

  {
    method: "PUT",
    path: "/portfolio/{portfolio_id}",
    options: {
      auth: "jwt",
      description: "Update expert portfolio indiviually",
      plugins: updatePortfolioItemSwagger,
      tags: ["api", "expert"],
      validate: {
        payload: updatePortfolioItemSchema,
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
        const account = await Account.findById(
          request.auth.credentials.accountId
        );

        const data = request.payload;

        await Expert.findOneAndUpdate(
          {
            account: account.id,
            "portfolios._id": request.params.portfolio_id,
          },
          {
            $set: {
              "portfolios.$.text": data["text"],
              "portfolios.$.content": data["content"],
              "portfolios.$.link": data["link"],
            },
          },
          {
            new: true,
            useFindAndModify: false,
          }
        ).then((res) => {
          console.log("Updated data", res);
        });

        const responseData = await Expert.findOne({ account: account.id });

        return response.response({
          status: "ok",
          // data: "Profile updated successfully",
          data: responseData,
        });
      } catch (error) {
        return response.response({ status: "err", err: error }).code(501);
      }
    },
  },

  {
    method: "DELETE",
    path: "/portfolio/{portfolio_id}",
    options: {
      auth: "jwt",
      description: "Delete expert portfolio indiviually",
      plugins: deletePortfolioItemSwagger,
      tags: ["api", "expert"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const account = await Account.findById(
          request.auth.credentials.accountId
        );

        const data = request.payload;

        await Expert.findOneAndUpdate(
          {
            account: account.id,
          },
          { $pull: { portfolios: { _id: request.params.portfolio_id } } }
        ).then((res) => {});

        const responseData = await Expert.findOne({ account: account.id });

        return response.response({
          status: "ok",
          // data: "Profile updated successfully",
          data: responseData,
        });
      } catch (error) {
        return response.response({ status: "err", err: error }).code(501);
      }
    },
  },

  {
    method: "PUT",
    path: "/portfolio/additem",
    options: {
      auth: "jwt",
      description: "Update expert portfolio indiviually",
      plugins: addPortfolioItemSwagger,
      tags: ["api", "expert"],
      validate: {
        payload: addPortfolioItemSchema,
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
        const account = await Account.findById(
          request.auth.credentials.accountId
        );

        const data = request.payload;

        await Expert.updateOne(
          {
            account: account.id,
          },
          {
            $addToSet: {
              portfolios: {
                content: data["content"],
                text: data["text"],
                link: data["link"],
              },
            },
          },
          {
            new: true,
            useFindAndModify: false,
          }
        ).then((res) => {
          console.log("Updated data", res);
        });

        const responseData = await Expert.findOne({ account: account.id });

        return response.response({
          status: "ok",
          // data: "Profile updated successfully",
          data: responseData,
        });
      } catch (error) {
        return response.response({ status: "err", err: error }).code(501);
      }
    },
  },

  {
    method: "PUT",
    path: "/verifier",
    options: {
      auth: "jwt",
      description: "Update expert verifier",
      plugins: updateVerifierSwagger,
      tags: ["api", "expert"],
      validate: {
        payload: updateVerifierSchema,
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
        const account = await Account.findById(
          request.auth.credentials.accountId
        );

        const data = request.payload;
        const expert = await Expert.findOneAndUpdate(
          { account: account.id },
          {
            $set: {
              verified_by: data["verified_by"],
            },
          }
        );

        const responseData = await Expert.findOne({
          account: request.auth.credentials.accountId,
        }).select("verified_by");

        return response.response({
          status: "ok",
          // data: "Profile updated successfully",
          data: responseData,
        });
      } catch (error) {
        return response.response({ status: "err", err: error }).code(501);
      }
    },
  },

  {
    method: "PUT",
    path: "/resume",
    options: {
      auth: "jwt",
      description: "Update expert resume",
      plugins: updateResumeSwagger,
      tags: ["api", "expert"],
      validate: {
        payload: updateResumeSchema,
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
        const account = await Account.findById(
          request.auth.credentials.accountId
        );

        const data = request.payload;

        const expert = await Expert.findOneAndUpdate(
          { account: account.id },
          {
            $set: {
              resume: data["resume"],
            },
          }
        );

        const responseData = await Expert.findOne({
          account: request.auth.credentials.accountId,
        }).select("resume");

        return response.response({
          status: "ok",
          // data: "Profile updated successfully",
          data: responseData,
        });
      } catch (error) {
        return response.response({ status: "err", err: error }).code(501);
      }
    },
  },

  {
    method: "PUT",
    path: "/person-detail",
    options: {
      auth: "jwt",
      description: "Update expert person-detail",
      plugins: updatePersonDetailSwagger,
      tags: ["api", "expert"],
      validate: {
        payload: updatePersonDetailSchema,
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
        const account = await Account.findById(
          request.auth.credentials.accountId
        );

        const data = request.payload;

        const updateData = {
          address: data["address"],
          country: data["country"],
          languages: data["languages"],
          skills: data["skills"],
          majors: data["majors"],
          state: data["state"] ?? null,
          city: data["city"] ?? null,
          // notification_preferences: data["notification_preferences"] ?? null,
          // reviews: data["reviews"] ?? null,
          active_status: data["active_status"],
          // account_status: data["account_status"] ?? null,
          // profile_links: data["profile_links"] ?? null,
          // linkedin: data["linkedin"] ?? null,
        };

        const expert = await Expert.findOneAndUpdate(
          { account: account.id },
          {
            $set: updateData,
          },
          { new: true }
        );

        // data["state"]
        //   ? (expert["state"] = data["state"])
        //   : (expert["state"] = null);
        // data["city"]
        //   ? (expert["city"] = data["city"])
        //   : (expert["city"] = null);

        const responseData = await Expert.findOne({
          account: request.auth.credentials.accountId,
        })
          .populate("account", ["first_name", "last_name", "email"])
          .select("-ongoing_project");

        return response.response({
          status: "ok",
          // data: "Profile updated successfully",
          data: responseData,
        });
      } catch (error) {
        return response.response({ status: "err", err: error }).code(501);
      }
    },
  },

  {
    method: "PUT",
    path: "/education",
    options: {
      auth: "jwt",
      description: "Update expert education",
      plugins: updateEducationSwagger,
      tags: ["api", "expert"],
      validate: {
        payload: updateEducationSchema,
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
        const account = await Account.findById(
          request.auth.credentials.accountId
        );

        const data = request.payload;
        const updateData = {
          education: data["education"],
        };

        const expert = await Expert.findOneAndUpdate(
          { account: account.id },
          {
            $set: updateData,
          }
        );

        const responseData = await Expert.findOne({
          account: request.auth.credentials.accountId,
        })
          .populate("account", ["first_name", "last_name", "email"])
          .select("-ongoing_project");

        return response.response({
          status: "ok",
          data: responseData,
        });
      } catch (error) {
        return response.response({ status: "err", err: error }).code(501);
      }
    },
  },

  {
    method: "DELETE",
    path: "/",
    options: {
      auth: "jwt",
      description: "Delete expert profile",
      plugins: deleteProfileSwagger,
      tags: ["api", "expert"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const deleteStatus = await Expert.deleteOne({
          account: request.auth.credentials.accountId,
        });
        if (deleteStatus.deletedCount)
          return response
            .response({ status: "ok", data: "Successfuly deleted!" })
            .code(200);
        else
          return response
            .response({ status: "err", err: "Profile not found!" })
            .code(404);
      } catch (error) {
        return response.response({ status: "err", err: error }).code(501);
      }
    },
  },

  {
    method: "POST",
    path: "/findExperts",
    options: {
      auth: "jwt",
      description: "Find expert",
      plugins: findExpertSwagger,
      tags: ["api", "expert"],
      validate: {
        payload: findExpertSchema,
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

        const data = request.payload;
        const queryAll = {};
        if (data["skills"].length) queryAll["skills"] = { $in: data["skills"] };
        if (data["majors"].length) queryAll["majors"] = { $in: data["majors"] };
        if (data["email"]) queryAll["email"] = data["email"];

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
          .response({
            status: "err",
            err: "Sorry, something went wrong. Please refresh the page and try again.!",
          })
          .code(501);
      }
    },
  },

  {
    method: "GET",
    path: "/all-skills",
    options: {
      auth: "jwt",
      description: "Get all recorded Skills",
      plugins: getAllSkills,
      tags: ["api", "expert"],
    },

    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const allSkills = await Skill.find();
        if (!allSkills) {
          return response
            .response({ status: "err", err: "Recorded skill not found!" })
            .code(404);
        }
        return response.response({ status: "ok", data: allSkills }).code(200);
      } catch (error) {
        return response.response({ status: "err", err: error }).code(501);
      }
    },
  },

  {
    method: "GET",
    path: "/all-majors",
    options: {
      auth: "jwt",
      description: "Get all recorded Majors",
      plugins: getAllSkills,
      tags: ["api", "expert"],
    },

    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const allMajors = await Major.find();
        if (!allMajors) {
          return response
            .response({ status: "err", err: "Recorded major not found!" })
            .code(404);
        }
        return response.response({ status: "ok", data: allMajors }).code(200);
      } catch (error) {
        return response.response({ status: "err", err: error }).code(501);
      }
    },
  },
];
