import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { CreateAccountType, Driver } from "~/lib/state/type";
import { useApiClient } from "./useApiClient";

export function useCreateDriver() {
  const { makeApiCall } = useApiClient();
  return useMutation<Driver, Error, CreateAccountType>({
    async mutationFn({ ...rest }) {
      return await makeApiCall({
        url: "create-profile/driver",
        data: rest,
        method: "POST",
        unmountSignal: new AbortController().signal,
      });
    },
    async onSuccess(data: any) {
      console.log("User created successfully:");
    },
    onError(error, variables, context) {
      console.error("Error creating user:", error);
    },
    retry: 3,
  });
}
