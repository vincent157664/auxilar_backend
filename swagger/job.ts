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
      501: {
        description: "Requeset not implemented.",
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
      501: {
        description: "Requeset not implemented.",
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
      501: {
        description: "Requeset not implemented.",
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
      501: {
        description: "Request not implemented.",
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
      501: {
        description: "Requeset not implemented.",
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
      501: {
        description: "Requeset not implemented.",
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
      501: {
        description: "Requeset not implemented.",
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
      501: {
        description: "Request not implemented.",
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
      501: {
        description: "Requeset not implemented.",
      },
    },
  },
};
