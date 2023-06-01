import { Request } from "express";

export interface IErrorData {
  field: string;
  error: string;
}

export type ValidationForRequest = (req: Request) => IErrorData | null;

export type ValidatorFn = (data: any, fieldName: string, params?: any) => IErrorData[];

export interface ValidatorSchema {
  [key: string]: {
    validators: ValidatorFn[];
    isParams?: boolean;
    isRequired?: boolean;
  };
}
