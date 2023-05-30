import mongoose from "mongoose";
import validator from "validator";

interface IErrorData {
  field: string;
  error: string;
}

type ValidatorFn = (data: any, fieldName: string) => IErrorData[];

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
    return [generateErrorData(`${fieldName}`, `is not allow to have extra keys ${extraKeys.join(",")}`)];
  }
  return [];
}

function hasField(data: any, fieldName: string, key: string): IErrorData[] {
  if (!Object.prototype.hasOwnProperty.call(data, key)) {
    return [generateErrorData(fieldName, "is required")];
  }
  return [];
}

function isEmpty(data: any, fieldName: string): IErrorData[] {
  if (((Array.isArray(data) || typeof data === "string") && data.length === 0) || data === null || data === undefined) {
    return [generateErrorData(fieldName, "is not allow to be empty")];
  }
  return [];
}

function checkRequiredFieldForObjects(data: any, fieldName: string, key: string): IErrorData[] {
  if (typeof data === "object" && !Array.isArray(data)) {
    return hasField(data, fieldName, key);
  }
  return [];
}

function checkEmptyForNonObjects(data: any, fieldName: string): IErrorData[] {
  if (typeof data !== "object" || Array.isArray(data)) {
    return isEmpty(data, fieldName);
  }
  return [];
}

function checkFieldNotExist(data: any) {
  if (data === null || data === undefined) {
    return true;
  }
  return false;
}

export const validatorHelperForRequestBodyOrParams = (schema: any): ValidatorFn => {
  return (data: any, fieldName: string, params?: any): IErrorData[] => {
    const errors: IErrorData[] = [];
    const schemaKeys = Object.keys(schema);

    addErrors(errors, hasExtraKeys(data, schema, fieldName));

    schemaKeys.forEach((key: string) => {
      const fieldValidators = schema[key];
      const fieldNestName = `${fieldName}.${key}`;
      const field = fieldValidators.isParams ? params : data;
      const fieldValue = field[key];
      if (fieldValidators.isRequired) {
        addErrors(errors, checkRequiredFieldForObjects(field, fieldNestName, key));
        addErrors(errors, checkEmptyForNonObjects(fieldValue, fieldNestName));
      }
      if (!Object.prototype.hasOwnProperty.call(field, key) || !checkFieldNotExist(field)) {
        fieldValidators.validators.forEach((validatorFn: ValidatorFn) => {
          addErrors(errors, validatorFn(fieldValue, fieldNestName));
        });
      }
    });

    return errors;
  };
};

export const valObject = (rules: any): ValidatorFn => {
  return (data: any, fieldName: string): IErrorData[] => {
    if (typeof data !== "object" || Array.isArray(data)) {
      return [generateErrorData(fieldName, "must be an object")];
    }
    return validatorHelperForRequestBodyOrParams(rules)(data, `${fieldName}`);
  };
};

export const valArrayAndItemOrProp = (rules: ValidatorFn[] | ValidatorSchema): ValidatorFn => {
  return (data: any, fieldName: string): IErrorData[] => {
    const errors: IErrorData[] = [];
    if (data !== undefined && data !== null && !Array.isArray(data)) {
      return [generateErrorData(fieldName, "must be an array")];
    }
    if (Array.isArray(rules)) {
      data.forEach((item: any) => {
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
      data.forEach((item: any, index: number) => {
        addErrors(errors, validatorFn(item, `${fieldName}[${index}]`));
      });
    }
    return errors;
  };
};

export const valString: ValidatorFn = (data, fieldName) => {
  if (data === "" || typeof data === "string") {
    return [];
  }
  return [generateErrorData(fieldName, "must be a string")];
};

export const valNumber: ValidatorFn = (data: any, fieldName: string) => {
  if (typeof data === "number" && !Number.isNaN(Number(data))) {
    return [];
  }
  return [generateErrorData(fieldName, "must be a valid Number")];
};

export const valBoolean: ValidatorFn = (data: any, fieldName: string) => {
  if (typeof data === "boolean") {
    return [];
  }
  return [generateErrorData(fieldName, "must be a valid Boolean")];
};

export const valObjectId: ValidatorFn = (data: any, fieldName: string) => {
  if (mongoose.Types.ObjectId.isValid(data)) {
    return [];
  }
  return [generateErrorData(fieldName, "must be a valid ObjectId")];
};

export const valDate: ValidatorFn = (data: any, fieldName: string) => {
  if (!Number.isNaN(Date.parse(data))) {
    return [];
  }
  return [generateErrorData(fieldName, "must be a valid Date")];
};

export const valEmail: ValidatorFn = (data: any, fieldName: string) => {
  if (validator.isEmail(data)) {
    return [];
  }
  return [generateErrorData(fieldName, "must be a valid Email")];
};

export const valUrl: ValidatorFn = (data: any, fieldName: string) => {
  if (validator.isURL(data)) {
    return [];
  }
  return [generateErrorData(fieldName, "must be a valid Url")];
};

export const valColor: ValidatorFn = (data: any, fieldName: string) => {
  if (validator.isHexColor(data)) {
    return [];
  }
  return [generateErrorData(fieldName, "must be a valid Color")];
};

export const valLengthInRange = (min: number, max: number): ValidatorFn => {
  return (data: any, fieldName: string) => {
    if (typeof data === "string" || validator.isLength(data, { min, max })) {
      return [];
    }
    return [generateErrorData(fieldName, `must be between ${min} and ${max} characters`)];
  };
};

export const valMaxLength = (max: number): ValidatorFn => {
  return (data: any, fieldName: string) => {
    if (typeof data === "string" || validator.isLength(data, { max })) {
      return [];
    }
    return [generateErrorData(fieldName, `must be less than ${max} characters`)];
  };
};

export const valEnum = (enumArray: any): ValidatorFn => {
  return (data: any, fieldName: string) => {
    if (validator.isIn(data, enumArray)) {
      return [];
    }
    return [generateErrorData(fieldName, `must be one of ${enumArray}.join(", ")`)];
  };
};
export interface ValidatorSchema {
  [key: string]: {
    validators: ValidatorFn[];
    isParams?: boolean;
    isRequired?: boolean;
  };
}

const card = {
  name: "123123",
  tags: [{ name: "", color: "blue" }, { name: {}, color: "red" }, { name: "cancel" }, []],
  other: {
    description: "this is a description",
    likes: [123],
  },
  add: "123",
};

const rules = {
  name: {
    isRequired: true, // name 是必填欄位
    validators: [valString],
  },
  tags: {
    validators: [
      valArrayAndItemOrProp({
        name: {
          validators: [valString],
          isRequired: true,
        },
        color: {
          validators: [valString],
          isRequired: true,
        },
      }),
    ],
  },
  other: {
    isRequired: true,
    validators: [
      valObject({
        description: {
          validators: [valString],
        },
        likes: {
          validators: [valArrayAndItemOrProp([valString])],
          isRequired: true,
        },
      }),
    ],
  },
};

console.log(validatorHelperForRequestBodyOrParams(rules)(card, "Card" as any));
