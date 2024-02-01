export const getAllSkills = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "success",
      },
      404: {
        description: "Skill not found!",
      },
      501: {
        description: "Requeset not implemented.",
      },
    },
  },
};