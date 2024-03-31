import { Request, ResponseToolkit } from "@hapi/hapi";
import {
  ProfileSwagger,
  deleteProfileSwagger,
  getProfileSwagger,
  updateAvatarSwagger,
  updatePaymentInfoSwagger,
  updatePersonalInfoSwagger,
  updateSocialMediaSwagger,
  updateSummarySwagger,
} from "../../swagger/profile/client";
import {
  ProfileSchema,
  updateAvatarSchema,
  updatePaymentInfoSchema,
  updatePersonalInfoSchema,
  updateSocialMediaSchema,
  updateSummarySchema,
} from "../../validation/profile/client";
import Account from "../../models/account";
import Client from "../../models/profile/client";

const options = { abortEarly: false, stripUnknown: true };

export let clientRoute = [
  {
    method: "POST",
    path: "/",
    options: {
      auth: "jwt",
      description: "Create client profile",
      plugins: ProfileSwagger,
      tags: ["api", "client"],
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

        // Check account type
        if (account.account_type !== "client") {
          return response
            .response({ status: "err", err: "Not allowed" })
            .code(403);
        }

        const data = request.payload;

        let birthday: Date = new Date("<yyyy-mm-dd>");
        birthday = data["birthday"];

        const clientField = {
          account: account.id,
          email: account.email,
          avatar: data["avatar"] ?? null,
          birthday: birthday,
          country: data["country"],
          state: data["state"] ?? null,
          city: data["city"] ?? null,
          address: data["address"],
          languages: data["languages"],
          summary: data["summary"],
          social_media: data["social_media"] ?? null,
          payment_verify: data["payment_verify"] ?? null,
          payment_info: data["payment_info"] ?? null,
        };

        // const client = await Client.findOneAndUpdate(
        //   { account: account.id },
        //   { $set: clientField },
        //   { new: true, upsert: true, setDefaultOnInsert: true }
        // );

        // Check whether client profile already exists
        const clientExist = await Client.findOne({
          account: request.auth.credentials.accountId,
        });

        if (clientExist)
          return response
            .response({ status: "err", err: "already exists" })
            .code(403);

        const client = new Client(clientField);
        await client.save();

        const responseData = await client.populate("account", [
          "firt_name",
          "last_name",
          "email",
        ]);

        // return response.response({ status: 'ok', data: 'Profile created successfully' }).code(201);
        return response
          .response({ status: "ok", data: responseData })
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
      description: "Get client profile",
      plugins: getProfileSwagger,
      tags: ["api", "client"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {

        const client = await Client.findOne({
          account: request.auth.credentials.accountId,
        });
        if (!client) {
          return response
            .response({ status: "err", err: "Profile not found!" })
            .code(404);
        }
        const responseData = await client.populate("account", [
          "first_name",
          "last_name",
        ]);

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
    path: "/summary",
    options: {
      auth: "jwt",
      description: "Update client summary",
      plugins: updateSummarySwagger,
      tags: ["api", "client"],
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
        const client = await Client.findOneAndUpdate(
          { account: account.id },
          {
            $set: {
              summary: data["summary"],
            },
          }
        );

        const responseData = await Client.findOne({
          account: request.auth.credentials.accountId,
        }).populate("account", ["first_name", "last_name", "email"]);


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
    path: "/avatar",
    options: {
      auth: "jwt",
      description: "Update client avatar",
      plugins: updateAvatarSwagger,
      tags: ["api", "client"],
      validate: {
        payload: updateAvatarSchema,
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

        const client = await Client.findOneAndUpdate(
          { account: account.id },
          {
            $set: {
              avatar: data["avatar"],
            },
          }
        );

        const responseData = await Client.findOne({
          account: request.auth.credentials.accountId,
        }).populate("account", ["first_name", "last_name", "email"]);

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
    path: "/personal-info",
    options: {
      auth: "jwt",
      description: "Update client personal information",
      plugins: updatePersonalInfoSwagger,
      tags: ["api", "client"],
      validate: {
        payload: updatePersonalInfoSchema,
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
          country: data["country"],
          state: data["state"] ?? null,
          city: data["city"] ?? null,
          address: data["address"],
          languages: data["languages"],
        };

        const client = await Client.findOneAndUpdate(
          { account: account.id },
          {
            $set: updateData,
          }
        );

        const responseData = await Client.findOne({
          account: request.auth.credentials.accountId,
        }).populate("account", ["first_name", "last_name", "email"]);


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
    path: "/social-media",
    options: {
      auth: "jwt",
      description: "Update client social media",
      plugins: updateSocialMediaSwagger,
      tags: ["api", "client"],
      validate: {
        payload: updateSocialMediaSchema,
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
          social_media: data["social_media"],
        };

        const client = await Client.findOneAndUpdate(
          { account: account.id },
          {
            $set: updateData,
          }
        );

        const responseData = await Client.findOne({
          account: request.auth.credentials.accountId,
        }).populate("account", ["first_name", "last_name", "email"]);


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
    path: "/payment-info",
    options: {
      auth: "jwt",
      description: "Update client payment information",
      plugins: updatePaymentInfoSwagger,
      tags: ["api", "client"],
      validate: {
        payload: updatePaymentInfoSchema,
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
          payment_info: data["payment_info"],
        };

        const client = await Client.findOneAndUpdate(
          { account: account.id },
          {
            $set: updateData,
          }
        );

        const responseData = await Client.findOne({
          account: request.auth.credentials.accountId,
        }).populate("account", ["first_name", "last_name", "email"]);


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
    path: "/",
    options: {
      auth: "jwt",
      description: "Delete client profile",
      plugins: deleteProfileSwagger,
      tags: ["api", "client"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {

        const deleteStatus = await Client.deleteOne({
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
];
