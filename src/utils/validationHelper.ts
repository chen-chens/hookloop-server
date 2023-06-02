import mongoose from "mongoose";
import validator from "validator";

import { IErrorData, ValidatorFn } from "../types";

function generateErrorData(field: string, error: string): IErrorData {
  return { field, error: `${field} ${error}` };
}

function addErrors(errors: IErrorData[], newErrors: IErrorData[]) {
  errors.push(...newErrors);
}

function hasExtraKeys(data: any, schema: any, fieldName: string): IErrorData[] {
  const schemaKeysSet = new Set(Object.keys(schema));
  const dataKeysSet = new Set(Object.keys(data));
  const extraKeys = Array.from(dataKeysSet).filter((key) => !schemaKeysSet.has(key));
  if (extraKeys.length > 0) {
    return [generateErrorData(`${fieldName}`, `is not allow to have extra keys: ${extraKeys.join(",")}`)];
  }
  return [];
}

function checkRequiredFieldExist(data: any, fieldName: string, key: string): IErrorData[] {
  if (typeof data === "object" && !Array.isArray(data) && !Object.prototype.hasOwnProperty.call(data, key)) {
    return [generateErrorData(fieldName, "is required")];
  }
  return [];
}

function checkRequiredFieldNotEmpty(data: any, fieldName: string): IErrorData[] {
  if (
    ((Array.isArray(data) || typeof data === "string") && data.length === 0) ||
    (typeof data === "object" && Object.keys(data).length === 0) ||
    data === null ||
    data === undefined
  ) {
    return [generateErrorData(fieldName, "is not allow to be empty")];
  }
  return [];
}

function checkOptionsFieldExist(data: any, key: string) {
  if (data !== undefined && data !== null && Object.prototype.hasOwnProperty.call(data, key)) {
    return true;
  }
  return false;
}
function valParamExist(params: any, fieldName: string): IErrorData[] {
  if (!params) {
    // console.log(params, fieldName);
    return [generateErrorData(`${fieldName}.params`, "is required")];
  }
  return [];
}
function parseToIErrorDataType(validationResults: IErrorData[]): IErrorData | null {
  if (validationResults.length === 0) {
    console.log("validSuccess");
    return null;
  }
  const fields = new Set(validationResults.map((error) => error.field));
  const uniqueFields = Array.from(fields).join("; ");
  const errorMessages = validationResults.reduce((acc, validationResult) => `${acc} ${validationResult.error}; `, "");
  return {
    field: uniqueFields,
    error: errorMessages,
  };
}
function validatorHelperForRequestBodyOrParams(schema: ValidatorSchema): ValidatorFn {
  return (fieldName: string, data: any, params?: any): IErrorData[] => {
    const errors: IErrorData[] = [];
    const schemaKeys = Object.keys(schema);
    if (!data) {
      return [generateErrorData(fieldName, "is required")];
    }
    addErrors(errors, hasExtraKeys(data, schema, fieldName));
    // console.log(`schemaKeys=====${schemaKeys}`);
    schemaKeys.forEach((key: string) => {
      const fieldValidators = schema[key];
      if (fieldValidators.isParams && valParamExist(params, fieldName).length > 0) {
        addErrors(errors, valParamExist(params, fieldName));
        // console.log("errors=====", errors);
      } else {
        const fieldNestName = fieldValidators.isParams ? `${fieldName}.${key}.params` : `${fieldName}.${key}`;
        const field = fieldValidators.isParams ? params : data;
        const fieldValue = fieldValidators.isParams ? params[key] : data[key];
        if (fieldValidators.isRequired) {
          addErrors(errors, checkRequiredFieldExist(field, fieldNestName, key));
          addErrors(errors, checkRequiredFieldNotEmpty(fieldValue, fieldNestName));
        }
        if (checkOptionsFieldExist(field, key)) {
          // console.log(`key=====${key}`);
          // console.log(`fieldValue=====${fieldValue}`);
          // console.log(`fieldValidators.validators=====${fieldValidators.validators}`);
          fieldValidators.validators.forEach((validatorFn: ValidatorFn) => {
            addErrors(errors, validatorFn(fieldValue, fieldNestName));
          });
        }
      }
    });

    return errors;
  };
}

const validateFieldsAndGetErrorData = (
  schema: ValidatorSchema,
  fieldName: string,
  data: any,
  params?: any,
): IErrorData | null => {
  return parseToIErrorDataType(validatorHelperForRequestBodyOrParams(schema)(fieldName, data, params));
};

const valObject = (rules: any): ValidatorFn => {
  return (data: any, fieldName: string): IErrorData[] => {
    if (typeof data !== "object" || Array.isArray(data)) {
      return [generateErrorData(fieldName, "must be an object")];
    }
    return validatorHelperForRequestBodyOrParams(rules)(`${fieldName}`, data);
  };
};

