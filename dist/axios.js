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
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI
// see non-escaped chars
// this handles not encoding [!'()*]
function encodeReservedChars(str) {
    return str.replace(/[!'()*]/g, function (c) {
        return '%' + c.charCodeAt(0).toString(16);
    });
}
async function default_1(step, config, signConfig) {
    // XXX warn about mutating config object... or clone?
    // OAuth1 request
    if (signConfig) {
        const { oauthSignerUri, token } = signConfig;
        // this handles encoding query string to make sure we match what we sign
        const url = new URL(config.url);
        url.search = encodeReservedChars(url.search.substr(1));
        config.url = url.toString();
        const payload = {
            requestData: config,
            token,
        };
        const oauthSignature = (await axios_1.default.post(oauthSignerUri, payload)).data;
        if (!config.headers)
            config.headers = {};
        config.headers.Authorization = oauthSignature;
    }
    for (const k in config.headers || {}) {
        if (typeof config.headers[k] === "undefined") {
            delete config.headers[k];
        }
    }
    try {
        return (await axios_1.default(config)).data;
    }
    catch (err) {
        step.debug = err.response;
        throw err;
    }
}
exports.default = default_1;
