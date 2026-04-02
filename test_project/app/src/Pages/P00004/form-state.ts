export type ProfileFormState = {
  success: boolean;
  message: string;
  fieldErrors: {
    name?: string;
    email?: string;
  };
  values: {
    name: string;
    email: string;
  };
};

export const initialProfileState: ProfileFormState = {
  success: false,
  message: "",
  fieldErrors: {},
  values: {
    name: "",
    email: "",
  },
};
