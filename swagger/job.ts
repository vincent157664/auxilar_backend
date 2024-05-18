export const JobSwagger = {
  "hapi-swagger": {
    responses: {
      201: {
        description: "Job post successfully.",
      },
      400: {
        description: "Input Fields Required.",
      },
      403: {
        description: "Forbidden request.",
      },
      406: {
        description: "Not acceptable request.",
      },
      409: {
        description: "Job already posted.",
      },
      500: {
        description:
          "Something went wrong. Please refresh the page and try again!",
      },
    },
  },
};

export const updateJobSwagger = {
  "hapi-swagger": {
    responses: {
      201: {
        description: "Job post successfully.",
      },
      400: {
        description: "Input Fields Required.",
      },
      403: {
        description: "Forbidden request.",
      },
      404: {
        description: "Posted job not found!",
      },
      500: {
        description:
          "Something went wrong. Please refresh the page and try again!",
      },
    },
  },
};

export const findPostedJobSwagger = {
  "hapi-swagger": {
    responses: {
      201: {
        description: "Find Posted Job successfully.",
      },
      400: {
        description: "Input Fields Required.",
      },
      403: {
        description: "Forbidden request.",
      },
      404: {
        description: "Posted job not found!",
      },
      406: {
        description: "Not acceptable request.",
      },
      500: {
        description:
          "Something went wrong. Please refresh the page and try again!",
      },
    },
  },
};

export const getAllJobSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Receive posted job successfully!",
      },
      204: {
        description: "No Content",
      },
      403: {
        description: "Forbidden request.",
      },
      404: {
        description: "Posted job not found!",
      },
      500: {
        description:
          "Something went wrong. Please refresh the page and try again!",
      },
    },
  },
};

export const getMyAllJobSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Receive posted job successfully!",
      },
      403: {
        description: "Forbidden request.",
      },
      404: {
        description: "Posted job not found!",
      },
      500: {
        description:
          "Something went wrong. Please refresh the page and try again!",
      },
    },
  },
};

export const getJobSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Receive posted job successfully!",
      },
      404: {
        description: "Posted job not found!",
      },
      500: {
        description:
          "Something went wrong. Please refresh the page and try again!",
      },
    },
  },
};
export const deleteJobSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Receive posted job successfully!",
      },
      403: {
        description: "Forbidden request",
      },
      404: {
        description: "Posted job not found!",
      },
      500: {
        description:
          "Something went wrong. Please refresh the page and try again!",
      },
    },
  },
};

export const inviteExpertSwagger = {
  "hapi-swagger": {
    responses: {
      201: {
        description: "Invite expert Success1",
      },
      403: {
        description: "Forbidden request",
      },
      404: {
        description: "Not found!",
      },
      409: {
        description: "Expert already invited!",
      },
      500: {
        description:
          "Something went wrong. Please refresh the page and try again!",
      },
    },
  },
};

export const recommendedExpertsSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Find expert Success!",
      },
      400: {
        description: "Input fields are required!",
      },
      403: {
        description: "Forbidden request",
      },
      404: {
        description: "Expert is not found!",
      },
      500: {
        description:
          "Something went wrong. Please refresh the page and try again!",
      },
    },
  },
};
