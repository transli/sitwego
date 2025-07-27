import React, { useCallback, useEffect } from "react";
import { CreateAccountType, Driver, DriverStateApiContext } from "./type";
import { reducer } from "./reducer";
import { userStore } from "../store";
import { useCreateDriver } from "~/hooks/useUserApi";

const StateContext = React.createContext<Driver | undefined>({
  isLoggedIn: false,
  profile_id: "",
  token: "",
});

const ApiContext = React.createContext<DriverStateApiContext>({
  createAccount: function (
    props: CreateAccountType,
  ): Promise<Pick<Driver, "profile_id" | "token">> {
    throw new Error("Function not implemented.");
  },
  login: function (props: {
    phone_number: string;
    password: string;
    authFactorToken?: string | undefined;
  }): Promise<void> {
    throw new Error("Function not implemented.");
  },
  logout: function (): void {
    throw new Error("Function not implemented.");
  },
  deleteAccount: function (account: Driver): void {
    throw new Error("Function not implemented.");
  },
});

export const UserStateProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const {
    mutateAsync: createAccount,
    isPending,
    isSuccess,
    isError,
  } = useCreateDriver();
  const [state, setState] = React.useReducer(reducer, null, () => {
    const driver = userStore.get(["user"]);
    if (driver) {
      return {
        ...driver,
        isLoggedIn: true,
        profile_id: driver.profile_id ?? "",
        token: driver.token ?? "",
      };
    }
    // default values matching Driver type
    return {
      isLoggedIn: false,
      profile_id: "",
      token: "",
    };
  });

  const _createAccount = useCallback<DriverStateApiContext["createAccount"]>(
    async (props: CreateAccountType) => {
      if (isError) {
        throw new Error("Error creating account");
      }
      if (isPending) {
        console.log("Create account request is already in progress.");
        return {};
      }
      const response = await createAccount(props);

      if (response) {
        setState({
          type: "CreateAccount",
          payload: {
            ...response,
            profile_id: response.profile_id || "",
            token: response.token || "",
            isLoggedIn: true,
          },
        });
      }
      return {};
    },
    [createAccount, isError, isPending],
  );

  useEffect(() => {
    if (state.shouldPersist) {
      // Reset the flag after persisting
      state.shouldPersist = false;
      // Persist the state to the store
      userStore.set(["user"], state);
    }
  }, [state]);

  const _state = React.useMemo(() => {
    return {
      ...state,
      isLoggedIn: state?.isLoggedIn ?? false,
      profile_id: state?.profile_id ?? "",
      token: state?.token ?? "",
    };
  }, [state]) as Driver;

  const _api = React.useMemo(
    () => ({
      createAccount: _createAccount,
      login: async (props) => {
        throw new Error("Function not implemented.");
      },
      logout: () => {
        throw new Error("Function not implemented.");
      },
      deleteAccount: (account) => {
        throw new Error("Function not implemented.");
      },
    }),
    [_createAccount],
  ) as DriverStateApiContext;
  console.log("UserStateProvider rendered with state:", _state);
  return (
    <StateContext.Provider value={_state}>
      <ApiContext.Provider value={_api}>{children}</ApiContext.Provider>
    </StateContext.Provider>
  );
};

export const useUserState = () => {
  const state = React.useContext(StateContext);
  if (!state) {
    throw new Error("useUserState must be used within a UserStateProvider");
  }
  return state;
};
export const useUserApi = () => {
  const api = React.useContext(ApiContext);
  if (!api) {
    throw new Error("useUserApi must be used within a UserStateProvider");
  }
  return api;
};
