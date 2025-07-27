import axios, { Method, AxiosError, RawAxiosRequestHeaders } from "axios";

export const BASE_URL = __DEV__
  ? "https://a67643af5d54.ngrok-free.app/"
  : "https://api.v1.babble-in.com/";

const GET_TIMEOUT = 20e3; // 20s 5e3
const POST_TIMEOUT = 100e3; // 100s

const dev_token =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwMUpaUTAwWDVFU0hLOUtGTktDWEs5TVhaMSIsImV4cCI6MTc1OTgyMDY5NiwiaWF0IjoxNzUyMDQ0Njk2fQ.QNn1BN-6dnM-sIuoclBgGxMbFGl6Jvoxn-vKNH26wTw";
export type AxiosOverrides = {
  forceAccessTokenAuthorization?: boolean;
};
export type AxiosParams = {
  url: string;
  method: Method;
  data?: any;
  unmountSignal?: AbortSignal;
  headers?: RawAxiosRequestHeaders;
};

export const makeApiCall = async ({
  url,
  method,
  data,
  unmountSignal,
  headers,
}: AxiosParams) => {
  const token = dev_token; // getAccessCredentials()?.access_token;
  const abort = new AbortController();
  const tm = setTimeout(
    () => () => abort.abort(),
    method === "POST" ? POST_TIMEOUT : GET_TIMEOUT,
  );
  unmountSignal = abort.signal;
  const requestParams = {
    url,
    baseURL: BASE_URL,
    method,
    data,
    signal: unmountSignal,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: token ? `Bearer ${token}` : null,
      ...headers,
    },
  };

  try {
    const response = await axios(requestParams).then((resp) => resp.data);
    clearTimeout(tm);
    return response;
  } catch (err) {
    clearTimeout(tm);
    if (err instanceof AxiosError) {
      throw { ...err, message: err.response?.data };
    }

    throw { err, message: "unknown error occurred" };
  }
};

export const fetcher = (url: string) => {
  return makeApiCall({ url, method: "GET" });
};
