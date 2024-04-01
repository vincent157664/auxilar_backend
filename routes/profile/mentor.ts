import { Request, ResponseToolkit } from "@hapi/hapi";
import {
  ProfileSwagger,
  deleteProfileSwagger,
  getProfileSwagger,
  updateAvatarSwagger,
  updatePaymentInfoSwagger,
  updatePersonalInfoSwagger,
  updateProfessionalInfoSwagger,
  updateSocialMediaSwagger,
  updateSummarySwagger,
} from "../../swagger/profile/mentor";
import {
  ProfileSchema,
  updateAvatarSchema,
  updatePaymentInfoSchema,
  updatePersonalInfoSchema,
  updateProfessionalInfoSchema,
  updateSocialMediaSchema,
  updateSummarySchema,
} from "../../validation/profile/mentor";
import Account from "../../models/account";
import Mentor from "../../models/profile/mentor";

const options = { abortEarly: false, stripUnknown: true };

export let mentorRoute = [
  {
    method: "POST",
    path: "/",
    options: {
      auth: "jwt",
      description: "Create mentor profile",
      plugins: ProfileSwagger,
      tags: ["api", "mentor"],
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
        if (account.account_type !== "mentor") {
          return response
            .response({ status: "err", err: "Not allowed" })
            .code(403);
        }

        const data = request.payload;
        let birthday: Date = new Date("<yyyy-mm-dd>");
        birthday = data["birthday"];

        const mentorField = {
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
          professional_info: data["professional_info"] ?? null,
        };

        // const mentor = await Mentor.findOneAndUpdate(
        //   { account: account.id },
        //   { $set: mentorField },
        //   { new: true, upsert: true, setDefaultOnInsert: true }
        // );

        // Check whether mentor profile already exists
        const mentorExist = await Mentor.findOne({
          account: request.auth.credentials.accountId,
        });

        if (mentorExist)
          return response
            .response({ status: "err", err: "already exists" })
            .code(403);

        const mentor = new Mentor(mentorField);
        await mentor.save();

        const responseData = await mentor.populate("account", [
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
      description: "Get mentor profile",
      plugins: getProfileSwagger,
      tags: ["api", "mentor"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
     
        const mentor = await Mentor.findOne({
          account: request.auth.credentials.accountId,
        });
        if (!mentor) {
          return response
            .response({ status: "err", err: "Profile not found!" })
            .code(404);
        }
        const responseData = await mentor.populate("account", [
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
      description: "Update mentor summary",
      plugins: updateSummarySwagger,
      tags: ["api", "mentor"],
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
        const mentor = await Mentor.findOneAndUpdate(
          { account: account.id },
          {
            $set: {
              summary: data["summary"],
            },
          }
        );

        const responseData = await Mentor.findOne({
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
      description: "Update mentor avatar",
      plugins: updateAvatarSwagger,
      tags: ["api", "mentor"],
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

        const mentor = await Mentor.findOneAndUpdate(
          { account: account.id },
          {
            $set: {
              avatar: data["avatar"],
            },
          }
        );

        const responseData = await Mentor.findOne({
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
      description: "Update mentor personal information",
      plugins: updatePersonalInfoSwagger,
      tags: ["api", "mentor"],
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

        const mentor = await Mentor.findOneAndUpdate(
          { account: account.id },
          {
            $set: updateData,
          }
        );

        const responseData = await Mentor.findOne({
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
      description: "Update mentor social media",
      plugins: updateSocialMediaSwagger,
      tags: ["api", "mentor"],
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

        const mentor = await Mentor.findOneAndUpdate(
          { account: account.id },
          {
            $set: updateData,
          }
        );

        const responseData = await Mentor.findOne({
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
      description: "Update mentor payment information",
      plugins: updatePaymentInfoSwagger,
      tags: ["api", "mentor"],
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

        const mentor = await Mentor.findOneAndUpdate(
          { account: account.id },
          {
            $set: updateData,
          }
        );

        const responseData = await Mentor.findOne({
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
    path: "/professional-info",
    options: {
      auth: "jwt",
      description: "Update mentor professional information",
      plugins: updateProfessionalInfoSwagger,
      tags: ["api", "mentor"],
      validate: {
        payload: updateProfessionalInfoSchema,
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
          professional_info: data["professional_info"],
        };

        const mentor = await Mentor.findOneAndUpdate(
          { account: account.id },
          {
            $set: updateData,
          }
        );

        const responseData = await Mentor.findOne({
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
      description: "Delete mentor profile",
      plugins: deleteProfileSwagger,
      tags: ["api", "mentor"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        
        const deleteStatus = await Mentor.deleteOne({
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
