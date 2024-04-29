import { Request, ResponseToolkit } from "@hapi/hapi";
import {
  ConversationSwagger,
  deleteMessageSwagger,
  deleteMyConversationSwagger,
  downloadMessageFileSwagger,
  getAllConversationSwagger,
  getMessageSwagger,
  getMyConversationSwagger,
  putMessageToConversationSwagger,
  updateMessageSwagger,
} from "../swagger/converstaion";
import {
  ConversationSchema,
  putMessageToConversationSchema,
  readMessageSchema,
  updateMessageSchema,
} from "../validation/conversation";
import Account from "../models/account";
import Conversation from "../models/conversation";
import mongoose from "mongoose";
import Client from "../models/profile/client";
import Expert from "../models/profile/expert";
import Mentor from "../models/profile/mentor";
import { plugins } from "sol-merger";

const options = { abortEarly: false, stripUnknown: true };

export let conversationRoute = [
  {
    method: "POST",
    path: "/",
    options: {
      auth: "jwt",
      description: "Create a conversation",
      plugins: ConversationSwagger,
      tags: ["api", "conversation"],
      validate: {
        payload: ConversationSchema,
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

        // check account
        const account = await Account.findOne({
          email: request.auth.credentials.email,
        });

        // If account is expert return 403 error
        // if (account.account_type === "expert") {
        //   return response
        //     .response({ status: "err", err: "Forbidden request!" })
        //     .code(403);
        // }

        const data = request.payload;

        let conversationField;

        // check expert_id
        const expert = await Account.findById(data["expert_id"]);
        if (!expert) {
          return response
            .response({ status: "err", err: "expert does not exist" })
            .code(404);
        }

        // if account is client
        if (account.account_type === "client") {
          // check whether required fied such as job, proposal
          if (!(data["job"] && data["proposal"])) {
            return response
              .response({
                status: "err",
                err: "Job or proposal fields are empty",
              })
              .code(400);
          }

          // check whether conversation already exist
          const existConversation = await Conversation.findOne({
            client_id: account._id,
            expert_id: data["expert_id"],
          });

          if (existConversation) {
            return response
              .response({ status: "err", err: "Conversation already exist!" })
              .code(409);
          }

          // get client, expert avatar
          const client_profile = await Client.findOne({ account: account._id });
          const expert_profile = await Expert.findOne({ account: expert._id });

          // fill conversationField
          conversationField = {
            client_id: account._id,
            client_avatar: client_profile.avatar,
            expert_id: data["expert_id"],
            expert_avatar: expert_profile.avatar,
            job: data["job"],
            proposal: data["proposal"],
          };
        } else if (account.account_type === "mentor") {
          // check whether conversation already exist
          const existConversation = await Conversation.findOne({
            mentor_id: account._id,
            expert_id: data["expert_id"],
          });

          if (existConversation) {
            return response
              .response({ status: "err", err: "Conversation already exist!" })
              .code(409);
          }

          // get client, expert avatar
          const mentor_profile = await Mentor.findOne({ account: account._id });
          const expert_profile = await Expert.findOne({ account: expert._id });

          // fill conversationField
          conversationField = {
            expert_id: data["expert_id"],
            expert_avatar: expert_profile.avatar,
            mentor_id: account._id,
            mentor_avatar: mentor_profile.avatar,
          };
        }

        //create new conversation
        const newConversation = new Conversation(conversationField);
        await newConversation.save();

        return response
          .response({ status: "ok", data: newConversation })
          .code(201);
      } catch (err) {
        console.log(err);
        return response
          .response({ status: "err", err: "Creating conversation failed!" })
          .code(501);
      }
    },
  },
  {
    method: "GET",
    path: "/all",
    options: {
      auth: "jwt",
      description: "Get all conversations",
      plugins: getAllConversationSwagger,
      tags: ["api", "conversation"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();
        // check whether account is Admin
        const account = await Account.findOne({
          email: request.auth.credentials.email,
        });

        let allConversations;

        if (account.account_type === "admin") {
          // get entire conversations logged in databse
          allConversations = await Conversation.aggregate([
            {
              $lookup: {
                from: "accounts",
                localField: "client_id",
                foreignField: "_id",
                as: "client_info",
                pipeline: [
                  {
                    $project: {
                      _id: false,
                      first_name: 1,
                      last_name: 1,
                    },
                  },
                ],
              },
            },
            {
              $lookup: {
                from: "accounts",
                localField: "expert_id",
                foreignField: "_id",
                as: "expert_info",
                pipeline: [
                  {
                    $project: {
                      _id: false,
                      first_name: 1,
                      last_name: 1,
                    },
                  },
                ],
              },
            },
            {
              $lookup: {
                from: "accounts",
                localField: "mentor_id",
                foreignField: "_id",
                as: "mentor_info",
                pipeline: [
                  {
                    $project: {
                      _id: false,
                      first_name: 1,
                      last_name: 1,
                    },
                  },
                ],
              },
            },
          ]);
        } else if (account.account_type === "client") {
          // get all conversations associated with current client.
          allConversations = await Conversation.aggregate([
            {
              $match: {
                client_id: account._id,
              },
            },
            {
              $project: {
                mentor_id: 1,
                client_id: 1,
                expert_id: 1,
                client_avatar: 1,
                expert_avatar: 1,
                mentor_avatar: 1,
                "job.title": 1,
                "job.id": 1,
                "proposal.id": 1,
                unreadMessagesCount: {
                  $size: {
                    $filter: {
                      input: "$messages",
                      as: "message",
                      cond: {
                        $and: [
                          { $eq: ["$$message.readStatus", false] },
                          {
                            $ne: ["$$message.from", account?._id],
                          },
                        ],
                      },
                    },
                  },
                },
                lastMessage: { $arrayElemAt: ["$messages", -1] },
              },
            },
            {
              $lookup: {
                from: "accounts",
                localField: "client_id",
                foreignField: "_id",
                as: "client_info",
                pipeline: [
                  {
                    $project: {
                      _id: false,
                      first_name: 1,
                      last_name: 1,
                    },
                  },
                ],
              },
            },
            {
              $lookup: {
                from: "accounts",
                localField: "expert_id",
                foreignField: "_id",
                as: "expert_info",
                pipeline: [
                  {
                    $project: {
                      _id: false,
                      first_name: 1,
                      last_name: 1,
                    },
                  },
                ],
              },
            },
            {
              $lookup: {
                from: "accounts",
                localField: "mentor_id",
                foreignField: "_id",
                as: "mentor_info",
                pipeline: [
                  {
                    $project: {
                      _id: false,
                      first_name: 1,
                      last_name: 1,
                    },
                  },
                ],
              },
            },
          ]);
        } else if (account.account_type === "expert") {
          // get all conversations associated with current expert.
          allConversations = await Conversation.aggregate([
            {
              $match: {
                expert_id: account._id,
              },
            },
            {
              $project: {
                mentor_id: 1,
                client_id: 1,
                expert_id: 1,
                client_avatar: 1,
                expert_avatar: 1,
                mentor_avatar: 1,
                "job.title": 1,
                "job.id": 1,
                "proposal.id": 1,
                unreadMessagesCount: {
                  $size: {
                    $filter: {
                      input: "$messages",
                      as: "message",
                      cond: {
                        $and: [
                          { $eq: ["$$message.readStatus", false] },
                          {
                            $ne: ["$$message.from", account?._id],
                          },
                        ],
                      },
                    },
                  },
                },
                lastMessage: { $arrayElemAt: ["$messages", -1] },
              },
            },
            {
              $lookup: {
                from: "accounts",
                localField: "client_id",
                foreignField: "_id",
                as: "client_info",
                pipeline: [
                  {
                    $project: {
                      _id: false,
                      first_name: 1,
                      last_name: 1,
                    },
                  },
                ],
              },
            },
            {
              $lookup: {
                from: "accounts",
                localField: "expert_id",
                foreignField: "_id",
                as: "expert_info",
                pipeline: [
                  {
                    $project: {
                      _id: false,
                      first_name: 1,
                      last_name: 1,
                    },
                  },
                ],
              },
            },
            {
              $lookup: {
                from: "accounts",
                localField: "mentor_id",
                foreignField: "_id",
                as: "mentor_info",
                pipeline: [
                  {
                    $project: {
                      _id: false,
                      first_name: 1,
                      last_name: 1,
                    },
                  },
                ],
              },
            },
          ]);
        } else {
          // get all conversations associated with current mentor.
          allConversations = await Conversation.aggregate([
            {
              $match: {
                mentor_id: account._id,
              },
            },
            {
              $project: {
                mentor_id: 1,
                client_id: 1,
                expert_id: 1,
                client_avatar: 1,
                expert_avatar: 1,
                mentor_avatar: 1,
                "job.title": 1,
                "job.id": 1,
                "proposal.id": 1,
                unreadMessagesCount: {
                  $size: {
                    $filter: {
                      input: "$messages",
                      as: "message",
                      cond: {
                        $and: [
                          { $eq: ["$$message.readStatus", false] },
                          {
                            $ne: ["$$message.from", account?._id],
                          },
                        ],
                      },
                    },
                  },
                },
                lastMessage: { $arrayElemAt: ["$messages", -1] },
              },
            },
            {
              $lookup: {
                from: "accounts",
                localField: "client_id",
                foreignField: "_id",
                as: "client_info",
                pipeline: [
                  {
                    $project: {
                      _id: false,
                      first_name: 1,
                      last_name: 1,
                    },
                  },
                ],
              },
            },
            {
              $lookup: {
                from: "accounts",
                localField: "expert_id",
                foreignField: "_id",
                as: "expert_info",
                pipeline: [
                  {
                    $project: {
                      _id: false,
                      first_name: 1,
                      last_name: 1,
                    },
                  },
                ],
              },
            },
            {
              $lookup: {
                from: "accounts",
                localField: "mentor_id",
                foreignField: "_id",
                as: "mentor_info",
                pipeline: [
                  {
                    $project: {
                      _id: false,
                      first_name: 1,
                      last_name: 1,
                    },
                  },
                ],
              },
            },
          ]);
        }

        return response
          .response({ status: "ok", data: allConversations })
          .code(200);
      } catch (err) {
        return response
          .response({ status: "err", err: "Getting conversation failed" })
          .code(501);
      }
    },
  },
  {
    method: "GET",
    path: "/my/{contactId}",
    options: {
      auth: "jwt",
      description: "Get specific conversation",
      plugins: getMyConversationSwagger,
      tags: ["api", "conversation"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();
        // check whether acount exist
        const myAccount = await Account.findOne({
          email: request.auth.credentials.email,
        });

        const contactAccount = await Account.findById(request.params.contactId);

        if (!(myAccount && contactAccount)) {
          return response
            .response({ status: "err", err: "Account does not exist!" })
            .code(404);
        }

        let client_id: string = null;
        let expert_id: string = null;
        let mentor_id: string = null;

        // check account type
        switch (myAccount.account_type) {
          case "client": {
            client_id = myAccount._id;
            break;
          }
          case "expert": {
            expert_id = myAccount._id;
            break;
          }
          case "mentor": {
            mentor_id = myAccount._id;
            break;
          }
        }

        const queryAll = {
          $and: [],
        };

        if (client_id) {
          queryAll["$and"].push(
            { client_id },
            { expert_id: contactAccount._id }
          );
        }

        if (expert_id) {
          queryAll["$and"].push({ expert_id });
          queryAll["$and"].push(
            contactAccount.type === "mentor"
              ? { mentor_id: contactAccount._id }
              : { client_id: contactAccount._id }
          );
        }

        if (mentor_id) {
          queryAll["$and"].push(
            { mentor_id },
            { expert_id: contactAccount._id }
          );
        }

        const myConversation = await Conversation.aggregate([
          {
            $match: queryAll,
          },
          // {
          //   $project: {
          //     _id: 0,
          //     client_id: 1,
          //     expert_id: 1,
          //     mentor_id: 1,
          //     "job.title": 1,
          //     "job.id": 1,
          //     "proposal.id": 1,
          //   },
          // },
          {
            $lookup: {
              from: "accounts",
              localField: "client_id",
              foreignField: "_id",
              as: "client_info",
              pipeline: [
                {
                  $project: {
                    _id: false,
                    first_name: 1,
                    last_name: 1,
                  },
                },
              ],
            },
          },
          {
            $lookup: {
              from: "accounts",
              localField: "expert_id",
              foreignField: "_id",
              as: "expert_info",
              pipeline: [
                {
                  $project: {
                    _id: false,
                    first_name: 1,
                    last_name: 1,
                  },
                },
              ],
            },
          },
          {
            $lookup: {
              from: "accounts",
              localField: "mentor_id",
              foreignField: "_id",
              as: "mentor_info",
              pipeline: [
                {
                  $project: {
                    _id: false,
                    first_name: 1,
                    last_name: 1,
                  },
                },
              ],
            },
          },
        ]);

        if (!myConversation) {
          return response
            .response({ status: "err", err: "Conversation does not exist" })
            .code(404);
        }

        return response
          .response({ status: "ok", data: myConversation })
          .code(200);
      } catch (err) {
        return response
          .response({ status: "err", err: "Getting conversation failed" })
          .code(501);
      }
    },
  },
  {
    method: "DELETE",
    path: "/my/{contactId}",
    options: {
      auth: "jwt",
      description: "Delete specific conversation",
      plugins: deleteMyConversationSwagger,
      tags: ["api", "conversation"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();

        // check whether acount exist
        const myAccount = await Account.findOne({
          email: request.auth.credentials.email,
        });

        const contactAccount = await Account.findById(request.params.contactId);

        if (!(myAccount && contactAccount)) {
          return response
            .response({ status: "err", err: "Account does not exist!" })
            .code(404);
        }

        let client_id: string = null;
        let expert_id: string = null;
        let mentor_id: string = null;

        // check account type
        switch (myAccount.account_type) {
          case "client": {
            client_id = myAccount._id;
            break;
          }
          case "expert": {
            expert_id = myAccount._id;
            break;
          }
          case "mentor": {
            mentor_id = myAccount._id;
            break;
          }
        }

        let isAllright: boolean = true;
        switch (contactAccount.account_type) {
          case "client": {
            !client_id
              ? (client_id = contactAccount._id)
              : (isAllright = false);
            break;
          }
          case "expert": {
            !expert_id
              ? (expert_id = contactAccount._id)
              : (isAllright = false);
            break;
          }
          case "mentor": {
            !mentor_id
              ? (mentor_id = contactAccount._id)
              : (isAllright = false);
            break;
          }
        }

        // if myAccount.account_type === contactAccount.acount_type Conversation is not exist
        if (!isAllright) {
          return response
            .response({ status: "err", err: "Conversation does not exist" })
            .code(404);
        }

        // build query
        const queryAll: object = {
          $and: [],
        };
        if (client_id) queryAll["$and"].push({ client_id });
        if (expert_id) queryAll["$and"].push({ expert_id });
        if (mentor_id) queryAll["$and"].push({ mentor_id });

        // find conversation
        const myConversation = await Conversation.aggregate([
          {
            $match: queryAll,
          },
          {
            $project: {
              _id: 0,
              client_id: 1,
              expert_id: 1,
              mentor_id: 1,
              "job.title": 1,
              "job.id": 1,
              "proposal.id": 1,
            },
          },
        ]);

        if (!myConversation) {
          return response
            .response({ status: "err", err: "Conversation does not exist" })
            .code(404);
        }

        // delete conversation
        myConversation.forEach(async (item) => {
          await Conversation.deleteOne({
            client_id: item.client_id,
            expert_id: item.expert_id,
            mentor_id: item.mentor_id,
          });
        });

        return response
          .response({ status: "ok", data: myConversation })
          .code(200);
      } catch (err) {
        return response
          .response({ status: "err", err: "Deleting conversation failed" })
          .code(501);
      }
    },
  },

  // handle messages
  {
    method: "PATCH",
    path: "/my/messages",
    config: {
      auth: "jwt",
      description: "Add a message to conversation",
      plugins: putMessageToConversationSwagger,
      payload: {
        maxBytes: 10485760000,
        output: "stream",
        parse: true,
        allow: "multipart/form-data",
        multipart: { output: "stream" },
      },
      tags: ["api", "conversation"],
      validate: {
        payload: putMessageToConversationSchema,
        options,
        failAction: (request, h, error) => {
          const details = error.details.map((d) => {
            return { err: d.message, path: d.path };
          });
          return h.response(details).code(400).takeover();
        },
      },
      handler: async (request: Request, response: ResponseToolkit) => {
        try {
          const currentDate = new Date();

          const data = request.payload;

          // check whether acount exist
          const myAccount = await Account.findOne({
            email: request.auth.credentials.email,
          });

          const contactAccount = await Account.findById(
            data["messageData"]["to"]
          );

          if (!(myAccount && contactAccount)) {
            return response
              .response({ status: "err", err: "Account does not exist!" })
              .code(404);
          }

          let client_id: string = null;
          let expert_id: string = null;
          let mentor_id: string = null;

          // check account type
          switch (myAccount.account_type) {
            case "client": {
              client_id = myAccount._id;
              break;
            }
            case "expert": {
              expert_id = myAccount._id;
              break;
            }
            case "mentor": {
              mentor_id = myAccount._id;
              break;
            }
          }

          let isAllright: boolean = true;
          switch (contactAccount.account_type) {
            case "client": {
              !client_id
                ? (client_id = contactAccount._id)
                : (isAllright = false);
              break;
            }
            case "expert": {
              !expert_id
                ? (expert_id = contactAccount._id)
                : (isAllright = false);
              break;
            }
            case "mentor": {
              !mentor_id
                ? (mentor_id = contactAccount._id)
                : (isAllright = false);
              break;
            }
          }

          // if myAccount.account_type === contactAccount.acount_type Conversation is not exist
          if (!isAllright) {
            return response
              .response({ status: "err", err: "Conversation does not exist" })
              .code(404);
          }

          // confirm message field
          const messageField = {
            from: myAccount._id,
            to: data["messageData"]["to"]._id,
            message_type: data["messageData"]["message_type"],
            message_body: data["messageData"]["message_body"],
            // parent_message_id: data["messageData"]["parent_message_id"] ?? null,
            attached_files: [],
            created_date: currentDate,
            expire_date: null,
            readStatus: false,
          };
          if (data["messageData"]["parent_message_id"])
            messageField["message_body"] =
              data["messageData"]["parent_message_id"];

          // build query to find conversation
          const queryAll: object = {
            $and: [],
          };
          if (client_id) queryAll["$and"].push({ client_id });
          if (expert_id) queryAll["$and"].push({ expert_id });
          if (mentor_id) queryAll["$and"].push({ mentor_id });

          if (data["messageData"]["job"]) {
            queryAll["$and"].push({
              "job.id": data["messageData"]["job"]["id"],
            });
            queryAll["$and"].push({
              "job.title": data["messageData"]["job"]["title"],
            });
          }

          try {
            // Check whether conversation exist
            await Conversation.findOne(queryAll);
          } catch (err) {
            return response
              .response({ status: "err", err: "Conversation does not exist" })
              .code(404);
          }

          let myConversation;

          // add attached files if it exist
          if (data["attached_files"]) {
            // push a message to the conversation

            myConversation = await Conversation.findOneAndUpdate(
              queryAll,
              {
                $push: {
                  messages: messageField,
                },
              },
              { new: true }
            );

            // get message id
            const message = await Conversation.aggregate([
              {
                $match: queryAll,
              },
              {
                $project: {
                  messages: {
                    $filter: {
                      input: "$messages",
                      as: "message",
                      cond: {
                        $eq: ["$$message.created_date", currentDate],
                      },
                    },
                  },
                },
              },
            ]);
            // upload_attached_files
            data["attached_files"].forEach(async (fileItem) => {
              const bucketdb = mongoose.connection.db;
              const bucket = new mongoose.mongo.GridFSBucket(bucketdb, {
                bucketName: "messageFiles",
              });

              const attached_file = fileItem;
              const uploadStream = bucket.openUploadStream(
                attached_file.hapi.filename
              );
              uploadStream.on("finish", async (file) => {
                // record attached_files info to database
                const queryMessage = queryAll;
                queryMessage["$and"].push({
                  "messages._id": message[0].messages[0]._id,
                });
                const attachedMessage = await Conversation.findOneAndUpdate(
                  queryMessage,
                  {
                    $push: {
                      "messages.$.attached_files": {
                        name: attached_file.hapi.filename,
                        file_id: file._id,
                      },
                    },
                  },
                  { new: true }
                );
              });

              await attached_file.pipe(uploadStream);
            });
          } else {
            // add a message to the conversation
            myConversation = await Conversation.findOneAndUpdate(
              queryAll,
              {
                $push: {
                  messages: messageField,
                },
              },
              { new: true }
            );
          }

          return response
            .response({ status: "ok", data: myConversation })
            .code(200);
        } catch (err) {
          return response
            .response({ status: "err", err: "Updating conversation failed" })
            .code(501);
        }
      },
    },
  },
  {
    method: "PATCH",
    path: "/my/messages/{messageId}",
    config: {
      auth: "jwt",
      description: "update a message",
      plugins: updateMessageSwagger,
      payload: {
        maxBytes: 10485760000,
        output: "stream",
        parse: true,
        allow: "multipart/form-data",
        multipart: { output: "stream" },
      },
      tags: ["api", "conversation"],
      validate: {
        payload: updateMessageSchema,
        options,
        failAction: (request, h, error) => {
          const details = error.details.map((d) => {
            return { err: d.message, path: d.path };
          });
          return h.response(details).code(400).takeover();
        },
      },
      handler: async (request: Request, response: ResponseToolkit) => {
        try {
          const currentDate = new Date();

          const data = request.payload;

          // check whether acount exist
          const myAccount = await Account.findOne({
            email: request.auth.credentials.email,
          });

          const contactAccount = await Account.findById(
            data["messageData"]["to"]
          );

          if (!(myAccount && contactAccount)) {
            return response
              .response({ status: "err", err: "Account does not exist!" })
              .code(404);
          }

          let client_id: string = null;
          let expert_id: string = null;
          let mentor_id: string = null;

          // check account type
          switch (myAccount.account_type) {
            case "client": {
              client_id = myAccount._id;
              break;
            }
            case "expert": {
              expert_id = myAccount._id;
              break;
            }
            case "mentor": {
              mentor_id = myAccount._id;
              break;
            }
          }

          let isAllright: boolean = true;
          switch (contactAccount.account_type) {
            case "client": {
              !client_id
                ? (client_id = contactAccount._id)
                : (isAllright = false);
              break;
            }
            case "expert": {
              !expert_id
                ? (expert_id = contactAccount._id)
                : (isAllright = false);
              break;
            }
            case "mentor": {
              !mentor_id
                ? (mentor_id = contactAccount._id)
                : (isAllright = false);
              break;
            }
          }

          // if myAccount.account_type === contactAccount.acount_type Conversation is not exist
          if (!isAllright) {
            return response
              .response({ status: "err", err: "Conversation does not exist" })
              .code(404);
          }

          // build query to find conversation
          const queryAll: object = {
            $and: [],
          };
          if (client_id) queryAll["$and"].push({ client_id });
          if (expert_id) queryAll["$and"].push({ expert_id });
          if (mentor_id) queryAll["$and"].push({ mentor_id });

          if (data["messageData"]["job"]) {
            queryAll["$and"].push({
              "job.id": data["messageData"]["job"]["id"],
            });
            queryAll["$and"].push({
              "job.title": data["messageData"]["job"]["title"],
            });
          }

          const queryMessage = queryAll;
          queryMessage["$and"].push({
            "messages._id": request.params.messageId,
          });

          let myConversation;

          try {
            // Check whether conversation exist
            const sendedMessage = await Conversation.findOne(queryAll, {
              "messages.$": 1,
            });

            const attached_files = sendedMessage.messages[0]["attached_files"];

            // delete uploaded files
            if (attached_files) {
              attached_files.forEach((item) => {
                const bucketdb = mongoose.connection.db;
                const bucket = new mongoose.mongo.GridFSBucket(bucketdb, {
                  bucketName: "messageFiles",
                });
                try {
                  bucket.delete(item.file_id);
                } catch (err) {
                  return response
                    .response({
                      staus: "err",
                      err: "Sorry, something went wrong. Please refresh the page and try again.!",
                    })
                    .code(501);
                }
              });
            }
          } catch (err) {
            return response
              .response({ status: "err", err: "Message does not exist!" })
              .code(404);
          }

          // confirm message field
          const messageField = {
            from: myAccount._id,
            to: data["messageData"]["to"]._id,
            message_type: data["messageData"]["message_type"],
            message_body: data["messageData"]["message_body"],
            // parent_message_id: data["messageData"]["parent_message_id"] ?? null,
            attached_files: [],
            created_date: currentDate,
            expire_date: null,
          };

          if (data["messageData"]["parent_message_id"])
            messageField["message_body"] =
              data["messageData"]["parent_message_id"];

          // add attached files if it exist
          if (data["attached_files"]) {
            // Update message in the conversation

            myConversation = await Conversation.findOneAndUpdate(
              queryAll,
              {
                $set: {
                  "messages.$.from": messageField.from,
                  "messages.$.to": messageField.to,
                  "messages.$.message_type": messageField.message_type,
                  "messages.$.message_body": messageField.message_body,
                  "messages.$.parent_message_id":
                    messageField["parent_message_id"],
                  "messages.$.attached_files": [],
                  "messages.$.created_date": messageField.created_date,
                  "messages.$.expire_date": messageField.expire_date,
                },
              },
              { new: true }
            );

            // // get message i
            data["attached_files"].forEach(async (fileItem) => {
              const bucketdb = mongoose.connection.db;
              const bucket = new mongoose.mongo.GridFSBucket(bucketdb, {
                bucketName: "messageFiles",
              });

              const attached_file = fileItem;
              const uploadStream = bucket.openUploadStream(
                attached_file.hapi.filename
              );
              uploadStream.on("finish", async (file) => {
                // record attached_files info to database
                // const queryMessage = queryAll;
                // queryMessage["$and"].push({
                //   "messages._id": message[0].messages[0]._id,
                // });
                myConversation = await Conversation.findOneAndUpdate(
                  queryAll,
                  {
                    $push: {
                      "messages.$.attached_files": {
                        name: attached_file.hapi.filename,
                        file_id: file._id,
                      },
                    },
                  },
                  { new: true }
                );
              });

              await attached_file.pipe(uploadStream);
            });
          } else {
            // Update message in the conversation
            myConversation = await Conversation.findOneAndUpdate(
              queryAll,
              {
                $set: {
                  "messages.$.from": messageField.from,
                  "messages.$.to": messageField.to,
                  "messages.$.message_type": messageField.message_type,
                  "messages.$.message_body": messageField.message_body,
                  "messages.$.parent_message_id":
                    messageField["parent_message_id"],
                  "messages.$.attached_files": [],
                  "messages.$.created_date": messageField.created_date,
                  "messages.$.expire_date": messageField.expire_date,
                },
              },
              { new: true }
            );
          }

          return response
            .response({ status: "ok", data: "Update message Success!" })
            .code(200);
        } catch (err) {
          return response
            .response({
              status: "err",
              err: "Sorry, something went wrong. Please refresh the page and try again.",
            })
            .code(501);
        }
      },
    },
  },

  {
    method: "PUT",
    path: "/read",
    options: {
      auth: "jwt",
      description: "Set message as read",
      plugins: updateMessageSwagger,
      tags: ["api", "conversation"],
      validate: {
        payload: readMessageSchema,
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
        const myAccount = await Account.findOne({
          email: request.auth.credentials.email,
        });
        const contactAccount = await Account.findById(
          request.payload["contactId"]
        );
        if (!(myAccount && contactAccount)) {
          return response
            .response({ status: "err", err: "Account does not exist!" })
            .code(404);
        }
        let client_id: string = null;
        let expert_id: string = null;
        let mentor_id: string = null;

        // check account type
        switch (myAccount.account_type) {
          case "client": {
            client_id = myAccount._id;
            break;
          }
          case "expert": {
            expert_id = myAccount._id;
            break;
          }
          case "mentor": {
            mentor_id = myAccount._id;
            break;
          }
        }

        let isAllright: boolean = true;
        switch (contactAccount.account_type) {
          case "client": {
            !client_id
              ? (client_id = contactAccount._id)
              : (isAllright = false);
            break;
          }
          case "expert": {
            !expert_id
              ? (expert_id = contactAccount._id)
              : (isAllright = false);
            break;
          }
          case "mentor": {
            !mentor_id
              ? (mentor_id = contactAccount._id)
              : (isAllright = false);
            break;
          }
        }

        if (!isAllright) {
          return response
            .response({ status: "err", err: "Conversation does not exist" })
            .code(404);
        }
        const queryAll: object = {
          $and: [],
        };
        if (client_id) queryAll["$and"].push({ client_id });
        if (expert_id) queryAll["$and"].push({ expert_id });
        if (mentor_id) queryAll["$and"].push({ mentor_id });

        let myMessage;

        try {
          // Update the readStatus field in messages array
          await Conversation.findOneAndUpdate(
            queryAll,
            { $set: { "messages.$[element].readStatus": true } },
            {
              arrayFilters: [
                {
                  $and: [
                    { "element.readStatus": false },
                    { "element.from": { $ne: myAccount._id } },
                  ],
                },
              ],
              multi: true,
              new: true,
            }
          );

          // Aggregate operations on the updated documents
          myMessage = await Conversation.aggregate([
            {
              $match: queryAll,
            },
            {
              $project: {
                mentor_id: 1,
                client_id: 1,
                expert_id: 1,
                client_avatar: 1,
                expert_avatar: 1,
                mentor_avatar: 1,
                "job.title": 1,
                "job.id": 1,
                "proposal.id": 1,
                unreadMessagesCount: {
                  $size: {
                    $filter: {
                      input: "$messages",
                      as: "message",
                      cond: {
                        $and: [
                          { $eq: ["$$message.readStatus", false] },
                          {
                            $ne: ["$$message.from", myAccount?._id],
                          },
                        ],
                      },
                    },
                  },
                },
                lastMessage: { $arrayElemAt: ["$messages", -1] },
              },
            },
            {
              $lookup: {
                from: "accounts",
                localField: "client_id",
                foreignField: "_id",
                as: "client_info",
                pipeline: [
                  {
                    $project: {
                      _id: false,
                      first_name: 1,
                      last_name: 1,
                    },
                  },
                ],
              },
            },
            {
              $lookup: {
                from: "accounts",
                localField: "expert_id",
                foreignField: "_id",
                as: "expert_info",
                pipeline: [
                  {
                    $project: {
                      _id: false,
                      first_name: 1,
                      last_name: 1,
                    },
                  },
                ],
              },
            },
            {
              $lookup: {
                from: "accounts",
                localField: "mentor_id",
                foreignField: "_id",
                as: "mentor_info",
                pipeline: [
                  {
                    $project: {
                      _id: false,
                      first_name: 1,
                      last_name: 1,
                    },
                  },
                ],
              },
            },
            // Add additional lookup stages as needed
          ]);
        } catch (err) {
          return response
            .response({ status: "err", err: "Message does not exist!" })
            .code(404);
        }

        return response.response({ status: "ok", data: myMessage }).code(200);
      } catch (err) {
        return response
          .response({
            status: "err",
            err: "Sorry, something went wrong. Please refresh the page and try again.",
          })
          .code(501);
      }
    },
  },

  {
    method: "GET",
    path: "/my/messages/{contactId}/{messageId}",
    options: {
      auth: "jwt",
      description: "Get specific message in conversation",
      plugins: getMessageSwagger,
      tags: ["api", "conversation"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();
        const data = request.payload;

        // check whether acount exist
        const myAccount = await Account.findOne({
          email: request.auth.credentials.email,
        });

        const contactAccount = await Account.findById(request.params.contactId);

        if (!(myAccount && contactAccount)) {
          return response
            .response({ status: "err", err: "Account does not exist!" })
            .code(404);
        }

        let client_id: string = null;
        let expert_id: string = null;
        let mentor_id: string = null;

        // check account type
        switch (myAccount.account_type) {
          case "client": {
            client_id = myAccount._id;
            break;
          }
          case "expert": {
            expert_id = myAccount._id;
            break;
          }
          case "mentor": {
            mentor_id = myAccount._id;
            break;
          }
        }

        let isAllright: boolean = true;
        switch (contactAccount.account_type) {
          case "client": {
            !client_id
              ? (client_id = contactAccount._id)
              : (isAllright = false);
            break;
          }
          case "expert": {
            !expert_id
              ? (expert_id = contactAccount._id)
              : (isAllright = false);
            break;
          }
          case "mentor": {
            !mentor_id
              ? (mentor_id = contactAccount._id)
              : (isAllright = false);
            break;
          }
        }

        // if myAccount.account_type === contactAccount.acount_type Conversation is not exist
        if (!isAllright) {
          return response
            .response({ status: "err", err: "Conversation does not exist" })
            .code(404);
        }

        // build query to find conversation
        const queryAll: object = {
          $and: [],
        };
        if (client_id) queryAll["$and"].push({ client_id });
        if (expert_id) queryAll["$and"].push({ expert_id });
        if (mentor_id) queryAll["$and"].push({ mentor_id });

        const queryMessage = queryAll;
        queryMessage["$and"].push({
          "messages._id": request.params.messageId,
        });

        let myMessage;

        try {
          // Get my message in conversation
          myMessage = await Conversation.findOne(queryAll, {
            "messages.$": 1,
          });
        } catch (err) {
          return response
            .response({ status: "err", err: "Message does not exist!" })
            .code(404);
        }

        return response.response({ status: "ok", data: myMessage }).code(200);
      } catch (err) {
        return response
          .response({
            status: "err",
            err: "Sorry, something went wrong. Please refresh the page and try again.",
          })
          .code(501);
      }
    },
  },
  {
    method: "DELETE",
    path: "/my/messages/{contactId}/{messageId}",
    options: {
      auth: "jwt",
      description: "Delete specific message in conversation",
      plugins: deleteMessageSwagger,
      tags: ["api", "conversation"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();
        const data = request.payload;

        // check whether acount exist
        const myAccount = await Account.findOne({
          email: request.auth.credentials.email,
        });

        const contactAccount = await Account.findById(request.params.contactId);

        if (!(myAccount && contactAccount)) {
          return response
            .response({ status: "err", err: "Account does not exist!" })
            .code(404);
        }

        let client_id: string = null;
        let expert_id: string = null;
        let mentor_id: string = null;

        // check account type
        switch (myAccount.account_type) {
          case "client": {
            client_id = myAccount._id;
            break;
          }
          case "expert": {
            expert_id = myAccount._id;
            break;
          }
          case "mentor": {
            mentor_id = myAccount._id;
            break;
          }
        }

        let isAllright: boolean = true;
        switch (contactAccount.account_type) {
          case "client": {
            !client_id
              ? (client_id = contactAccount._id)
              : (isAllright = false);
            break;
          }
          case "expert": {
            !expert_id
              ? (expert_id = contactAccount._id)
              : (isAllright = false);
            break;
          }
          case "mentor": {
            !mentor_id
              ? (mentor_id = contactAccount._id)
              : (isAllright = false);
            break;
          }
        }

        // if myAccount.account_type === contactAccount.acount_type Conversation is not exist
        if (!isAllright) {
          return response
            .response({ status: "err", err: "Conversation does not exist" })
            .code(404);
        }

        // build query to find conversation
        const queryAll: object = {
          $and: [],
        };
        if (client_id) queryAll["$and"].push({ client_id });
        if (expert_id) queryAll["$and"].push({ expert_id });
        if (mentor_id) queryAll["$and"].push({ mentor_id });

        const queryMessage = queryAll;
        queryMessage["$and"].push({
          "messages._id": request.params.messageId,
        });

        let myMessage;

        try {
          // Get my message in conversation
          myMessage = await Conversation.findOneAndUpdate(
            queryAll,
            {
              $pull: {
                messages: { _id: request.params.messageId },
              },
            },
            { new: true }
          );
        } catch (err) {
          return response
            .response({ status: "err", err: "Message does not exist!" })
            .code(404);
        }

        return response
          .response({ status: "ok", data: "Delete message Success!" })
          .code(200);
      } catch (err) {
        return response
          .response({
            status: "err",
            err: "Sorry, something went wrong. Please refresh the page and try again.",
          })
          .code(501);
      }
    },
  },
  {
    method: "GET",
    path: "/download/{fileId}",
    options: {
      auth: "jwt",
      description: "download message file",
      plugins: downloadMessageFileSwagger,
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
