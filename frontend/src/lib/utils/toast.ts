// lib/utils/toast.ts
import { sileo } from "sileo";

export const toast = {
  success: (title: string, description?: string) =>
    sileo.success({ title, description }),

  error: (title: string, description?: string) =>
    sileo.error({ title, description }),

  warning: (title: string, description?: string) =>
    sileo.warning({ title, description }),

  info: (title: string, description?: string) =>
    sileo.info({ title, description }),

  promise: <T>(promise: Promise<T>, opts: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((err: unknown) => string);
}) => {
    const successOpt = typeof opts.success === "function"
    ? (data: T) => ({ title: (opts.success as (data: T) => string)(data) })
    : { title: opts.success as string };

    const errorOpt = typeof opts.error === "function"
    ? (err: unknown) => ({ title: (opts.error as (err: unknown) => string)(err) })
    : { title: opts.error as string };

    return sileo.promise(promise, {
    loading: { title: opts.loading },
    success: successOpt,
    error: errorOpt,
    });
},
};