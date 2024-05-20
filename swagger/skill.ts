export const getAllSkills = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "success",
      },
      404: {
        description: "Skill not found!",
      },
      500: {
        description:
          "Something went wrong. Please refresh the page and try again..",
      },
    },
  },
};
