"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const buildURL = require("axios/lib/helpers/buildURL");
const utils_1 = require("./utils");
function cleanObject(o) {
    for (const k in o || {}) {
        if (typeof o[k] === "undefined") {
            delete o[k];
        }
    }
}
// remove query params from url and put into config.params
function removeSearchFromUrl(config) {
    if (!config.url)
        return;
    const url = new URL(config.url);
    const queryString = url.search.substr(1);
    if (queryString) {
        // https://stackoverflow.com/a/8649003/387413
        const urlParams = JSON.parse('{"' + queryString.replace(/&/g, '","').replace(/=/g, '":"') + '"}', function (key, value) {
            return key === "" ? value : decodeURIComponent(value);
        });
        for (const k in urlParams) {
            if (!config.params)
                config.params = {};
            if (k in config.params)
                continue; // params object > url query params
            config.params[k] = urlParams[k];
        }
        url.search = "";
        config.url = url.toString(); // if ends with ? should be okay, but could be cleaner
    }
}
// this fixes query strings with spaces in them causing issues when signing
// XXX https://github.com/axios/axios/pull/2563
function paramsSerializer(p) {
    const encodeKey = (k) => {
        return encodeURIComponent(k)
            .replace(/%40/gi, '@')
            .replace(/%3A/gi, ':')
            .replace(/%24/g, '$')
            .replace(/%2C/gi, ',')
            .replace(/%20/g, '+')
            .replace(/%5B/gi, '[')
            .replace(/%5D/gi, ']');
    };
    return Object.keys(p).map(k => encodeKey(k) + '=' + encodeURIComponent(p[k])).join('&');
}
;
// XXX warn about mutating config object... or clone?
async function default_1(step, config, signConfig) {
    cleanObject(config.headers);
    cleanObject(config.params);
    if (typeof config.data === "object") {
        cleanObject(config.data);
    }
    removeSearchFromUrl(config);
    // OAuth1 request
    if (signConfig) {
        const { oauthSignerUri, token } = signConfig;
        const requestData = {
            method: config.method || "get",
            url: buildURL(config.url, config.params, paramsSerializer),
            data: config.data,
        };
        const payload = {
            requestData,
            token,
        };
        const oauthSignature = (await axios_1.default.post(oauthSignerUri, payload)).data;
        if (!config.headers)
            config.headers = {};
        config.headers.Authorization = oauthSignature;
    }
    try {
        return (await axios_1.default(config)).data;
    }
    catch (err) {
        if (err.response)
            step.debug = utils_1.cloneSafe(err.response);
        throw err;
    }
}
exports.default = default_1;
