import { tokenStore } from "./token";
import type { AvatarApi } from "../types/avatar";

const API_ROOT = import.meta.env.VITE_API_URL;

const ApiFetch = async (
  url: string,
  initOptions?: RequestInit,
): Promise<Response> => {
  const accessToken = tokenStore.get();

  let options: RequestInit = {
    method: "GET",
    headers: {
      ...(accessToken ? { Authorization: "Bearer " + accessToken } : {}),
    },
  };

  if (initOptions?.method) {
    options.method = initOptions.method;
  }
  if (initOptions?.headers) {
    options.headers = {
      ...options.headers,
      ...initOptions.headers,
    };
  }
  if(initOptions?.credentials) {
    options.credentials = initOptions.credentials;
  }
  if (initOptions?.body) {
    options.body = initOptions.body;
  }

  const res = await fetch(API_ROOT + url, options);
  if (res.status === 401) {
    try {
      const { access_token: newToken } = await getValidToken();
      const res = await fetch(API_ROOT + url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: "Bearer " + newToken,
        },
      });
      if (!res.ok) throw new Error("Session refresh failed.");

      return res;
    } catch (err) {
      window.dispatchEvent(new Event("auth:logout"));
      throw new Error("Session expired. Try to login again.");
    }
  }

  return res;
};

interface RefreshTokenData {
  access_token: string;
  user: AvatarApi;
}

// Lock for keeping only one refresh call active!
let refreshingPromise: Promise<RefreshTokenData> | null = null;

async function getValidToken() {
  if (refreshingPromise) {
    return refreshingPromise;
  }

  refreshingPromise = fetch(API_ROOT + "/auth/refresh", {
    method: "POST",
    credentials: "include",
  })
    .then(async (res) => {
      if (!res.ok) throw new Error("refresh token failed");
      const { data } = await res.json();
      if (data?.access_token && data.user) {
        tokenStore.set(data.access_token);
        return data;
      } else {
        throw new Error("data is empty");
      }
    })
    .finally(() => (refreshingPromise = null));

  return refreshingPromise;
}

export { API_ROOT, ApiFetch, getValidToken };
