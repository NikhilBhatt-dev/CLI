const sendResponse = (res, response) => {
  return res.status(response.statusCode).json(response);
};

export default sendResponse;
