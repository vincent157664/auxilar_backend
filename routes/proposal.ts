import { Request, ResponseToolkit } from "@hapi/hapi";

import {
  ProposalSwagger,
  approveProposalSwagger,
  deleteProposalSwagger,
  downloadProposalSwagger,
  getProposalSwagger,
  hireProposalSwagger,
  offerProposalSwagger,
  updateProposalSwagger,
} from "../swagger/proposal";
import { ProposalSchema, updateProposalSchema } from "../validation/proposal";
import Account from "../models/account";
import Expert from "../models/profile/expert";
import Job from "../models/job";
import mongoose from "mongoose";

const options = { abortEarly: false, stripUnknown: true };

export let proposalRoute = [
  {
    method: "POST",
    path: "/{jobId}",
    config: {
      auth: "jwt",
      description: "Apply proposal",
      plugins: ProposalSwagger,
      payload: {
        maxBytes: 10485760000,
        output: "stream",
        parse: true,
        allow: "multipart/form-data",
        multipart: { output: "stream" },
      },
      tags: ["api", "proposal"],
      validate: {
        payload: ProposalSchema,
        options,
        failAction: (request, h, error) => {
          const details = error.details.map((d) => {
            return { err: d.message, path: d.path };
          });
          return h.response(details).code(400).takeover();
        },
      },
      // },
      handler: async (request: Request, response: ResponseToolkit) => {
        try {
          const currentDate = new Date().toUTCString();

          // Check whether account is expert
          const account = await Account.findOne({
            email: request.auth.credentials.email,
          });
          if (account.account_type !== "expert") {
            return response
              .response({ status: "err", err: "Forbidden request" })
              .code(403);
          }

          // Check whether profile exist
          try {
            await Expert.findOne({ account: account.id });
          } catch (error) {
            return response
              .response({ status: "err", err: "Your profile does not exist" })
              .code(406);
          }

          const data = request.payload;

          // Check whether Posted job exist
          try {
            await Job.findById(request.params.jobId);
          } catch (err) {
            return response
              .response({ status: "err", err: "Posted job not found!" })
              .code(404);
          }
          // Check whether already apply proposal
          const existingProposal = await Job.findOne({
            _id: request.params.jobId,
            "proposals.expert.email": account.email,
          });

          if (existingProposal) {
            return response
              .response({
                status: "err",
                err: "You have already sent proposal!",
              })
              .code(409);
          }

          // get field

          const proposalField = {
            expert: { id: account.id, email: account.email },
            cover_letter: data["proposalData"]["cover_letter"],
            total_amount: data["proposalData"]["total_amount"],
            milestones: data["proposalData"]["milestones"],
            proposal_status: data["proposalData"]["proposal_status"] ?? null,
            mentor_check: [],
            attached_files: [],
          };

          // Check invited status
          const invited_expert = await Job.findOne({
            _id: request.params.jobId,
            "invited_expert.id": account._id,
          });
          if (invited_expert) {
            proposalField["expert"]["invited_status"] = true;
          }
          if (data["proposalData"]["mentors"]) {
            // Check whether mentors exist

            const mentor_check = [];
            data["proposalData"]["mentors"].forEach((item) => {
              mentor_check.push({
                mentor: item,
                checked: false,
              });
            });

            proposalField["mentor_check"] = mentor_check;
            proposal_status: data["proposalData"]["proposal_status"] ?? null;
          }

          // Check whether attached_files exist
          if (data["attached_files"]) {
            // push proposal not add attached_files info
            await Job.findOneAndUpdate(
              { _id: request.params.jobId },
              {
                $push: {
                  proposals: proposalField,
                },
              },
              { new: true }
            );

            // get proposal id
            const ObjectId = mongoose.Types.ObjectId;
            const proposal = await Job.aggregate([
              {
                $match: {
                  _id: new ObjectId(request.params.jobId),
                  "proposals.expert.email": account.email,
                },
              },
              {
                $project: {
                  proposals: {
                    $filter: {
                      input: "$proposals",
                      as: "proposal",
                      cond: {
                        $eq: [
                          "$$proposal.expert.email",
                          request.auth.credentials.email,
                        ],
                      },
                    },
                  },
                },
              },
            ]);

            // upload attached files

            data["attached_files"].forEach(async (fileItem) => {
              const bucketdb = mongoose.connection.db;
              const bucket = new mongoose.mongo.GridFSBucket(bucketdb, {
                bucketName: "file",
              });

              const attached_file = fileItem;

              const uploadStream = bucket.openUploadStream(
                attached_file.hapi.filename
              );
              uploadStream.on("finish", async (file) => {
                const attachedProposal = await Job.findOneAndUpdate(
                  {
                    _id: request.params.jobId,
                    "proposals._id": proposal[0].proposals[0]._id,
                  },
                  {
                    $push: {
                      "proposals.$.attached_files": {
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
            // add proposals which attached_files not exist
            const proposal = await Job.findOneAndUpdate(
              { _id: request.params.jobId },
              {
                $push: {
                  proposals: proposalField,
                },
              },
              { new: true }
            ).select("proposals");
          }
          return response
            .response({ status: "ok", data: "Proposal successfully applied" })
            .code(201);
        } catch (error) {
          return response
            .response({
              status: "err",
              err: "Sorry, something went wrong. Please refresh the page and try again.!",
            })
            .code(501);
        }
      },
    },
  },

  {
    method: "PUT",
    path: "/{jobId}",
    config: {
      auth: "jwt",
      description: "Update applied proposal",
      plugins: updateProposalSwagger,
      payload: {
        maxBytes: 10485760000,
        output: "stream",
        parse: true,
        allow: "multipart/form-data",
        multipart: { output: "stream" },
      },
      tags: ["api", "proposal"],
      validate: {
        payload: updateProposalSchema,
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
          const currentDate = new Date().toUTCString();

          // Check whether account is expert
          const account = await Account.findOne({
            email: request.auth.credentials.email,
          });
          if (account.account_type !== "expert") {
            return response
              .response({ status: "err", err: "Forbidden request" })
              .code(403);
          }

          // Check whether profile exist
          try {
            await Expert.findOne({ account: account.id });
          } catch (error) {
            return response
              .response({ status: "err", err: "Your profile does not exist" })
              .code(406);
          }

          const data = request.payload;

          try {
            // Check whether Posted job, proposal exist
            const appliedProposal = await Job.findOne(
              {
                _id: request.params.jobId,
                "proposals.expert.email": account.email,
              },
              { "proposals.$": 1 }
            );
            const attached_file =
              appliedProposal.proposals[0]["attached_files"];

            // delete uploaded file
            if (attached_file) {
              attached_file.forEach((item) => {
                const bucketdb = mongoose.connection.db;
                const bucket = new mongoose.mongo.GridFSBucket(bucketdb, {
                  bucketName: "file",
                });
                try {
                  bucket.delete(item.file_id);
                } catch (err) {
                  return response
                    .response({
                      status: "err",
                      err: "Sorry, something went wrong. Please refresh the page and try again.",
                    })
                    .code(501);
                }
              });
            }
          } catch (err) {
            return response
              .response({ status: "err", err: "Applied proposal not found!" })
              .code(404);
          }

          // receive field
          const proposalField = {
            expert: { id: account.id, email: account.email },
            cover_letter: data["proposalData"]["cover_letter"],
            total_amount: data["proposalData"]["total_amount"],
            milestones: data["proposalData"]["milestones"],
            proposal_status: data["proposalData"]["proposal_status"] ?? null,
            mentor_check: [],
            attached_files: [], // don't use null
          };

          if (data["proposalData"]["mentors"].length) {
            const mentor_check = [];
            data["proposalData"]["mentors"].forEach((item) => {
              mentor_check.push({
                mentor: item,
                checked: false,
              });
            });

            proposalField["mentor_check"] = mentor_check;
            proposalField["proposal_status"] =
              data["proposalData"]["proposal_status"] ?? null;
          }
          // Upadate proposal which have attached_files
          if (data["attached_files"]) {
            // Update proposal not add attached_files info
            await Job.findOneAndUpdate(
              {
                _id: request.params.jobId,
                "proposals.expert.email": account.email,
              },
              {
                $set: {
                  "proposals.$.cover_letter": proposalField.cover_letter,
                  "proposals.$.total_amount": proposalField.total_amount,
                  "proposals.$.milestones": proposalField.milestones,
                  "proposals.$.proposal_status": proposalField.proposal_status,
                  "proposals.$.mentor_check":
                    proposalField["mentor_check"] ?? null,
                  "proposals.$.attached_files": [],
                },
              },
              { new: true }
            );

            // get proposal id
            const ObjectId = mongoose.Types.ObjectId;
            const proposal = await Job.aggregate([
              {
                $match: {
                  _id: new ObjectId(request.params.jobId),
                  "proposals.expert.email": account.email,
                },
              },
              {
                $project: {
                  proposals: {
                    $filter: {
                      input: "$proposals",
                      as: "proposal",
                      cond: {
                        $eq: [
                          "$$proposal.expert.email",
                          request.auth.credentials.email,
                        ],
                      },
                    },
                  },
                },
              },
            ]);
            // upload attached_files
            data["attached_files"].forEach(async (fileItem) => {
              const bucketdb = mongoose.connection.db;
              const bucket = new mongoose.mongo.GridFSBucket(bucketdb, {
                bucketName: "file",
              });

              const attached_file = fileItem;
              const uploadStream = bucket.openUploadStream(
                attached_file.hapi.filename
              );
              uploadStream.on("finish", async (file) => {
                // update attached_files info
                const attachedProposal = await Job.findOneAndUpdate(
                  {
                    _id: request.params.jobId,
                    "proposals._id": proposal[0].proposals[0]._id,
                  },
                  {
                    $push: {
                      "proposals.$.attached_files": {
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
            // update proposal which don't have attached_files
            const proposal = await Job.findOneAndUpdate(
              {
                _id: request.params.jobId,
                "proposals.expert.email": account.email,
              },
              {
                $set: {
                  "proposals.$.cover_letter": proposalField.cover_letter,
                  "proposals.$.total_amount": proposalField.total_amount,
                  "proposals.$.milestones": proposalField.milestones,
                  "proposals.$.proposal_status": proposalField.proposal_status,
                  "proposals.$.mentor_check":
                    proposalField["mentor_check"] ?? null,
                  "proposals.$.attached_files": null,
                },
              },
              { new: true }
            ).select("proposals");
          }
          return response
            .response({ status: "ok", data: "Proposal successfully updated" })
            .code(201);
        } catch (error) {
          return response
            .response({
              status: "err",
              err: "Sorry, something went wrong. Please refresh the page and try again.!",
            })
            .code(501);
        }
      },
    },
  },
  {
    method: "GET",
    path: "/{jobId}",
    options: {
      auth: "jwt",
      description: "Get applied proposal to certain job",
      plugins: getProposalSwagger,
      tags: ["api", "proposal"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();

        const account = await Account.findOne({
          email: request.auth.credentials.email,
        });

        let proposal;
        const ObjectId = mongoose.Types.ObjectId;
        // check account whether client if account is client display job and visisble proposals
        if (account.account_type === "client") {
          proposal = await Job.aggregate([
            {
              $match: {
                _id: new ObjectId(request.params.jobId),
              },
            },
            {
              $unwind: "$proposals",
            },
            {
              $match: {
                "proposals.proposal_status": { $in: [2, 3, 4, 5, 6, 7] },
              },
            },
            {
              $lookup: {
                from: "experts",
                localField: "proposals.expert.id",
                foreignField: "account",
                as: "expertData",
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      avatar: 1,
                      country: 1,
                      hourly_rate: 1,
                      titleName: 1,
                      summary: 1,
                      skills: 1,
                      majors: 1,
                    },
                  },
                ],
              },
            },
            {
              $lookup: {
                from: "accounts",
                localField: "proposals.expert.id",
                foreignField: "_id",
                as: "account",
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      first_name: 1,
                      last_name: 1,
                    },
                  },
                ],
              },
            },
            {
              $project: {
                proposals: 1,
                expertData: 1,
                account: 1,
              },
            },
          ]);
          if (!proposal) {
            return response
              .response({ staus: "err", err: "Not found applied proposal" })
              .code(404);
          }
        } else if (account.account_type === "expert") {
          proposal = await Job.aggregate([
            {
              $match: {
                _id: new ObjectId(request.params.jobId),
              },
            },
            {
              $unwind: "$proposals",
            },
            {
              $match: {
                "proposals.expert.email": account.email,
              },
            },
            {
              $lookup: {
                from: "experts",
                localField: "proposals.expert.id",
                foreignField: "account",
                as: "expertData",
                pipeline: [
                  {
                    $project: {
                      avatar: 1,
                      first_name: 1,
                      last_name: 1,
                      skills: 1,
                      majors: 1,
                    },
                  },
                ],
              },
            },
            {
              $project: {
                proposals: 1,
                expertData: 1,
              },
            },
          ]);
          if (!proposal) {
            return response
              .response({ staus: "err", err: "Not found applied proposal" })
              .code(404);
          }
        } else {
          proposal = await Job.aggregate([
            {
              $lookup: {
                from: "experts",
                localField: "proposals.account",
                foreignField: "_id",
                as: "expertData",
                pipeline: [
                  {
                    $project: {
                      avatar: 1,
                      first_name: 1,
                      last_name: 1,
                      skills: 1,
                      majors: 1,
                    },
                  },
                ],
              },
            },
            {
              $match: {
                _id: new ObjectId(request.params.jobId),
                "proposals.mentor_check.mentor": account.id,
              },
            },
            { $unwind: "$proposals" },
            {
              $match: {
                "proposals.mentor_check.mentor": account.id,
              },
            },
            {
              $lookup: {
                from: "experts",
                localField: "proposals.expert.id",
                foreignField: "account",
                as: "expertData",
                pipeline: [
                  {
                    $project: {
                      avatar: 1,
                      first_name: 1,
                      last_name: 1,
                      skills: 1,
                      majors: 1,
                    },
                  },
                ],
              },
            },
            {
              $project: {
                proposals: 1,
                expertData: 1,
              },
            },
          ]);
          if (!proposal) {
            return response
              .response({ staus: "err", err: "Not found applied proposal" })
              .code(404);
          }
        }

        return response.response({ status: "ok", data: proposal }).code(200);
      } catch (error) {
        return response
          .response({
            staus: "err",
            err: "Sorry, something went wrong. Please refresh the page and try again.",
          })
          .code(501);
      }
    },
  },

  {
    method: "DELETE",
    path: "/{jobId}",
    options: {
      auth: "jwt",
      description: "Delete applied proposal",
      plugins: deleteProposalSwagger,
      tags: ["api", "proposal"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();

        const account = await Account.findOne({
          email: request.auth.credentials.email,
        });
        // Check whether account is expert
        if (account.account_type !== "expert") {
          return response
            .response({ status: "err", err: "Frobidden Request!" })
            .code(403);
        }

        // Check whether already apply proposal
        const existingProposal = await Job.findOne({
          _id: request.params.jobId,
          "proposals.expert.email": account.email,
        });

        if (!existingProposal) {
          return response
            .response({ status: "err", err: "Applied proposal not found!" })
            .code(409);
        }

        try {
          await Job.findOneAndUpdate(
            {
              _id: request.params.jobId,
              "proposals.expert.email": account.email,
            },
            {
              $pull: {
                proposals: { "expert.email": account.email },
              },
            }
          );
          return response
            .response({ status: "ok", data: "successfully deleted!" })
            .code(200);
        } catch (error) {
          return response
            .response({ status: "err", err: "Applied Proposal not found!" })
            .code(404);
        }
      } catch (error) {
        return response.response({ status: "err", err: "error" }).code(501);
      }
    },
  },

  {
    method: "PUT",
    path: "/{jobId}/withdraw",
    options: {
      auth: "jwt",
      description: "Withdraw applied proposal",
      plugins: updateProposalSwagger,
      tags: ["api", "proposal"],
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
            .response({ status: "err", err: "Forbidden request" })
            .code(403);
        }

        // Check whether profile exist
        try {
          await Expert.findOne({ account: account.id });
        } catch (error) {
          return response
            .response({ status: "err", err: "Your profile does not exist" })
            .code(406);
        }

        const data = request.payload;

        const proposal = await Job.findOneAndUpdate(
          {
            _id: request.params.jobId,
            "proposals.expert.email": account.email,
          },
          {
            $set: {
              "proposals.$.proposal_status": 6,
            },
          },
          { new: true }
        ).select("proposals");
        return response
          .response({ status: "ok", data: "Proposal successfully updated" })
          .code(201);
      } catch (error) {
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
    path: "/",
    options: {
      auth: "jwt",
      description: "Get all proposals",
      plugins: getProposalSwagger,
      tags: ["api", "proposal"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();

        const account = await Account.findOne({
          email: request.auth.credentials.email,
        });
        // Check whether account is expert
        if (account.account_type === "client") {
          return response
            .response({ status: "err", err: "Forbidden Request!" })
            .code(403);
        }
        let proposal;
        if (account.account_type === "expert") {
          proposal = await Job.aggregate([
            { $unwind: "$proposals" },
            {
              $match: {
                "proposals.expert.email": account.email,
              },
            },
          ]);
          if (!proposal) {
            return response
              .response({ staus: "err", err: "Not found applied proposal" })
              .code(404);
          }
        } else {
          proposal = await Job.aggregate([
            { $unwind: "$proposals" },
            {
              $match: {
                "proposals.mentor_check.mentor": account.id,
                // "proposals.mentor_check.mentor": account.email,
              },
            },
            {
              $lookup: {
                from: "experts",
                localField: "proposals.expert.id",
                foreignField: "account",
                as: "expertAvatar",
                pipeline: [
                  {
                    $project: {
                      avatar: 1,
                    },
                  },
                ],
              },
            },
            {
              $lookup: {
                from: "accounts",
                localField: "proposals.expert.id",
                foreignField: "_id",
                as: "expertName",
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
          ]);
          if (!proposal) {
            return response
              .response({ staus: "err", err: "Not found applied proposal" })
              .code(404);
          }
        }

        return response.response({ status: "ok", data: proposal }).code(201);
      } catch (error) {
        return response
          .response({
            staus: "err",
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
      description: "download specific attached_file",
      plugins: downloadProposalSwagger,
      tags: ["api", "proposal"],
    },
    handler: async (request: Request, h) => {
      try {
        const currentDate = new Date().toUTCString();

        const bucketdb = mongoose.connection.db;
        const bucket = new mongoose.mongo.GridFSBucket(bucketdb, {
          bucketName: "file",
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
  {
    method: "PUT",
    path: "/{jobId}/approve/{proposalId}",
    options: {
      auth: "jwt",
      description: "Approve proposal",
      plugins: approveProposalSwagger,
      tags: ["api", "proposal"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();

        // Check whether account is mentor
        const account = await Account.findOne({
          email: request.auth.credentials.email,
        });
        if (account.account_type !== "mentor") {
          return response
            .response({ status: "err", err: "Forbidden request" })
            .code(403);
        }
        // try {
        await Job.findOneAndUpdate(
          {
            $and: [{ _id: request.params.jobId }],
          },
          {
            $set: {
              "proposals.$[proposal].proposal_status": 2, //pending : approve
              "proposals.$[proposal].mentor_check.$[mentorCheckId].checked":
                true,
            },
          },
          {
            arrayFilters: [
              { "proposal._id": request.params.proposalId },
              { "mentorCheckId.mentor": account.id },
            ],
          },
          { new: true }
        );

        const ObjectId = mongoose.Types.ObjectId;

        const approvedProposal = await Job.aggregate([
          {
            $match: {
              _id: new ObjectId(request.params.jobId),
            },
          },
          { $unwind: "$proposals" },
          {
            $match: {
              "proposals._id": new ObjectId(request.params.proposalId),
              "proposals.mentor_check.mentor": account.id,
            },
          },
        ]);
        // } catch (err) {
        //   return response
        //     .response({ status: "err", err: "Applied proposal Not found!" })
        //     .code(404);
        // }

        return response
          .response({ status: "ok", data: approvedProposal })
          .code(200);
      } catch (err) {
        return response
          .response({ status: "err", err: "Approve failed!" })
          .code(501);
      }
    },
  },
  {
    method: "PUT",
    path: "/{jobId}/decline/{proposalId}",
    options: {
      auth: "jwt",
      description: "Approve proposal",
      plugins: approveProposalSwagger,
      tags: ["api", "proposal"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();

        // Check whether account is mentor
        const account = await Account.findOne({
          email: request.auth.credentials.email,
        });
        if (account.account_type !== "mentor") {
          return response
            .response({ status: "err", err: "Forbidden request" })
            .code(403);
        }
        // try {
        await Job.findOneAndUpdate(
          {
            $and: [
              { _id: request.params.jobId },
              // { "proposals._id": request.params.proposalId },
              // {
              //   "proposals.mentor_check.mentor": account.email,
              // },
            ],
          },
          {
            $set: {
              "proposals.$[proposal].proposal_status": 1, //pending : approve
              "proposals.$[proposal].mentor_check.$[mentorCheckId].checked":
                true,
            },
          },
          {
            arrayFilters: [
              { "proposal._id": request.params.proposalId },
              { "mentorCheckId.mentor": account.id },
            ],
          },
          { new: true }
        );

        const ObjectId = mongoose.Types.ObjectId;

        const approvedProposal = await Job.aggregate([
          {
            $match: {
              _id: new ObjectId(request.params.jobId),
            },
          },
          { $unwind: "$proposals" },
          {
            $match: {
              "proposals._id": new ObjectId(request.params.proposalId),
              "proposals.mentor_check.mentor": account.id,
            },
          },
        ]);
        // } catch (err) {
        //   return response
        //     .response({ status: "err", err: "Applied proposal Not found!" })
        //     .code(404);
        // }

        return response
          .response({ status: "ok", data: approvedProposal })
          .code(200);
      } catch (err) {
        return response
          .response({ status: "err", err: "Approve failed!" })
          .code(501);
      }
    },
  },
  {
    method: "PUT",
    path: "/{jobId}/viewed/{proposalId}",
    options: {
      auth: "jwt",
      description: "Approve proposal",
      plugins: approveProposalSwagger,
      tags: ["api", "proposal"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();

        // Check whether account is mentor
        const account = await Account.findOne({
          email: request.auth.credentials.email,
        });
        if (account.account_type !== "client") {
          return response
            .response({ status: "err", err: "Forbidden request" })
            .code(403);
        }
        // try {
        await Job.findOneAndUpdate(
          {
            $and: [
              { _id: request.params.jobId },
              // { "proposals._id": request.params.proposalId },
              // {
              //   "proposals.mentor_check.mentor": account.email,
              // },
            ],
          },
          {
            $set: {
              "proposals.$[proposal].proposal_status": 3, //pending : viewed by client
              "proposals.$[proposal].mentor_check.$[mentorCheckId].checked":
                true,
            },
          },
          {
            arrayFilters: [
              { "proposal._id": request.params.proposalId },
              { "mentorCheckId.mentor": account.id },
            ],
          },
          { new: true }
        );

        const ObjectId = mongoose.Types.ObjectId;

        const approvedProposal = await Job.aggregate([
          {
            $match: {
              _id: new ObjectId(request.params.jobId),
            },
          },
          { $unwind: "$proposals" },
          {
            $match: {
              "proposals._id": new ObjectId(request.params.proposalId),
              "proposals.mentor_check.mentor": account.id,
            },
          },
        ]);
        // } catch (err) {
        //   return response
        //     .response({ status: "err", err: "Applied proposal Not found!" })
        //     .code(404);
        // }

        return response
          .response({ status: "ok", data: approvedProposal })
          .code(200);
      } catch (err) {
        return response
          .response({ status: "err", err: "Approve failed!" })
          .code(501);
      }
    },
  },
  {
    method: "PUT",
    path: "/{jobId}/offer/{proposalId}",
    options: {
      auth: "jwt",
      description: "Offer proposal",
      plugins: offerProposalSwagger,
      tags: ["api", "proposal"],
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
            .response({ status: "err", err: "Forbidden request" })
            .code(403);
        }
        // try {
        await Job.findOneAndUpdate(
          {
            $and: [
              { _id: request.params.jobId },
              // { "proposals._id": request.params.proposalId },
              // {
              //   "proposals.mentor_check.mentor": account.email,
              // },
            ],
          },
          {
            $set: {
              "proposals.$[proposal].proposal_status": 5, //proposal offered
              "proposals.$[proposal].mentor_check.$[mentorCheckId].checked":
                true,
              state: 2,
            },
          },
          {
            arrayFilters: [
              { "proposal._id": request.params.proposalId },
              { "mentorCheckId.mentor": account.id },
            ],
          },
          { new: true }
        );

        const ObjectId = mongoose.Types.ObjectId;

        const findedProposal = await Job.aggregate([
          {
            $match: {
              _id: new ObjectId(request.params.jobId),
            },
          },
          {
            $unwind: "$proposals",
          },
          {
            $match: {
              "proposals._id": new ObjectId(request.params.proposalId),
            },
          },
          {
            $project: {
              proposals: 1,
            },
          },
        ]);

        await Expert.findOneAndUpdate(
          {
            account: findedProposal[0].proposals.expert.id,
          },
          {
            $push: {
              ongoing_project: { project: request.params.jobId },
            },
          }
        );

        const approvedProposal = await Job.aggregate([
          {
            $match: {
              _id: new ObjectId(request.params.jobId),
            },
          },
          { $unwind: "$proposals" },
          {
            $match: {
              "proposals._id": new ObjectId(request.params.proposalId),
            },
          },
        ]);
        // } catch (err) {
        //   return response
        //     .response({ status: "err", err: "Applied proposal Not found!" })
        //     .code(404);
        // }

        return response
          .response({ status: "ok", data: approvedProposal })
          .code(200);
      } catch (err) {
        return response
          .response({ status: "err", err: "Approve failed!" })
          .code(501);
      }
    },
  },
  {
    method: "PUT",
    path: "/{jobId}/hire/{proposalId}",
    options: {
      auth: "jwt",
      description: "Hire proposal",
      plugins: hireProposalSwagger,
      tags: ["api", "proposal"],
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
            .response({ status: "err", err: "Forbidden request" })
            .code(403);
        }
        // try {
        await Job.findOneAndUpdate(
          {
            $and: [
              { _id: request.params.jobId },
              // { "proposals._id": request.params.proposalId },
              // {
              //   "proposals.mentor_check.mentor": account.email,
              // },
            ],
          },
          {
            $set: {
              "proposals.$[proposal].proposal_status": 6, //proposal hired
              "proposals.$[proposal].mentor_check.$[mentorCheckId].checked":
                true,
              state: 2,
            },
          },
          {
            arrayFilters: [
              { "proposal._id": request.params.proposalId },
              { "mentorCheckId.mentor": account.id },
            ],
          },
          { new: true }
        );

        const ObjectId = mongoose.Types.ObjectId;

        const findedProposal = await Job.aggregate([
          {
            $match: {
              _id: new ObjectId(request.params.jobId),
            },
          },
          {
            $unwind: "$proposals",
          },
          {
            $match: {
              "proposals._id": new ObjectId(request.params.proposalId),
            },
          },
          {
            $project: {
              proposals: 1,
            },
          },
        ]);

        await Expert.findOneAndUpdate(
          {
            account: findedProposal[0].proposals.expert.id,
          },
          {
            $push: {
              ongoing_project: { project: request.params.jobId },
            },
          }
        );

        const approvedProposal = await Job.aggregate([
          {
            $match: {
              _id: new ObjectId(request.params.jobId),
            },
          },
          { $unwind: "$proposals" },
          {
            $match: {
              "proposals._id": new ObjectId(request.params.proposalId),
            },
          },
        ]);
        // } catch (err) {
        //   return response
        //     .response({ status: "err", err: "Applied proposal Not found!" })
        //     .code(404);
        // }

        return response
          .response({ status: "ok", data: approvedProposal })
          .code(200);
      } catch (err) {
        return response
          .response({ status: "err", err: "Approve failed!" })
          .code(501);
      }
    },
  },
];
