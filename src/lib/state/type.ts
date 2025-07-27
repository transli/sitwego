export type Driver = {
  profile_id: string;
  token: string;
  isLoggedIn?: boolean;
  activated?: boolean;
  first_name?: string;
  last_name?: string;
  [key: string]: any; //TODO: specify more fields
};

export type DriverStateApiContext = {
  createAccount: (
    props: CreateAccountType,
  ) => Promise<Omit<Driver, "isLoggedIn">>;
  login: (props: {
    phone_number: string;
    password: string;
    authFactorToken?: string | undefined;
  }) => Promise<void>;
  logout: () => void;
  deleteAccount: (account: Driver) => void;
};

export type CreateAccountType = {
  contact_data: {
    email: string;
    phone_number: string;
  };
  first_name: string;
  last_name: string;
  gender: string;
  password: string;
  mobile_country_code: string;
};
