import { Request, ResponseToolkit } from "@hapi/hapi";
import {
  addCategorySwagger,
  addMajorSwagger,
  addSkillSwagger,
  deleteAccountInfoSwagger,
  deleteCategorySwagger,
  deleteMajorSwagger,
  deleteSkillSwagger,
  getAccountInfoSwagger,
  getAllCategorySwagger,
  getAllMajorSwagger,
  getAllSkillSwagger,
  getCategorySwagger,
  getMajorSwagger,
  getSkillSwagger,
  updateAccountStatusSwagger,
  updateCategorySwagger,
  updateMajorSwagger,
  updateSkillSwagger,
} from "../swagger/admin";
import { updateAccountStatusSchema } from "../validation/admin";
import Account from "../models/account";
import {
  addCategorySchmea,
  addMajorSchmea,
  addSkillSchmea,
  udpateCategorySchema,
  udpateMajorSchema,
  udpateSkillSchema,
} from "../validation/admin";
import Skill from "../models/skill";
import Major from "../models/major";
import Category from "../models/category";

const options = { abortEarly: false, stripUnknown: true };
export let adminRoute = [
  {
    method: "PATCH",
    path: "/update/{account_email}",
    options: {
      auth: "jwt",
      description: "update acount status",
      plugins: updateAccountStatusSwagger,
      tags: ["api", "admin"],
      validate: {
        payload: updateAccountStatusSchema,
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
        const currentDate = new Date().toUTCString();

        const admin = await Account.findOne({
          email: request.auth.credentials.email,
        });

        // check wether is admin
        if (admin.account_type !== "admin") {
          return response
            .response({ status: "err", err: "Not allowed account" })
            .code(403);
        }

        // check whether account exist, update status
        try {
          const data = request.payload;

          const account = await Account.findOneAndUpdate(
            { email: request.params.account_email },
            {
              $set: {
                active: data["active"],
              },
            }
          );

          return response
            .response({ status: "ok", data: "Update account status success!" })
            .code(200);
        } catch (err) {
          return response
            .response({ status: "err", err: "Account not found" })
            .code(404);
        }
      } catch (error) {
        return response.response({ staus: "err", err: error }).code(501);
      }
    },
  },
  {
    method: "GET",
    path: "/{accounts_per_page}/{page_index}",
    options: {
      auth: "jwt",
      description: "Get all account info",
      plugins: getAccountInfoSwagger,
      tags: ["api", "admin"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();

        const accounts_per_page: number = Number(
          request.params.accounts_per_page
        );
        const page_index: number = Number(request.params.page_index);
        // check wether admin exist
        const admin = await Account.findOne({
          email: request.auth.credentials.email,
        });

        // check wether is admin
        if (admin.account_type !== "admin") {
          return response
            .response({ status: "err", err: "Not allowed account" })
            .code(403);
        }

        const totalCount = await Account.find({}).count();

        const accountinfo = await Account.aggregate([
          {
            $project: {
              first_name: 1,
              last_name: 1,
              email: 1,
              account_type: 1,
              active: 1,
              _id: 0,
            },
          },
          {
            $skip: accounts_per_page * (page_index - 1),
          },
          {
            $limit: accounts_per_page,
          },
        ]);
        return response
          .response({ status: "ok", data: { totalCount, accountinfo } })
          .code(200);
      } catch (error) {
        return response.response({ status: "err", err: error }).code(501);
      }
    },
  },
  {
    method: "DELETE",
    path: "/delete/{account_email}",
    options: {
      auth: "jwt",
      description: "Delete account",
      plugins: deleteAccountInfoSwagger,
      tags: ["api", "admin"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();
        // check wether admin exist
        const admin = await Account.findOne({
          email: request.auth.credentials.email,
        });

        // check wether is admin
        if (admin.account_type !== "admin") {
          return response
            .response({ status: "err", err: "Not allowed account" })
            .code(403);
        }

        try {
          const deletedAccount = await Account.deleteOne({
            email: request.params.account_email,
          });

          return response
            .response({ status: "ok", data: deletedAccount })
            .code(200);
        } catch (error) {
          return response
            .response({ status: "err", err: "Account not found!" })
            .code(404);
        }
      } catch (error) {
        return response.response({ status: "err", err: error }).code(501);
      }
    },
  },

  // Edit Skills
  {
    method: "POST",
    path: "/skills/add",
    options: {
      auth: "jwt",
      description: "Add skill to skills",
      plugins: addSkillSwagger,
      tags: ["api", "admin"],
      validate: {
        payload: addSkillSchmea,
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
        const currentDate = new Date().toUTCString();
        // check whether admin exist
        const admin = await Account.findOne({
          email: request.auth.credentials.email,
        });

        // check wether is admin
        if (admin.account_type !== "admin") {
          return response
            .response({ status: "err", err: "Not allowed account" })
            .code(403);
        }

        const data = request.payload;

        // check sill whether exist
        const isExistSkill = await Skill.findOne({ name: data["name"] });
        if (isExistSkill) {
          return response
            .response({
              status: "err",
              err: "Skill already exist!",
            })
            .code(409);
        }

        // Add skill to skills
        const skill = new Skill({ name: data["name"] });
        await skill.save();

        return response.response({ status: "ok", data: skill }).code(200);
      } catch (error) {
        return response.response({ staus: "err", err: error }).code(501);
      }
    },
  },

  {
    method: "PUT",
    path: "/skills/update/{skillId}",
    options: {
      auth: "jwt",
      description: "Update skill to skills",
      plugins: updateSkillSwagger,
      tags: ["api", "admin"],
      validate: {
        payload: udpateSkillSchema,
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
        const currentDate = new Date().toUTCString();
        // check whether admin exist
        const admin = await Account.findOne({
          email: request.auth.credentials.email,
        });

        // check whether is admin
        if (admin.account_type !== "admin") {
          return response
            .response({ status: "err", err: "Not allowed account" })
            .code(403);
        }
        const data = request.payload;

        // check sill whether exist
        const isExistSkill = await Skill.findOne({ name: data["name"] });
        if (isExistSkill) {
          return response
            .response({
              status: "err",
              err: "Skill already exist!",
            })
            .code(409);
        }

        // check whether skill exist, update skill
        try {
          const skill = await Skill.findOneAndUpdate(
            {
              _id: request.params.skillId,
            },
            {
              name: data["name"],
            },
            { new: true }
          );

          return response.response({ status: "ok", data: skill }).code(200);
        } catch (err) {
          return response
            .response({ status: "err", err: "Skill not found!" })
            .code(404);
        }
      } catch (error) {
        return response.response({ staus: "err", err: error }).code(501);
      }
    },
  },

  {
    method: "DELETE",
    path: "/skills/delete/{skillId}",
    options: {
      auth: "jwt",
      description: "Delete skill to skills",
      plugins: deleteSkillSwagger,
      tags: ["api", "admin"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();

        // check whether admin exist
        const admin = await Account.findOne({
          email: request.auth.credentials.email,
        });

        // check whether is admin
        if (admin.account_type !== "admin") {
          return response
            .response({ status: "err", err: "Not allowed account" })
            .code(403);
        }

        // check whether skill exist, delete skill
        const data = request.payload;

        const deletedskill = await Skill.deleteOne(
          {
            _id: request.params.skillId,
          },
          { new: true }
        );

        if (deletedskill.deletedCount)
          return response
            .response({ status: "ok", data: "Successfuly deleted!" })
            .code(200);
        else
          return response
            .response({ status: "err", err: "Skill not found!" })
            .code(404);
      } catch (error) {
        return response.response({ staus: "err", err: error }).code(501);
      }
    },
  },

  {
    method: "GET",
    path: "/skills/all",
    options: {
      auth: "jwt",
      description: "get all skills",
      plugins: getAllSkillSwagger,
      tags: ["api", "admin"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();

        // check whether admin exist
        const admin = await Account.findOne({
          email: request.auth.credentials.email,
        });

        // check whether is admin
        if (admin.account_type !== "admin") {
          return response
            .response({ status: "err", err: "Not allowed account" })
            .code(403);
        }

        // check whether skill exist, delete skill
        try {
          const data = request.payload;

          const skills = await Skill.find({});

          return response.response({ status: "ok", data: skills }).code(200);
        } catch (err) {
          return response
            .response({ status: "err", err: "Skill not found!" })
            .code(404);
        }
      } catch (error) {
        return response.response({ staus: "err", err: error }).code(501);
      }
    },
  },

  {
    method: "GET",
    path: "/skills/{skillId}",
    options: {
      auth: "jwt",
      description: "get specific skill",
      plugins: getSkillSwagger,
      tags: ["api", "admin"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();

        // check whether admin exist
        const admin = await Account.findOne({
          email: request.auth.credentials.email,
        });

        // check whether is admin
        if (admin.account_type !== "admin") {
          return response
            .response({ status: "err", err: "Not allowed account" })
            .code(403);
        }

        // check whether skill exist, delete skill
        try {
          const data = request.payload;

          const skills = await Skill.findOne({ _id: request.params.skillId });

          return response.response({ status: "ok", data: skills }).code(200);
        } catch (err) {
          return response
            .response({ status: "err", err: "Skill not found!" })
            .code(404);
        }
      } catch (error) {
        return response.response({ staus: "err", err: error }).code(501);
      }
    },
  },

  // Edit Majors
  {
    method: "POST",
    path: "/majors/add",
    options: {
      auth: "jwt",
      description: "Add major to majors",
      plugins: addMajorSwagger,
      tags: ["api", "admin"],
      validate: {
        payload: addMajorSchmea,
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
        const currentDate = new Date().toUTCString();
        // check whether admin exist
        const admin = await Account.findOne({
          email: request.auth.credentials.email,
        });

        // check wether is admin
        if (admin.account_type !== "admin") {
          return response
            .response({ status: "err", err: "Not allowed account" })
            .code(403);
        }

        const data = request.payload;

        // check sill whether exist
        const isExistMajor = await Major.findOne({ name: data["name"] });
        if (isExistMajor) {
          return response
            .response({
              status: "err",
              err: "Major already exist!",
            })
            .code(409);
        }

        // Add major to majors
        const major = new Major({ name: data["name"] });
        await major.save();

        return response.response({ status: "ok", data: major }).code(200);
      } catch (error) {
        return response.response({ staus: "err", err: error }).code(501);
      }
    },
  },

  {
    method: "PUT",
    path: "/majors/update/{majorId}",
    options: {
      auth: "jwt",
      description: "Update major to majors",
      plugins: updateMajorSwagger,
      tags: ["api", "admin"],
      validate: {
        payload: udpateMajorSchema,
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
        const currentDate = new Date().toUTCString();
        // check whether admin exist
        const admin = await Account.findOne({
          email: request.auth.credentials.email,
        });

        // check whether is admin
        if (admin.account_type !== "admin") {
          return response
            .response({ status: "err", err: "Not allowed account" })
            .code(403);
        }
        const data = request.payload;

        // check major whether exist
        const isExistMajor = await Major.findOne({ name: data["name"] });
        if (isExistMajor) {
          return response
            .response({
              status: "err",
              err: "Major already exist!",
            })
            .code(409);
        }

        // check whether major exist, update major
        try {
          const major = await Major.findOneAndUpdate(
            {
              _id: request.params.majorId,
            },
            {
              name: data["name"],
            },
            { new: true }
          );

          return response.response({ status: "ok", data: major }).code(200);
        } catch (err) {
          return response
            .response({ status: "err", err: "Major not found!" })
            .code(404);
        }
      } catch (error) {
        return response.response({ staus: "err", err: error }).code(501);
      }
    },
  },

  {
    method: "DELETE",
    path: "/majors/delete/{majorId}",
    options: {
      auth: "jwt",
      description: "Delete major to majors",
      plugins: deleteMajorSwagger,
      tags: ["api", "admin"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();
        // check whether admin exist
        const admin = await Account.findOne({
          email: request.auth.credentials.email,
        });

        // check whether is admin
        if (admin.account_type !== "admin") {
          return response
            .response({ status: "err", err: "Not allowed account" })
            .code(403);
        }

        // check whether major exist, delete major
        const data = request.payload;

        const deletedmajor = await Major.deleteOne(
          {
            _id: request.params.majorId,
          },
          { new: true }
        );
        if (deletedmajor.deletedCount)
          return response
            .response({ status: "ok", data: "Successfuly deleted!" })
            .code(200);
        else
          return response
            .response({ status: "err", err: "Major not found!" })
            .code(404);
      } catch (error) {
        return response.response({ staus: "err", err: error }).code(501);
      }
    },
  },

  {
    method: "GET",
    path: "/majors/all",
    options: {
      auth: "jwt",
      description: "get all majors",
      plugins: getAllMajorSwagger,
      tags: ["api", "admin"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();
        // check whether admin exist
        const admin = await Account.findOne({
          email: request.auth.credentials.email,
        });

        // check whether is admin
        if (admin.account_type !== "admin") {
          return response
            .response({ status: "err", err: "Not allowed account" })
            .code(403);
        }

        // check whether major exist, delete major
        try {
          const data = request.payload;

          const majors = await Major.find({});

          return response.response({ status: "ok", data: majors }).code(200);
        } catch (err) {
          return response
            .response({ status: "err", err: "Major not found!" })
            .code(404);
        }
      } catch (error) {
        return response.response({ staus: "err", err: error }).code(501);
      }
    },
  },

  {
    method: "GET",
    path: "/majors/{majorId}",
    options: {
      auth: "jwt",
      description: "get specific major",
      plugins: getMajorSwagger,
      tags: ["api", "admin"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();
        // check whether admin exist
        const admin = await Account.findOne({
          email: request.auth.credentials.email,
        });

        // check whether is admin
        if (admin.account_type !== "admin") {
          return response
            .response({ status: "err", err: "Not allowed account" })
            .code(403);
        }

        // check whether major exist, delete major
        try {
          const data = request.payload;

          const majors = await Major.findOne({ _id: request.params.majorId });

          return response.response({ status: "ok", data: majors }).code(200);
        } catch (err) {
          return response
            .response({ status: "err", err: "Major not found!" })
            .code(404);
        }
      } catch (error) {
        return response.response({ staus: "err", err: error }).code(501);
      }
    },
  },

  // Edit Categories
  {
    method: "POST",
    path: "/categories/add",
    options: {
      auth: "jwt",
      description: "Add category to categories",
      plugins: addCategorySwagger,
      tags: ["api", "admin"],
      validate: {
        payload: addCategorySchmea,
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
        const currentDate = new Date().toUTCString();
        // check whether admin exist
        const admin = await Account.findOne({
          email: request.auth.credentials.email,
        });

        // check wether is admin
        if (admin.account_type !== "admin") {
          return response
            .response({ status: "err", err: "Not allowed account" })
            .code(403);
        }

        const data = request.payload;

        // check sill whether exist
        const isExistCategory = await Category.findOne({ name: data["name"] });
        if (isExistCategory) {
          return response
            .response({
              status: "err",
              err: "Category already exist!",
            })
            .code(409);
        }

        // Add category to categories
        const category = new Category({ name: data["name"] });
        await category.save();

        return response.response({ status: "ok", data: category }).code(200);
      } catch (error) {
        return response.response({ staus: "err", err: error }).code(501);
      }
    },
  },

  {
    method: "PUT",
    path: "/categories/update/{categoryId}",
    options: {
      auth: "jwt",
      description: "Update category to categories",
      plugins: updateCategorySwagger,
      tags: ["api", "admin"],
      validate: {
        payload: udpateCategorySchema,
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
        const currentDate = new Date().toUTCString();
        // check whether admin exist
        const admin = await Account.findOne({
          email: request.auth.credentials.email,
        });

        // check whether is admin
        if (admin.account_type !== "admin") {
          return response
            .response({ status: "err", err: "Not allowed account" })
            .code(403);
        }
        const data = request.payload;

        // check sill whether exist
        const isExistCategory = await Category.findOne({ name: data["name"] });
        if (isExistCategory) {
          return response
            .response({
              status: "err",
              err: "Category already exist!",
            })
            .code(409);
        }

        // check whether category exist, update category
        try {
          const category = await Category.findOneAndUpdate(
            {
              _id: request.params.categoryId,
            },
            {
              name: data["name"],
            },
            { new: true }
          );

          return response.response({ status: "ok", data: category }).code(200);
        } catch (err) {
          return response
            .response({ status: "err", err: "Category not found!" })
            .code(404);
        }
      } catch (error) {
        return response.response({ staus: "err", err: error }).code(501);
      }
    },
  },

  {
    method: "DELETE",
    path: "/categories/delete/{categoryId}",
    options: {
      auth: "jwt",
      description: "Delete category to categories",
      plugins: deleteCategorySwagger,
      tags: ["api", "admin"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();
        // check whether admin exist
        const admin = await Account.findOne({
          email: request.auth.credentials.email,
        });

        // check whether is admin
        if (admin.account_type !== "admin") {
          return response
            .response({ status: "err", err: "Not allowed account" })
            .code(403);
        }

        // check whether category exist, delete category
        const data = request.payload;

        const deletedcategory = await Category.deleteOne(
          {
            _id: request.params.categoryId,
          },
          { new: true }
        );
        if (deletedcategory.deletedCount)
          return response
            .response({ status: "ok", data: "Successfuly deleted!" })
            .code(200);
        else
          return response
            .response({ status: "err", err: "Category not found!" })
            .code(404);
      } catch (error) {
        return response.response({ staus: "err", err: error }).code(501);
      }
    },
  },

  {
    method: "GET",
    path: "/categories/all",
    options: {
      auth: "jwt",
      description: "get all categories",
      plugins: getAllCategorySwagger,
      tags: ["api", "admin"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();
        // check whether admin exist
        const admin = await Account.findOne({
          email: request.auth.credentials.email,
        });

        // check whether is admin
        if (admin.account_type !== "admin") {
          return response
            .response({ status: "err", err: "Not allowed account" })
            .code(403);
        }

        // check whether category exist, delete category
        try {
          const data = request.payload;

          const categories = await Category.find({});

          return response
            .response({ status: "ok", data: categories })
            .code(200);
        } catch (err) {
          return response
            .response({ status: "err", err: "Category not found!" })
            .code(404);
        }
      } catch (error) {
        return response.response({ staus: "err", err: error }).code(501);
      }
    },
  },

  {
    method: "GET",
    path: "/categories/{categoryId}",
    options: {
      auth: "jwt",
      description: "get specific category",
      plugins: getCategorySwagger,
      tags: ["api", "admin"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();
        // check whether admin exist
        const admin = await Account.findOne({
          email: request.auth.credentials.email,
        });

        // check whether is admin
        if (admin.account_type !== "admin") {
          return response
            .response({ status: "err", err: "Not allowed account" })
            .code(403);
        }

        // check whether category exist, delete category
        try {
          const data = request.payload;

          const categories = await Category.findOne({
            _id: request.params.categoryId,
          });

          return response
            .response({ status: "ok", data: categories })
            .code(200);
        } catch (err) {
          return response
            .response({ status: "err", err: "Category not found!" })
            .code(404);
        }
      } catch (error) {
        return response.response({ staus: "err", err: error }).code(501);
      }
    },
  },
];
