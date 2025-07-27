import { Driver } from "./type";

export type Action =
  | {
      type: "CreateAccount";
      payload: Partial<Driver> & {
        profile_id: string;
        token: string;
      };
    }
  | {
      type: "LOGIN";
      payload: Partial<Driver> & {
        profile_id: string;
        token: string;
      };
    }
  | {
      type: "LOGOUT";
      payload: undefined;
    }
  | {
      type: "UPDATE_PROFILE";
      payload: Partial<Driver>;
    };
export type State = Driver & {
  shouldPersist?: boolean; // Flag to indicate if the state should be persisted
};
export const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "CreateAccount":
      return {
        ...state,
        ...action.payload,
        shouldPersist: true, // Ensure the state is persisted
      };
    case "LOGIN":
      return {
        ...state,
        isLoggedIn: true,
        profile_id: action.payload.profile_id,
        token: action.payload.token,
        shouldPersist: true, // Ensure the state is persisted
      };
    case "LOGOUT":
      return {
        ...state,
        isLoggedIn: false,
        profile_id: "",
        token: "",
      };
    case "UPDATE_PROFILE":
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};
