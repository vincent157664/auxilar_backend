import { Request, ResponseToolkit } from "@hapi/hapi";
const Joi = require("joi");
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
  updateAvatarSchema,
  updatePaymentInfoSchema,
  updatePersonalInfoSchema,
  updateProfessionalInfoSchema,
  updateSocialMediaSchema,
  updateSummarySchema,
} from "../../validation/profile/mentor";
import Account from "../../models/account";
import Mentor from "../../models/profile/mentor";
import mongoose from "mongoose";
import { any, string } from "joi";

const options = { abortEarly: false, stripUnknown: true };
const ProfileSchema = Joi.object({
  avatar: Joi.string(),

  country: Joi.string().required().messages({
    "any.required": "Please provide country",
  }),

  state: Joi.string().allow(null).allow(""),

  city: Joi.string().allow(null).allow(""),

  address: Joi.string().required().messages({
    "any.required": "Please provide address.",
  }),

  languages: Joi.array().required().messages({
    "any.required": "Please provide languages",
  }),

  summary: Joi.string().required().messages({
    "any.required": "Please provide summary",
  }),

  social_media: Joi.object(),

  payment_verify: Joi.boolean(),
  payment_info: Joi.object(),

  professional_info: Joi.object().required().messages({
    "any.required": "Please provide professional information",
  }),
});

export let mentorRoute = [
  {
    method: "POST",
    path: "/",
    config: {
      auth: "jwt",
      description: "Creatre mentor profile",
      payload: {
        maxBytes: 10485760000,
        output: "stream",
        parse: true,
        allow: "multipart/form-data",
        multipart: { output: "stream" },
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

          const data = request?.payload;
          const mentorProfile = JSON.parse(data["mentorProfile"]);

          const mentorField = {
            account: account.id,
            email: account.email,
            avatar: mentorProfile["avatar"] ?? null,
            country: mentorProfile["country"],
            state: mentorProfile["state"] ?? null,
            city: mentorProfile["city"] ?? null,
            address: mentorProfile["address"],
            languages: mentorProfile["languages"],
            summary: mentorProfile["summary"],
            social_media: mentorProfile["social_media"] ?? null,
            payment_verify: mentorProfile["payment_verify"] ?? null,
            payment_info: mentorProfile["payment_info"] ?? null,
            professional_info: mentorProfile["professional_info"] ?? null,
          };

          console.log("mentorField ------>", mentorField);

          const mentorExist = await Mentor.findOne({
            account: request.auth.credentials.accountId,
          });

          if (mentorExist)
            return response
              .response({ status: "err", err: "already exists" })
              .code(403);

          const mentor = new Mentor(mentorField);
          await mentor.save();

          if (data["file"]) {
            data["file"].forEach(async (fileItem) => {
              const bucketdb = mongoose.connection.db;
              const bucket = new mongoose.mongo.GridFSBucket(bucketdb, {
                bucketName: "messageFiles",
              });

              const attached_file = fileItem;

              const uploadStream = bucket.openUploadStream(
                attached_file?.hapi?.filename
              );
              uploadStream.on("finish", async (file) => {
                //record attached_files info to database

                await Mentor.findOneAndUpdate(
                  { account: request.auth.credentials.accountId },
                  {
                    $set: {
                      resume: {
                        name: attached_file?.hapi?.filename,
                        file_id: file._id,
                      },
                    },
                  }
                );
              });

              await attached_file?.pipe(uploadStream);
            });
          }

          const responseData = await mentor.populate("account", [
            "firt_name",
            "last_name",
            "email",
          ]);

          return response
            .response({ status: "ok", data: responseData })
            .code(201);
        } catch (error) {
          console.log(error);
          return response.response({ status: "err", err: error }).code(501);
        }
      },
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
  {
    method: "POST",
    path: "/profile/upload",
    config: {
      auth: "jwt",
      description: "Upload resume or CV of mentor",
      payload: {
        maxBytes: 10485760000,
        output: "stream",
        parse: true,
        allow: "multipart/form-data",
        multipart: { output: "stream" },
      },
      validate: {
        payload: Joi.object({
          file: Joi.object().meta({ swaggerType: "file" }),
        }),
        failAction: (request, h, error) => {
          return h.response({ err: error.message }).code(400).takeover();
        },
      },
      handler: async (request: Request, response: ResponseToolkit) => {
        try {
          const data = request.payload;

          const bucketdb = mongoose.connection.db;
          const bucket = new mongoose.mongo.GridFSBucket(bucketdb, {
            bucketName: "messageFiles",
          });

          const attached_file = data["file"];

          const uploadStream = bucket.openUploadStream(
            attached_file.hapi.filename
          );
          uploadStream.on("finish", async (file) => {
            //record attached_files info to database

            await Mentor.findOneAndUpdate(
              { account: request.auth.credentials.accountId },
              {
                $set: {
                  resume: {
                    name: attached_file.hapi.filename,
                    file_id: file._id,
                  },
                },
              }
            );
          });

          await attached_file.pipe(uploadStream);

          const updatedMentor = await Mentor.find({
            account: request.auth.credentials.accountId,
          });
          return response
            .response({
              message: "Resume uploaded successfully",
              updatedMentor,
            })
            .code(201);
        } catch (error) {
          return response
            .response({ message: "File upload failed. Pleaes try again" })
            .code(500);
        }
      },
    },
  },
  {
    method: "GET",
    path: "/download/{fileId}",
    options: {
      auth: "jwt",
      description: "download message file",
      plugins: getProfileSwagger,
      tags: ["api", "proposal"],
    },
    handler: async (request: Request, h) => {
      try {
        const currentDate = new Date().toUTCString();

        const bucketdb = mongoose.connection.db;
        const bucket = new mongoose.mongo.GridFSBucket(bucketdb, {
          bucketName: "messageFiles",
        });

        const ObjectId = mongoose.Types.ObjectId;
        let mime = require("mime-types");
        let file = bucket.find({ _id: new ObjectId(request.params.fileId) });
        let filename;
        let contentType;
        for await (const docs of file) {
          filename = docs.filename;
          contentType = mime.contentType(docs.filename);
        }

        const downloadStream = bucket.openDownloadStream(
          new ObjectId(request.params.fileId)
        );
        return h
          .response(downloadStream)
          .header("Content-Type", contentType)
          .header("Content-Disposition", "attachment; filename= " + filename);
      } catch (err) {
        return h.response({ status: "err", err: "Download failed" }).code(501);
      }
    },
  },
];
