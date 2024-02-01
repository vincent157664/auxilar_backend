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
    // config: {
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
        console.log(
          `POST api/v1/expert request from ${request.auth.credentials.email}`
        );
        const account = await Account.findById(
          request.auth.credentials.accountId
        );
        // check account type
        if (account.account_type !== "expert") {
          return response
            .response({ status: "err", err: "Not allowed expert profile!" })
            .code(403);
        }
        console.log(account);

        const data = request.payload;
        console.log("data---------------", data);

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
        };

        // data["state"] ? (expertField["state"] = data["state"]) : null;
        // data["city"] ? (expertField["city"] = data["city"]) : null;

        // const expert = await Expert.findOneAndUpdate(
        //   { account: account.id },
        //   { $set: expertField },
        //   { new: true, upsert: true, setDefaultsOnInsert: true }
        // );

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
        console.log(`response data : ${responseData}`);

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
        console.log(
          `GET api/v1/expert/ request from ${request.auth.credentials.email}`
        );
        const expert = await Expert.findOne({
          account: request.auth.credentials.accountId,
        });
        if (!expert) {
          console.log("Profile not found!");
          return response
            .response({ status: "err", err: "Profile not found!" })
            .code(404);
        }

        // const responseData = await expert
        // .populate("account", ["first_name", "last_name", "email"])
        // .select("-ongoing_project");

        const responseData = await Expert.findOne({
          account: request.auth.credentials.accountId,
        })
          .populate("account", ["first_name", "last_name"])
          .select("-ongoing_project");

        // const responseData = expert;
        console.log("request success");
        console.log(`response data : ${responseData}`);
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
        console.log(
          `PUT api/v1/expert/person-info request from ${request.auth.credentials.email}`
        );
        const account = await Account.findById(
          request.auth.credentials.accountId
        );
        console.log(account);

        const data = request.payload;
        console.log("data---------------", data);

        const expert = await Expert.findOneAndUpdate(
          { account: account.id },
          {
            $set: {
              avatar: data["avatar"],
              hourly_rate: data["hourly_rate"],
            },
          }
        );
        // await expert.save();

        // const responseData = await expert.populate("account", [
        //   "first_name",
        //   "last_name",
        //   "email",
        // ]);

        // const responseData = await Expert.findOne({
        //   account: request.auth.credentials.accountId,
        // })
        //   .populate("account", ["first_name", "last_name", "email"])
        //   .select("-ongoing_project");

        const responseData = await Expert.findOne({
          account: request.auth.credentials.accountId,
        }).select("avatar hourly_rate");

        console.log(`response data : ${responseData}`);

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
        console.log(
          `PUT api/v1/expert/summary request from ${request.auth.credentials.email}`
        );
        const account = await Account.findById(
          request.auth.credentials.accountId
        );
        console.log(account);

        const data = request.payload;
        console.log("data---------------", data);

        const expert = await Expert.findOneAndUpdate(
          { account: account.id },
          {
            $set: {
              summary: data["summary"],
            },
          }
        );
        // await expert.save();

        // const responseData = await expert.populate("account", [
        //   "first_name",
        //   "last_name",
        //   "email",
        // ]);

        const responseData = await Expert.findOne({
          account: request.auth.credentials.accountId,
        })
          .populate("account", ["first_name", "last_name", "email"])
          .select("-ongoing_project");

        // const responseData = await Expert.findOne({
        //   account: request.auth.credentials.accountId,
        // }).select("summary");

        console.log(`response data : ${responseData}`);

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
        console.log(
          `PUT api/v1/expert/portfolio request from ${request.auth.credentials.email}`
        );
        const account = await Account.findById(
          request.auth.credentials.accountId
        );
        console.log(account);

        const data = request.payload;
        console.log("data---------------", data);

        const expert = await Expert.findOneAndUpdate(
          { account: account.id },
          {
            $set: {
              portfolios: data["portfolios"],
            },
          }
        );

        // await expert.save();

        console.log("expert--------------", expert);
        // const responseData = await expert.populate("account", [
        //   "first_name",
        //   "last_name",
        //   "email",
        // ]);

        const responseData = await Expert.findOne({
          account: request.auth.credentials.accountId,
        })
          .populate("account", ["first_name", "last_name", "email"])
          .select("-ongoing_project");

        // const responseData = await Expert.findOne({
        //   account: request.auth.credentials.accountId,
        // }).select("portfolios");

        console.log(`response data : ${responseData}`);

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
        console.log(
          `PUT api/v1/expert/portfolio/${request.params.portfolio_id} from ${request.auth.credentials.email}`
        );

        const account = await Account.findById(
          request.auth.credentials.accountId
        );
        console.log(account);

        const data = request.payload;

        console.log("data ----------------->", data);
        console.log(`portfolio_id : ${request.params.portfolio_id}`);

        // const portfolioItem = await Expert.findOne({
        //   account: request.auth.credentials.accountId,
        // })
        //   .select("portfolios");
        // .findOne({
        //    "portfolios._id": request.params.portfolio_id
        // });

        await Expert.findOneAndUpdate(
          {
            account: account.id,
            "portfolios._id": request.params.portfolio_id,
          },
          {
            $set: {
              "portfolios.$.text": data["text"],
              "portfolios.$.content": data["content"],
            },
          },
          {
            new: true,
            useFindAndModify: false,
          }
        ).then((res) => {
          console.log("Updated data", res);
        });

        // .findOne({ "portfolios._id": request.params.portfolio_id });

        // const result = portfolioItem.portfolios.map((item) => String(item._id) === String(request.params.portfolio_id));

        // console.log('--->>>>', result);
        // console.log(portfolioItem);

        // await portfolioItem.save();

        const responseData = await Expert.findOne({ account: account.id });

        console.log(`response data : ${responseData}`);

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
        console.log(
          `DELETE api/v1/expert/portfolio/${request.params.portfolio_id} from ${request.auth.credentials.email}`
        );

        const account = await Account.findById(
          request.auth.credentials.accountId
        );
        console.log(account);

        const data = request.payload;

        console.log("data ----------------->", data);
        console.log(`portfolio_id : ${request.params.portfolio_id}`);

        // const portfolioItem = await Expert.findOne({
        //   account: request.auth.credentials.accountId,
        // })
        //   .select("portfolios");
        // .findOne({
        //    "portfolios._id": request.params.portfolio_id
        // });

        await Expert.findOneAndUpdate(
          {
            account: account.id,
          },
          // {
          //   $unset: {
          //     "portfolios.$._id": request.params.portfolio_id,
          //   },
          // }
          { $pull: { portfolios: { _id: request.params.portfolio_id } } }
        ).then((res) => {
          console.log("Updated data", res);
        });

        // .findOne({ "portfolios._id": request.params.portfolio_id });

        // const result = portfolioItem.portfolios.map((item) => String(item._id) === String(request.params.portfolio_id));

        // console.log('--->>>>', result);
        // console.log(portfolioItem);

        // await portfolioItem.save();

        const responseData = await Expert.findOne({ account: account.id });

        console.log(`response data : ${responseData}`);

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
        console.log(
          `PUT api/v1/expert/portfolio/additem from ${request.auth.credentials.email}`
        );

        const account = await Account.findById(
          request.auth.credentials.accountId
        );
        console.log(account);

        const data = request.payload;

        console.log("data ----------------->", data);

        // const portfolioItem = await Expert.findOne({
        //   account: request.auth.credentials.accountId,
        // })
        //   .select("portfolios");
        // .findOne({
        //    "portfolios._id": request.params.portfolio_id
        // });

        await Expert.updateOne(
          {
            account: account.id,
          },
          {
            $addToSet: {
              portfolios: {
                content: data["content"],
                text: data["text"],
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

        // .findOne({ "portfolios._id": request.params.portfolio_id });

        // const result = portfolioItem.portfolios.map((item) => String(item._id) === String(request.params.portfolio_id));

        // console.log('--->>>>', result);
        // console.log(portfolioItem);

        // await portfolioItem.save();

        const responseData = await Expert.findOne({ account: account.id });

        console.log(`response data : ${responseData}`);

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
        console.log(
          `PUT api/v1/expert/verifier request from ${request.auth.credentials.email}`
        );
        const account = await Account.findById(
          request.auth.credentials.accountId
        );
        console.log(account);

        const data = request.payload;
        console.log("data---------------", data);

        const expert = await Expert.findOneAndUpdate(
          { account: account.id },
          {
            $set: {
              verified_by: data["verified_by"],
            },
          }
        );

        // await expert.save();

        // const responseData = await expert.populate("account", [
        //   "first_name",
        //   "last_name",
        //   "email",
        // ]);

        // const responseData = await Expert.findOne({
        //   account: request.auth.credentials.accountId,
        // })
        //   .populate("account", ["first_name", "last_name", "email"])
        //   .select("-ongoing_project");

        const responseData = await Expert.findOne({
          account: request.auth.credentials.accountId,
        }).select("verified_by");

        console.log(`response data : ${responseData}`);

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
        console.log(
          `PUT api/v1/expert/resume request from ${request.auth.credentials.email}`
        );
        const account = await Account.findById(
          request.auth.credentials.accountId
        );
        console.log(account);

        const data = request.payload;
        console.log("data---------------", data);

        const expert = await Expert.findOneAndUpdate(
          { account: account.id },
          {
            $set: {
              resume: data["resume"],
            },
          }
        );

        // await expert.save();

        // const responseData = await expert.populate("account", [
        //   "first_name",
        //   "last_name",
        //   "email",
        // ]);

        // const responseData = await Expert.findOne({
        //   account: request.auth.credentials.accountId,
        // })
        //   .populate("account", ["first_name", "last_name", "email"])
        //   .select("-ongoing_project");

        const responseData = await Expert.findOne({
          account: request.auth.credentials.accountId,
        }).select("resume");

        console.log(`response data : ${responseData}`);

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
        console.log(
          `PUT api/v1/expert/person-detail request from ${request.auth.credentials.email}`
        );
        const account = await Account.findById(
          request.auth.credentials.accountId
        );
        console.log(account);

        const data = request.payload;
        console.log("data---------------", data);

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

        // await expert.save();

        // const responseData = await expert.populate("account", [
        //   "first_name",
        //   "last_name",
        //   "email",
        // ]);

        const responseData = await Expert.findOne({
          account: request.auth.credentials.accountId,
        })
          .populate("account", ["first_name", "last_name", "email"])
          .select("-ongoing_project");

        // const responseData = await Expert.findOne({
        //   account: request.auth.credentials.accountId,
        // }).select(
        //   "address post_number languages skills majors reviews active_status profile_links linkedin"
        // );

        console.log(`response data : ${responseData}`);

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
        console.log(
          `PUT api/v1/expert/education request from ${request.auth.credentials.email}`
        );
        const account = await Account.findById(
          request.auth.credentials.accountId
        );
        console.log(account);

        const data = request.payload;
        console.log("data---------------", data);

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

        console.log(`response data : ${responseData}`);

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
        console.log(
          `DELETE api/v1/expert request from ${request.auth.credentials.email}`
        );
        const deleteStatus = await Expert.deleteOne({
          account: request.auth.credentials.accountId,
        });
        console.log("delete result ----------->", deleteStatus);
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
        console.log(
          `POST api/v1/expert/findExperts request from ${request.auth.credentials.email} Time: ${currentDate}`
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

        const data = request.payload;
        const queryAll = {};
        if (data["skills"].length) queryAll["skills"] = { $in: data["skills"] };
        if (data["majors"].length) queryAll["majors"] = { $in: data["majors"] };
        console.log(
          "queryAll------------------->>>>>>>>>>>>>>>>",
          data["majors"]
        );
        if (data["email"]) queryAll["email"] = data["email"];
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
    path: "/all-skills",
    options: {
      auth: "jwt",
      description: "Get all recorded Skills",
      plugins: getAllSkills,
      tags: ["api", "expert"],
    },

    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        console.log(
          `GET api/v1/expert/all-skills request from ${request.auth.credentials.email}`
        );
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
        console.log(
          `GET api/v1/expert/all-majors request from ${request.auth.credentials.email}`
        );
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
