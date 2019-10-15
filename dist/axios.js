"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
/*
function observability(resp) {
  return {
    request: resp.config,
    response: {
      status: resp.status,
      headers: resp.headers,
      data: resp.data,
    },
  }
}

export default async function(step: any, config) {
  try {
    const resp = await axios(config)
    step.axios = observability(resp)
    return resp.data
  } catch (err) {
    if (err.isAxiosError) {
      step.axios = observability(err.response)
    } else {
      step.$error = err
    }
    throw err
  }
}
*/
async function default_1(step, config) {
    return (await axios_1.default(config)).data;
}
exports.default = default_1;
