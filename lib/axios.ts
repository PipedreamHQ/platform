import axios from "axios"

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

export default async function(step: any, config, sign?) {
  // XXX warn about mutating config object... or clone?
  if (sign) {
    const payload = {
      request_data: config,
      sign,
    }
    const oauthEndpoint = "entye5w7a3mw209.m.pipedream.net"
    const oauthSignature = (await axios.post(`https://${oauthEndpoint}?pipedream_response=1`, payload)).data
    config.headers = oauthSignature
  }
  for (const k in config.headers || {}) {
    if (typeof config.headers[k] === "undefined") {
      delete config.headers[k]
    }
  }
  try {
    return (await axios(config)).data
  } catch (err) {
    step.debug = err.response
    throw err
  }
}
