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
        console.log(`POST api/v1/account/register request from ...`);
        const email = request.payload["email"];
        const account = await Account.findOne({ email });
        if (account) {
          return response
            .response({
              err: "Account already exists",
            })
            .code(409);
        }
        // console.log("account register request ---->", request.payload);

        const newAccount = new Account(request.payload);
        const { password } = newAccount;
        const hash = await bcrypt.hash(password, 10);
        newAccount.password = hash;

        // const result = await newAccount.save();
        const token = Jwt.sign({ newAccount: newAccount }, config.jwtSecret, {
          expiresIn: "1day",
        });

        const baseUrl = `${request.server.info.protocol}://${request.info.host}`;
        // console.log(baseUrl);
        // const content =

        // return response
        // .response({
        //   email: result.email,
        //   first_name: result.first_name,
        //   last_name: result.last_name,
        // })
        // .code(201);

        // front-end URL
        // Create a transporter object using the SMTP transport
        // const transporter = nodemailer.createTransport({
        //   service: "Gmail",
        //   auth: {
        //     user: "oliver970315@gmail.com", // replace with your gmail address
        //     pass: "Qwe1234!@#$" // replace with your gmail password or app-specific password if enabled
        //   }
        // });
        // console.log("1");
        // const content = `<div style="background-color: #f2f2f2; padding: 20px; border-radius: 10px;"><h1 style="font-size: 36px; color: #333; margin-bottom: 20px;">Hello</h1><p style="font-size: 18px; color: #666; margin-bottom: 20px;">Welcome To Homepage</p><p style="font-size: 18px; color: #666; margin-bottom: 40px;">This is your email verification link. Please click the button below to verify your email:</p><a href="${baseUrl}/api/v1/user/verify-email/${token}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 10px; font-size: 18px;">Verify Email</a></div>`;
        const ses = new AWS.SES({
          region: config.awsRegion,
          accessKeyId: config.awsAccessKeyId,
          secretAccessKey: config.awsSecretAccessKey,
        });

        // const content = `Hi ${request.payload["first_name"]} ${request.payload["last_name"]}
        //                 Thanks for your interest in joining Auxilar! To complete your registration, we need you to
        //                 verify your email address."http://3.88.116.42:3000/account/verify-email/${token}"
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
          href="http://3.88.116.42:3000/account/verify-email/${token}" target="_blank"
          data-saferedirecturl="https://www.google.com/url?q="http://3.88.116.42:3000/account/verify-email/${token}">
          Verify Email</a></div></td></tr></tbody></table></td></tr><tr>
          <td style="font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;
          padding-left:20px;padding-right:20px;padding-top:20px">
          Please note that not all applications to join Auxilar are accepted.
          We will notify you of our decision by email within 24 hours. </td></tr>
          <tr><td style="font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;
          padding-left:20px;padding-right:20px;padding-top:30px"><div style="padding-top:10px">
          Thanks for your time,<br>The Auxilar Team</div></td></tr></tbody></table></td></tr>`;

        const emailParams = {
          Source: "galaxydragon0702@gmail.com",
          Destination: {
            ToAddresses: [newAccount.email],
          },
          Message: {
            Subject: {
              Data: "Verify Email",
            },
            Body: {
              Html: {
                Data: content,
              },
            },
          },
        };

        ses.sendEmail(emailParams, (err, data) => {
          if (err) {
            console.log("Error sending email:", err);
          } else {
            console.log("Email sent successfully:", data);
          }
        });

        // sendMail(newAccount.email, content);
        return response
          .response({
            status: "ok",
            data: "verify Email!",
          })
          .code(201);
        // linkUrl: `localhost:3000/verify-email/${token}`,
      } catch (error) {
        console.log("===================================>>>>>>>>>>> ", error);
        return response.response({ status: "err", err: error }).code(500);
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
        console.log(
          `GET api/v1/account/verify-email/${request.params.token} request from ...`
        );

        // console.log(request.params.token);
        // console.log(request.auth.credentials.accountId);
        // const account = await Account.findById(request.auth.credentials.accountId);
        const decoded = Jwt.decode(request.params.token);
        console.log(decoded);
        // console.log(decoded);
        // const account = await Account.findById(decoded.accountId);
        const account = new Account(decoded.newAccount);
        // if (account) {
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
        // }
        // return response
        //   .response({
        //     err: verifyEmailSwagger["hapi-swagger"].responses[400].description,
        //   })
        //   .code(400);
      } catch (error) {
        console.log(error);
        return response.response({ err: error }).code(400);
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
        console.log(
          `POST api/v1/account/signin request from ${request.payload["email"]}`
        );

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
        account.active = true;
        await account.save();

        return response.response({ token }).code(200);
      } catch (error) {
        console.log(error);
        return response.response({ err: error }).code(500);
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
        console.log(
          `GET api/v1/account/me request from ${request.auth.credentials.email}`
        );
        console.log(request.auth.credentials.email);
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
        console.log(error);
        return response.response({ err: error }).code(500);
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
        console.log(
          `POST api/v1/account/change-password request from ${request.auth.credentials.email}`
        );
        const new_Password = request.payload["new_password"];
        const account = await Account.findById(
          request.auth.credentials.accountId
        );
        // if (!account) {
        //   return response
        //   .response({msg: 'Account not found'}).code(404);
        // }
        const hash = await bcrypt.hash(new_Password, 10);
        account.password = hash;
        await account.save();
        return response
          .response({ msg: "Successfuly changed password" })
          .code(200);
      } catch (error) {
        console.log(error);
        return response.response({ err: error }).code(500);
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
        console.log(`POST api/v1/account/forgot-password request from ...`);
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

        const ses = new AWS.SES({
          region: config.awsRegion,
          accessKeyId: config.awsAccessKeyId,
          secretAccessKey: config.awsSecretAccessKey,
        });

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
        data-saferedirecturl="https://www.google.com/url?q="http://3.88.116.42:3000/account/reset-password">
        passcode: ${random6Digits}</div></td></tr></tbody></table></td></tr><tr>
        <td style="font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;
        padding-left:20px;padding-right:20px;padding-top:20px">
        Please note that not all applications to join Auxilar are accepted.
        We will notify you of our decision by email within 24 hours. </td></tr>
        <tr><td style="font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;
        padding-left:20px;padding-right:20px;padding-top:30px"><div style="padding-top:10px">
        Thanks for your time,<br>The Auxilar Team</div></td></tr></tbody></table></td></tr>`;

        const emailParams = {
          Source: "galaxydragon0702@gmail.com",
          Destination: {
            ToAddresses: [account.email],
          },
          Message: {
            Subject: {
              Data: "Reset Password",
            },
            Body: {
              Html: {
                Data: content,
              },
            },
          },
        };

        ses.sendEmail(emailParams, (err, data) => {
          if (err) {
            console.log("Error sending email:", err);
          } else {
            console.log("Email sent successfully:", data);
          }
        });

        return response
          .response({ status: "ok", data: "Reset Password" })
          .code(200);
      } catch (error) {
        console.log(error);
        return response.response({ status: "err", err: error }).code(500);
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
      console.log(`POST api/v1/account/reset-password request from ...`);
      const email = request.payload["email"];
      const code = request.payload["passcode"];
      // const {email, code, new_password} = request.payload
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
        console.log(`POST api/v1/account/update-password request from ...`);

        const decodedtoken = Jwt.decode(request.params.token);

        console.log("decodedtoken---------------->", decodedtoken);

        const passcode = await Passcode.findOne({
          email: decodedtoken.passcode.email,
          passcode: decodedtoken.passcode.passcode,
        });

        console.log("passcode--------------------->", passcode);

        if (!passcode) {
          return response
            .response({ status: "err", err: "Passcode incorrect" })
            .code(412); // 412: precondition failed
        }

        console.log(request.payload);
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
        console.log(error);
        return response.response({ err: error }).code(500);
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
        console.log(
          `GET api/v1/account/mentors request from ${request.auth.credentials.email} Time: ${currentDate}`
        );
        console.log(request.auth.credentials.email);
        const account = await Account.find({
          account_type: "mentor",
        }).select({ email: 1, first_name: 1, last_name: 1 });
        // if (!account) {
        //   return response.response({ err: "Account not found!" }).code(404);
        // }
        // const fullName = account.first_name + " " + account.last_name;
        return response
          .response({
            account,
          })
          .code(200);
      } catch (error) {
        console.log(error);
        return response.response({ status: "err", err: error }).code(500);
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
        console.log(
          `GET api/v1/account/profile/${request.params.accountId} request from ${request.auth.credentials.email} Time: ${currentDate}`
        );

        // Get account info
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
      } catch (err) {
        return response
          .response({ status: "err", err: "Not implemented!" })
          .code(501);
      }
    },
  },
];
