import { Request, ResponseToolkit } from "@hapi/hapi";
import Jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import AWS from "aws-sdk";

import Account from "../models/account";
import Passcode from "../models/passcode";
import config from "../config";
import {
  createAccountSwagger,
  verifyEmailSwagger,
  signinAccountSwagger,
  currentAccountSwagger,
  changeAccountPasswordSwagger,
  forgotAccountPasswordSwagger,
  updateAccountPasswordSwagger,
  resetAccountPasswordSwagger,
  getAccountProfileSwagger,
} from "../swagger/account";
import {
  changeAccountPasswordSchema,
  createAccountSchema,
  forgotAccountPasswordSchemna,
  resetAccountPasswordSchema,
  signinAccountSchema,
  updateAccountPasswordSchema,
} from "../validation/account";
import sendMail from "../utils/sendMail";
import Client from "../models/profile/client";
import Expert from "../models/profile/expert";
import Mentor from "../models/profile/mentor";

const options = { abortEarly: false, stripUnknown: true };

export let accountRoute = [
  {
    method: "POST",
    path: "/register",
    options: {
      description: "Register Account",
      plugins: createAccountSwagger,
      tags: ["api", "account"],
      validate: {
        payload: createAccountSchema,
        options,
        failAction: (request, h, error) => {
          const details = error.details.map((d) => {
            return {
              // message: d.message,
              err: d.message,
              // path: d.path,
            };
          });
          return h.response(details).code(400).takeover();
        },
      },
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const email = request.payload["email"];
        const account = await Account.findOne({ email });
        if (account) {
          return response
            .response({
              err: "Account already exists",
            })
            .code(409);
        }

        const newAccount = new Account(request.payload);
        const { password } = newAccount;
        const hash = await bcrypt.hash(password, 10);
        newAccount.password = hash;

        const token = Jwt.sign({ newAccount: newAccount }, config.jwtSecret, {
          expiresIn: "1day",
        });

        const baseUrl = `${request.server.info.protocol}://${request.info.host}`;
        //         const ses = new AWS.SES({
        //   region: config.awsRegion,
        //   accessKeyId: config.awsAccessKeyId,
        //   secretAccessKey: config.awsSecretAccessKey,
        // });

        const content = `<tr><td style="background-color:rgba(255,255,255,1);padding-top:30px;padding-bottom:30px">
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tbody><tr><td align="left" style="padding-top:0;padding-bottom:20px;padding-left:30px">
        <span style="font-size:40px;color:rgb(27,158,197)">Auxilar</span>
        </td></tr>
        <tr><td style="font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;
        padding:20px"><h2 style="margin-top:0;margin-bottom:0;font-family:Helvetica,sans-serif;
        font-weight:normal;font-size:24px;line-height:30px;color:rgba(0,30,0,1)">
        Verify your email address to complete registration</h2></td></tr>
        <tr><td style="font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;
        padding-left:20px;padding-right:20px;padding-top:20px">Hi ${request.payload["first_name"]} ${request.payload["last_name"]} , </td></tr>
        <tr><td style="font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;
        padding-left:20px;padding-right:20px;padding-top:20px">
        Thanks for your interest in joining Auxilar! To complete your registration, we need you to
         verify your email address. </td></tr><tr><td style="font-family:Helvetica,Arial,sans-serif;
         font-size:16px;line-height:24px;padding:40px 20px 20px"><table style="text-align:center"
          width="100%" border="0" cellspacing="0" cellpadding="0"><tbody>
          <tr><td><div style="text-align:center;margin:0 auto"><a style="background-color:rgb(27,158,197);
          border:2px solid rgb(0,123,168);border-radius:100px;min-width:230px;color:rgba(255,255,255,1);
          white-space:nowrap;font-weight:normal;display:block;font-family:Helvetica,Arial,sans-serif;
          font-size:16px;line-height:40px;text-align:center;text-decoration:none"
          href="https://auxilar.org/account/verify-email/${token}" target="_blank"
          data-saferedirecturl="https://www.google.com/url?q="https://auxilar.org/account/verify-email/${token}">
          Verify Email</a></div></td></tr></tbody></table></td></tr><tr>
          <td style="font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;
          padding-left:20px;padding-right:20px;padding-top:20px">
          Please note that not all applications to join Auxilar are accepted.
          We will notify you of our decision by email within 24 hours. </td></tr>
          <tr><td style="font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;
          padding-left:20px;padding-right:20px;padding-top:30px"><div style="padding-top:10px">
          Thanks for your time,<br>The Auxilar Team</div></td></tr></tbody></table></td></tr>`;
        // const content = `<tr><td style="background-color:rgba(255,255,255,1);padding-top:30px;padding-bottom:30px">
        // <table border="0" cellpadding="0" cellspacing="0" width="100%">
        // <tbody><tr><td align="left" style="padding-top:0;padding-bottom:20px;padding-left:30px">
        // <span style="font-size:40px;color:rgb(27,158,197)">Auxilar</span>
        // </td></tr>
        // <tr><td style="font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;
        // padding:20px"><h2 style="margin-top:0;margin-bottom:0;font-family:Helvetica,sans-serif;
        // font-weight:normal;font-size:24px;line-height:30px;color:rgba(0,30,0,1)">
        // Verify your email address to complete registration</h2></td></tr>
        // <tr><td style="font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;
        // padding-left:20px;padding-right:20px;padding-top:20px">Hi ${request.payload["first_name"]} ${request.payload["last_name"]} , </td></tr>
        // <tr><td style="font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;
        // padding-left:20px;padding-right:20px;padding-top:20px">
        // Thanks for your interest in joining Auxilar! To complete your registration, we need you to
        //  verify your email address. </td></tr><tr><td style="font-family:Helvetica,Arial,sans-serif;
        //  font-size:16px;line-height:24px;padding:40px 20px 20px"><table style="text-align:center"
        //   width="100%" border="0" cellspacing="0" cellpadding="0"><tbody>
        //   <tr><td><div style="text-align:center;margin:0 auto"><a style="background-color:rgb(27,158,197);
        //   border:2px solid rgb(0,123,168);border-radius:100px;min-width:230px;color:rgba(255,255,255,1);
        //   white-space:nowrap;font-weight:normal;display:block;font-family:Helvetica,Arial,sans-serif;
        //   font-size:16px;line-height:40px;text-align:center;text-decoration:none"
        //   href="http://195.201.56.175/account/verify-email/${token}" target="_blank"
        //   data-saferedirecturl="https://www.google.com/url?q="http://195.201.56.175/account/verify-email/${token}">
        //   Verify Email</a></div></td></tr></tbody></table></td></tr><tr>
        //   <td style="font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;
        //   padding-left:20px;padding-right:20px;padding-top:20px">
        //   Please note that not all applications to join Auxilar are accepted.
        //   We will notify you of our decision by email within 24 hours. </td></tr>
        //   <tr><td style="font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;
        //   padding-left:20px;padding-right:20px;padding-top:30px"><div style="padding-top:10px">
        //   Thanks for your time,<br>The Auxilar Team</div></td></tr></tbody></table></td></tr>`;

        sendMail(email, content);
        return response
          .response({
            status: "ok",
            data: "verify Email!",
          })
          .code(201);
        // linkUrl: `localhost:3000/verify-email/${token}`,
      } catch (error) {
        return response.response(error).code(500);
      }
    },
  },
  {
    method: "GET",
    path: "/verify-email/{token}",
    options: {
      // auth: "jwt",
      description: "Verify Email",
      plugins: verifyEmailSwagger,
      tags: ["api", "account"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const decoded = Jwt.decode(request.params.token);
        const account = new Account(decoded.newAccount);
        account.verified_status = true;
        account.active = true;
        const currentDate = new Date().toUTCString();
        account.created_at = currentDate;
        account.last_logged_in = currentDate;
        await account.save();

        const token = Jwt.sign(
          { accountId: account.id, email: account.email },
          config.jwtSecret,
          {
            expiresIn: "1h",
          }
        );

        return response
          .response({
            msg: "Verify Email Success",
          })
          .code(200);
      } catch (error) {
        return response.response(error).code(500);
      }
    },
  },
  {
    method: "POST",
    path: "/signin",
    options: {
      // auth: "jwt",
      description: "Authenticate account & get token",
      plugins: signinAccountSwagger,
      tags: ["api", "account"],
      validate: {
        payload: signinAccountSchema,
        options,
        failAction: (request, h, error) => {
          const details = error.details.map((d) => {
            return {
              err: d.message,
            };
          });
          return h.response(details).code(400).takeover();
        },
      },
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const email = request.payload["email"];
        const password = request.payload["password"];
        const account = await Account.findOne({ email });
        if (!account) {
          return response.response({ err: "Account not found!" }).code(404);
        } else if (!account.verified_status) {
          return response
            .response({ err: "Email verify is required!" })
            .code(402);
        }
        if (!account.active) {
          return response
            .response({
              err: "You account is disabled! Please contact auxilarorg@gmail.com.",
            })
            .code(404);
        }

        const isMatch = await bcrypt.compare(password, account.password);
        if (!isMatch) {
          return response.response({ err: "Password incorrect." }).code(405);
        }

        const token = Jwt.sign(
          { accountId: account.id, email: account.email },
          config.jwtSecret,
          {
            expiresIn: "1d",
          }
        );
        const currentDate = new Date().toUTCString();
        account.last_logged_in = currentDate;
        await account.save();

        return response.response({ token }).code(200);
      } catch (error) {
        return response.response(error).code(500);
      }
    },
  },
  {
    method: "GET",
    path: "/me",
    options: {
      auth: "jwt",
      description: "Get account by token",
      plugins: currentAccountSwagger,
      tags: ["api", "account"],
    },

    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const account = await Account.findOne({
          email: request.auth.credentials.email,
        }).select("-password");
        if (!account) {
          return response.response({ err: "Account not found!" }).code(404);
        }
        const fullName = account.first_name + " " + account.last_name;
        return response
          .response({
            account,
          })
          .code(200);
      } catch (error) {
        return response.response(error).code(500);
      }
    },
  },
  {
    method: "POST",
    path: "/change-password",
    options: {
      auth: "jwt",
      description: "Change password",
      plugins: changeAccountPasswordSwagger,
      tags: ["api", "account"],
      validate: {
        payload: changeAccountPasswordSchema,
        options,
        failAction: (request, h, error) => {
          const details = error.details.map((d) => {
            return {
              // message: d.message,
              err: d.message,
              // path: d.path,
            };
          });
          return h.response(details).code(400).takeover();
        },
      },
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const new_Password = request.payload["new_password"];
        const account = await Account.findById(
          request.auth.credentials.accountId
        );

        const hash = await bcrypt.hash(new_Password, 10);
        account.password = hash;
        await account.save();
        return response
          .response({ msg: "Successfuly changed password" })
          .code(200);
      } catch (error) {
        return response.response(error).code(500);
      }
    },
  },
  {
    method: "POST",
    path: "/forgot-password",
    options: {
      description: "forgot password",
      plugins: forgotAccountPasswordSwagger,
      tags: ["api", "account"],
      validate: {
        payload: forgotAccountPasswordSchemna,
        options,
        failAction: (requeset, h, error) => {
          const details = error.details.map((d) => {
            return {
              err: d.message,
            };
          });
          return h.response(details).code(400).takeover();
        },
      },
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const account = await Account.findOne({
          email: request.payload["email"],
        });
        if (!account) {
          return response.response({ err: "Account not found" }).code(404);
        }

        const random6Digits = Math.floor(Math.random() * 1000000);

        const newPasscode = new Passcode({
          email: account.email,
          passcode: random6Digits,
        });
        newPasscode.save();

        // const token = Jwt.sign(
        //   { accountId: account.id, email: account.email },
        //   config.jwtSecret,
        //   {
        //     expiresIn: "1day",
        //   }
        // );

        const baseUrl = `${request.server.info.protocol}://${request.info.host}`;
        // linkUrl: `localhost:3000/account/update-password/${token}`,

        // const content = `Hi ${request.payload["first_name"]} ${request.payload["last_name"]}
        //                 Thanks for your interest in joining Auxilar! To complete your registration, we need you to
        //                 verify your email address."http://136.243.150.17:3000/account/verify-email/${token}"
        //                 Verify Email!
        //                 Please note that not all applications to join Auxilar are accepted.
        //                 We will notify you of our decision by email within 24 hours.
        //                 Thanks for your time,
        //                 The Auxilar Team`;
        const content = `<tr><td style="background-color:rgba(255,255,255,1);padding-top:30px;padding-bottom:30px">
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tbody><tr><td align="left" style="padding-top:0;padding-bottom:20px;padding-left:30px">
        <span style="font-size:40px;color:rgb(27,158,197)">Auxilar</span>
        </td></tr>
        <tr><td style="font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;
        padding:20px"><h2 style="margin-top:0;margin-bottom:0;font-family:Helvetica,sans-serif;
        font-weight:normal;font-size:24px;line-height:30px;color:rgba(0,30,0,1)">
        Update Password</h2></td></tr>
        <tr><td style="font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;
        padding-left:20px;padding-right:20px;padding-top:20px">Hi ${account.first_name} ${account.last_name} , </td></tr>
        <tr><td style="font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;
        padding-left:20px;padding-right:20px;padding-top:20px">
        Thanks for your interest in Auxilar! To complete your password update, we need you to
         reset your password first. </td></tr><tr><td style="font-family:Helvetica,Arial,sans-serif;
         font-size:16px;line-height:24px;padding:40px 20px 20px"><table style="text-align:center"
          width="100%" border="0" cellspacing="0" cellpadding="0"><tbody>
          <tr><td><div style="text-align:center;margin:0 auto">
          passcode: ${random6Digits}</div></td></tr></tbody></table></td></tr><tr>
          <td style="font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;
          padding-left:20px;padding-right:20px;padding-top:20px">
          Please note that not all applications to join Auxilar are accepted.
          We will notify you of our decision by email within 24 hours. </td></tr>
          <tr><td style="font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;
          padding-left:20px;padding-right:20px;padding-top:30px"><div style="padding-top:10px">
          Thanks for your time,<br>The Auxilar Team</div></td></tr></tbody></table></td></tr>`;

        sendMail(request.payload["email"], content);
        return response
          .response({ status: "ok", data: "Reset Password" })
          .code(200);
      } catch (error) {
        return response.response(error).code(500);
      }
    },
  },
  {
    method: "POST",
    path: "/reset-password",
    options: {
      description: "Reset password",
      plugins: resetAccountPasswordSwagger,
      tags: ["api", "account"],
      validate: {
        payload: resetAccountPasswordSchema,
        options,
        failAction: (request, h, error) => {
          const details = error.details.map((d) => {
            return {
              err: d.message,
            };
          });
          return h.response(details).code(400).takeover();
        },
      },
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const email = request.payload["email"];
        const code = request.payload["passcode"];
        const passcode = await Passcode.findOne({
          email: email,
          passcode: code,
        });

        if (!passcode) {
          return response.response({ err: "Passcode incorrect!" }).code(404);
        }

        const token = Jwt.sign({ passcode: passcode }, config.jwtSecret, {
          expiresIn: "1day",
        });

        return response.response({ status: "ok", data: token }).code(200);
      } catch (error) {
        return response.response(error).code(500);
      }
    },
  },

  {
    method: "POST",
    path: "/update-password/{token}",
    options: {
      description: "Update password",
      plugins: updateAccountPasswordSwagger,
      tags: ["api", "account"],
      validate: {
        payload: updateAccountPasswordSchema,
        options,
        failAction: (request, h, error) => {
          const details = error.details.map((d) => {
            return {
              // message: d.message,
              err: d.message,
              // path: d.path,
            };
          });
          return h.response(details).code(400).takeover();
        },
      },
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const decodedtoken = Jwt.decode(request.params.token);
        const passcode = await Passcode.findOne({
          email: decodedtoken.passcode.email,
          passcode: decodedtoken.passcode.passcode,
        });
        if (!passcode) {
          return response
            .response({ status: "err", err: "Passcode incorrect" })
            .code(412); // 412: precondition failed
        }

        const email = request.payload["email"];
        const new_Password = request.payload["new_password"];
        const account = await Account.findOne({ email });
        if (!account) {
          return response
            .response({ status: "err", err: "Account not found" })
            .code(404);
        }
        const hash = await bcrypt.hash(new_Password, 10);
        account.password = hash;
        await account.save();
        // return response.response({ account }).code(200);
        return response.response({ msg: "update Success!" }).code(200);
      } catch (error) {
        return response.response(error).code(500);
      }
    },
  },

  {
    method: "GET",
    path: "/mentors",
    options: {
      auth: "jwt",
      description: "Get mentor list",
      plugins: currentAccountSwagger,
      tags: ["api", "account"],
    },

    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();
        const account = await Account.find({
          account_type: "mentor",
        }).select({ email: 1, first_name: 1, last_name: 1 });
        return response
          .response({
            account,
          })
          .code(200);
      } catch (error) {
        return response.response(error).code(500);
      }
    },
  },

  {
    method: "GET",
    path: "/profile/{accountId}",
    options: {
      auth: "jwt",
      description: "GET account profile",
      plugins: getAccountProfileSwagger,
      tags: ["api", "account"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();
        const account = await Account.findById(request.params.accountId);
        if (!account) {
          return response
            .response({ status: "err", err: "Account not found!" })
            .code(404);
        }

        // Get account profile
        let accountProfile = null;
        if (account.account_type === "client") {
          accountProfile = await Client.aggregate([
            { $match: { account: account._id } },
            {
              $lookup: {
                from: "accounts",
                localField: "account",
                foreignField: "_id",
                as: "account_info",
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
          accountProfile = await Expert.aggregate([
            { $match: { account: account._id } },
            {
              $lookup: {
                from: "accounts",
                localField: "account",
                foreignField: "_id",
                as: "account_info",
                pipeline: [
                  {
                    $project: {
                      _id: false,
                      first_name: 1,
                      last_name: 1,
                      country: "$account_info.country",
                      state: "$account_info.state",
                      city: "$account_info.city",
                      languages: "$account_info.languages",
                      avatar: "$account_info.avatar",
                      hourly_rate: "$account_info.hourly_rate",
                      summary: "$account_info.summary",
                      titleName: "$account_info.titleName",
                      skills: "$account_info.skills",
                      majors: "$account_info.majors",
                    },
                  },
                ],
              },
            },
          ]);
        } else {
          accountProfile = await Mentor.aggregate([
            { $match: { account: account._id } },
            {
              $lookup: {
                from: "accounts",
                localField: "account",
                foreignField: "_id",
                as: "account_info",
                pipeline: [
                  {
                    $project: {
                      _id: false,
                      first_name: 1,
                      last_name: 1,
                      country: "$account_info.country",
                      avatar: "$account_info.avatar",
                      summary: "$account_inf0.summary",
                      profesionalInfo: "$account_info.professional_info",
                    },
                  },
                ],
              },
            },
          ]);
        }
        if (!accountProfile) {
          return response
            .response({ status: "err", err: "Profile not found!" })
            .code(404);
        }

        return response.response({ status: "ok", data: accountProfile });
      } catch (error) {
        return response.response(error).code(500);
      }
    },
  },
];
