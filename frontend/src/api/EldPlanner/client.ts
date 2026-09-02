/**
 * Base API client (Axios) for the ELD Planner Django backend.
 */

import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from "axios";

const ELD_PLANNER_API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

type RequestOptions = AxiosRequestConfig;

const axiosInstance: AxiosInstance = axios.create({
  baseURL: ELD_PLANNER_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => {
    const status = error.response?.status ?? 500;
    const data = error.response?.data;

    throw new ApiError(
      (error.response?.statusText as string) || error.message,
      status,
      data,
    );
  },
);

export async function eldPlannerApiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const response = await axiosInstance.request({
    url: endpoint,
    ...options,
  });

  return response as T;
}

export const eldPlannerApiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    eldPlannerApiRequest<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    eldPlannerApiRequest<T>(endpoint, {
      ...options,
      method: "POST",
      data,
    }),

  put: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    eldPlannerApiRequest<T>(endpoint, {
      ...options,
      method: "PUT",
      data,
    }),

  patch: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    eldPlannerApiRequest<T>(endpoint, {
      ...options,
      method: "PATCH",
      data,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    eldPlannerApiRequest<T>(endpoint, { ...options, method: "DELETE" }),
};
