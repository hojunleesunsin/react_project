export type SignupState = {
  ok: boolean;
  message: string;
  submitCount: number;
  fieldErrors: {
    name?: string;
    email?: string;
  };
  values: {
    name: string;
    email: string;
  };
};

export const initialSignupState: SignupState = {
  ok: false,
  message: "",
  submitCount: 0,
  fieldErrors: {},
  values: {
    name: "",
    email: "",
  },
};

