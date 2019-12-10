import axios from "axios"
import { AxiosRequestConfig } from "axios"
import { cloneSafe } from "./utils"

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI
// see non-escaped chars
// this handles not encoding [!'()*]
function encodeReservedChars(str: String) {
  return str.replace(/[!'()*]/g, function(c) {
    return '%' + c.charCodeAt(0).toString(16)
  })
}

export default async function(step: any, config: AxiosRequestConfig, signConfig?: any) {
  // XXX warn about mutating config object... or clone?
  // OAuth1 request
  if (signConfig) {
    const {oauthSignerUri, token} = signConfig

    if (config.url) {
      // this handles encoding query string to make sure we match what we sign
      const url = new URL(config.url)
      url.search = encodeReservedChars(url.search.substr(1))
      config.url = url.toString()
    }

    const payload = {
      requestData: config,
      token,
    }
    const oauthSignature = (await axios.post(oauthSignerUri, payload)).data
    if (!config.headers) config.headers = {}
    config.headers.Authorization = oauthSignature
  }
  for (const k in config.headers || {}) {
    if (typeof config.headers[k] === "undefined") {
      delete config.headers[k]
    }
  }
  try {
    return (await axios(config)).data
  } catch (err) {
    if (err.response) step.debug = cloneSafe(err.response)
    throw err
  }
}
