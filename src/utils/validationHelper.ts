// Check if the id is a valid mongo id

import { Request } from "express";
import mongoose from "mongoose";

export const mongoIdsValidator = (req: any) => {
  const { params } = req;
  let error = "";
  let field = "";

  Object.keys(params).forEach((param) => {
    const id = params[param];
    if (!mongoose.Types.ObjectId.isValid(id)) {
      field += `${param} `;
      error += `${id} must be a valid ObjectId \n`;
    }
  });
  return error ? { field, error } : null;
};

export const mongoIdValidator = (req: Request, field: string) => {
  let error = "";
  const id = req.body[field];
  if (!mongoose.Types.ObjectId.isValid(id)) {
    error += `${id} must be a valid ObjectId`;
  }
  return { field, error };
};

export const aggregateErrors = (validationResults: { field: string; error: string }[]) => {
  let aggregateField = "";
  let aggregateError = "";
  validationResults.forEach((validationResult) => {
    if (validationResult) {
      aggregateField += `${validationResult.field} `;
      aggregateError += `${validationResult.error}\n`;
    }
  });
  return aggregateField && aggregateError ? { field: aggregateField, Error: aggregateError } : null;
};
