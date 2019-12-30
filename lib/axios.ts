import axios from "axios"
import { AxiosRequestConfig } from "axios"
import * as buildURL from "axios/lib/helpers/buildURL"
import { cloneSafe } from "./utils"

function cleanObject(o: {string: any}) {
  for (const k in o || {}) {
    if (typeof o[k] === "undefined") {
      delete o[k]
    }
  }
}

// remove query params from url and put into config.params
function removeSearchFromUrl(config: AxiosRequestConfig) {
  if (!config.url) return
  const url = new URL(config.url)
  const queryString = url.search.substr(1)
  if (queryString) {
    // https://stackoverflow.com/a/8649003/387413
    const urlParams = JSON.parse('{"' + queryString.replace(/&/g, '","').replace(/=/g,'":"') + '"}', function(key, value) {
      return key === "" ? value : decodeURIComponent(value)
    })
    for (const k in urlParams) {
      if (!config.params) config.params = {}
      if (k in config.params) continue // params object > url query params
      config.params[k] = urlParams[k]
    }
    url.search = ""
    config.url = url.toString() // if ends with ? should be okay, but could be cleaner
  }
}

// this fixes query strings with spaces in them causing issues when signing
// XXX https://github.com/axios/axios/pull/2563
function paramsSerializer(p: any) {
  const encodeKey = (k: string) => {
    return encodeURIComponent(k)
      .replace(/%40/gi, '@')
      .replace(/%3A/gi, ':')
      .replace(/%24/g, '$')
      .replace(/%2C/gi, ',')
      .replace(/%20/g, '+')
      .replace(/%5B/gi, '[')
      .replace(/%5D/gi, ']')
  }
  return Object.keys(p).map(k => encodeKey(k) + '=' + encodeURIComponent(p[k])).join('&')
};

// XXX warn about mutating config object... or clone?
export default async function(step: any, config: AxiosRequestConfig, signConfig?: any) {
  cleanObject(config.headers)
  cleanObject(config.params)
  if (typeof config.data === "object") {
    cleanObject(config.data)
  }
  removeSearchFromUrl(config)
  // OAuth1 request
  if (signConfig) {
    const {oauthSignerUri, token} = signConfig
    const requestData = {
      method: config.method || "get",
      url: buildURL(config.url, config.params, paramsSerializer), // build url as axios will
      data: config.data,
    }
    const payload = {
      requestData,
      token,
    }
    const oauthSignature = (await axios.post(oauthSignerUri, payload)).data
    if (!config.headers) config.headers = {}
    config.headers.Authorization = oauthSignature
  }
  try {
    return (await axios(config)).data
  } catch (err) {
    if (err.response) step.debug = cloneSafe(err.response)
    throw err
  }
}