const valArrayAndItemOrProp = (rules: ValidatorFn[] | ValidatorSchema): ValidatorFn => {
  return (data: any, fieldName: string): IErrorData[] => {
    const errors: IErrorData[] = [];
    if (!Array.isArray(data)) {
      return [generateErrorData(fieldName, "must be an array")];
    }
    if (Array.isArray(rules)) {
      // console.log(`data=====${data}`);
      data.forEach((item: any) => {
        // console.log(`rules=====${rules}`);
        rules.forEach((validatorFn: ValidatorFn, index: number) => {
          addErrors(
            errors,
            validatorFn(item, `${fieldName}[${index}]`).map((e: IErrorData) => {
              return { field: e.field, error: `${e.error} array` };
            }),
          );
        });
      });
    } else {
      const validatorFn = valObject(rules);
      // console.log(`data2=====${data}`);
      data.forEach((item: any, index: number) => {
        addErrors(errors, validatorFn(item, `${fieldName}[${index}]`));
      });
    }
    return errors;
  };
};

const valString: ValidatorFn = (data, fieldName) => {
  if (data === "" || typeof data === "string") {
    return [];
  }
  return [generateErrorData(fieldName, "must be a string")];
};

const valNumber: ValidatorFn = (data: any, fieldName: string) => {
  if (data === "" || (typeof data === "number" && !Number.isNaN(Number(data)))) {
    return [];
  }
  return [generateErrorData(fieldName, "must be a valid Number")];
};

const valBoolean: ValidatorFn = (data: any, fieldName: string) => {
  if (typeof data === "boolean") {
    return [];
  }
  return [generateErrorData(fieldName, "must be a valid Boolean")];
};

const valObjectId: ValidatorFn = (data: any, fieldName: string) => {
  if (mongoose.Types.ObjectId.isValid(data)) {
    return [];
  }
  return [generateErrorData(fieldName, "must be a valid ObjectId")];
};

const valDate: ValidatorFn = (data: any, fieldName: string) => {
  console.log("data=====1", data);
  console.log("data=====1", fieldName);
  if (data === "" || !Number.isNaN(Date.parse(data))) {
    console.log("data=====2", Date.parse(data));
    console.log("data=====2", Number.isNaN(Date.parse(data)));
    return [];
  }
  console.log("data=====?", Date.parse(data));
  console.log("data=====?", Number.isNaN(Date.parse(data)));
  return [generateErrorData(fieldName, "must be a valid Date")];
};

const valEmail: ValidatorFn = (data: any, fieldName: string) => {
  if (data === "" || validator.isEmail(data)) {
    return [];
  }
  return [generateErrorData(fieldName, "must be a valid Email")];
};

const valUrl: ValidatorFn = (data: any, fieldName: string) => {
  if (data === "" || validator.isURL(data)) {
    return [];
  }
  return [generateErrorData(fieldName, "must be a valid Url")];
};

const valColor: ValidatorFn = (data: any, fieldName: string) => {
  if (data === "" || validator.isHexColor(data)) {
    return [];
  }
  return [generateErrorData(fieldName, "must be a valid Color")];
};

const valLengthInRange = (min: number, max: number): ValidatorFn => {
  return (data: any, fieldName: string) => {
    if (typeof data === "string" && validator.isLength(data, { min, max })) {
      return [];
    }
    return [generateErrorData(fieldName, `must be between ${min} and ${max} characters`)];
  };
};

const valMaxLength = (max: number): ValidatorFn => {
  return (data: any, fieldName: string) => {
    if (typeof data === "string" && validator.isLength(data, { max })) {
      return [];
    }
    return [generateErrorData(fieldName, `must be less than ${max} characters`)];
  };
};

const valEnum = (enumArray: any): ValidatorFn => {
  return (data: any, fieldName: string) => {
    if (validator.isIn(data, enumArray)) {
      return [];
    }
    return [generateErrorData(fieldName, `must be one of ${enumArray}`)];
  };
};
interface ValidatorSchema {
  [key: string]: {
    validators: ValidatorFn[];
    isParams?: boolean;
    isRequired?: boolean;
  };
}

export default {
  validateFieldsAndGetErrorData,
  valObject,
  valArrayAndItemOrProp,
  valString,
  valNumber,
  valBoolean,
  valObjectId,
  valDate,
  valEmail,
  valUrl,
  valColor,
  valLengthInRange,
  valMaxLength,
  valEnum,
};

// const card = {
//   name: "123123",
//   // tags: [{ gender: "male" }],
//   other: {
//     description: 123,
//     likes: [123],
//   },
//   add: "123",
// };

// const rules = {
//   name: {
//     isRequired: true, // name 是必填欄位
//     validators: [valString],
//   },
//   tags: {
//     validators: [
//       valArrayAndItemOrProp({
//         name: {
//           validators: [valString],
//           isRequired: true,
//         },
//         color: {
//           validators: [valString],
//         },
//       }),
//     ],
//   },
//   other: {
//     isRequired: true,
//     validators: [
//       valObject({
//         description: {
//           validators: [valString],
//         },
//         likes: {
//           validators: [valArrayAndItemOrProp([valString])],
//           isRequired: true,
//         },
//       }),
//     ],
//   },
// };
// console.log(validateFieldsAndGetErrorData(rules, card, "card"));
