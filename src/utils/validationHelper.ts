import mongoose from "mongoose";
import validator from "validator";

import { IErrorData, ValidatorFn, ValidatorSchema } from "../types";

function generateErrorData(field: string, error: string): IErrorData {
  return { field, error: `${field} ${error}` };
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
function valParamExist(params: any, fieldName: string, key: string): IErrorData[] {
  if (!params) {
    return [generateErrorData(`${fieldName}.params.${key}`, "is required")];
  }
  return [];
}

// 將錯誤訊息陣列轉換成 IErrorData 物件
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

// 進行 api 請求時，檢查 req.body 及 req.params 是否符合 schema 規範
function validateRequestBodyAndParams(schema: ValidatorSchema): ValidatorFn {
  return (fieldName: string, data: any, params?: any): IErrorData[] => {
    const errors: IErrorData[] = [];
    const schemaKeys = Object.keys(schema);
    if (!data) {
      return [generateErrorData(fieldName, "is required")];
    }
    // 檢查是否有多餘的req.body欄位
    errors.push(...hasExtraKeys(data, schema, fieldName));

    schemaKeys.forEach((key: string) => {
      const fieldValidators = schema[key];
      if (!fieldValidators.isSocketData) {
        // 若為socketData，則不進行檢查
        if (fieldValidators.isParams && valParamExist(params, fieldName, key).length > 0) {
          // fieldValidators.isParams == true， 表示 schema 設定該屬性 (key) 是 req.params，所以進行 valParamExist
          // 檢查若沒有該屬性(length > 0)，新增錯誤訊息並不進行後續檢查
          errors.push(...valParamExist(params, fieldName, key));
        } else {
          // 判斷是對 req.body 還是 req.params 進行檢查
          const fieldNestName = fieldValidators.isParams ? `${fieldName}.${key}.params` : `${fieldName}.${key}`;
          const field = fieldValidators.isParams ? params : data;
          const fieldValue = fieldValidators.isParams ? params[key] : data[key];

          // 當 schema 設定該屬性 (key) 為必填，進行檢查屬性需存在且不為空
          if (fieldValidators.isRequired) {
            errors.push(...checkRequiredFieldExist(field, fieldNestName, key));
            errors.push(...checkRequiredFieldNotEmpty(fieldValue, fieldNestName));
          }

          // 判端有該屬性時才對 value 進行檢查，讓非必填屬性不存在時不會報錯
          if (checkOptionsFieldExist(field, key) && fieldValidators.validators) {
            // 用 schema.key.validators 陣列中的函式對 value 進行檢查
            fieldValidators.validators.forEach((validatorFn: ValidatorFn) => {
              errors.push(...validatorFn(fieldValue, fieldNestName));
            });
          }
        }
      }
    });

    return errors;
  };
}

// 進行 api 請求時，用 validatorHelperForRequestBodyAndParams 檢查 req.body 及 req.params 是否符合 schema 規範，並將錯誤訊息陣列轉換成 IErrorData 物件以回傳給前端
const validateFieldsAndGetErrorData = (
  schema: ValidatorSchema,
  fieldName: string,
  data: any,
  params?: any,
): IErrorData | null => {
  return parseToIErrorDataType(validateRequestBodyAndParams(schema)(fieldName, data, params));
};

// 物件型別的檢查，當該屬性為物件時，會再次呼叫 validatorHelperForRequestBodyAndParams 進行下一層物件屬性的檢查，rules 在建立 schema 時傳入
const valObjectAndProp = (rules: any): ValidatorFn => {
  return (data: any, fieldName: string): IErrorData[] => {
    if (typeof data !== "object" || Array.isArray(data)) {
      return [generateErrorData(fieldName, "must be an object")];
    }
    return validateRequestBodyAndParams(rules)(`${fieldName}`, data);
  };
};

/**
  陣列型別的檢查，當該屬性為陣列時，會依據傳入的 rules 判斷要進行一般陣列檢查或是物件陣列檢查
 一般陣列檢查，rules 需傳入 ValidatorFn 陣列，再用 ValidatorFn 對陣列中的每個元素進行檢查
 物件陣列檢查，rules 需傳入 ValidatorSchema 物件，再呼叫 valObjectAndProp 對陣列中的每個元素進行物件型別、物件屬性的檢查
 valArrayAndItemOrProp rules 在建立 schema 時傳入，再傳給 valObjectAndProp 或 valArrayAndItem 進行檢查
 */
const valArrayAndItemOrProp = (rules: ValidatorFn[] | ValidatorSchema): ValidatorFn => {
  return (data: any, fieldName: string): IErrorData[] => {
    const errors: IErrorData[] = [];
    // 檢查 data 是否為陣列
    if (!Array.isArray(data)) {
      return [generateErrorData(fieldName, "must be an array")];
    }

    // 用 rules 型別判斷 data 須為一般陣列檢查還是物件陣列檢查
    if (Array.isArray(rules)) {
      // 一般陣列檢查
      data.forEach((item: any) => {
        rules.forEach((validatorFn: ValidatorFn, index: number) => {
          errors.push(
            ...validatorFn(item, `${fieldName}[${index}]`).map((e: IErrorData) => {
              return { field: e.field, error: `${e.error} array` };
            }),
          );
        });
      });
    } else {
      // 物件陣列檢查
      const validatorFn = valObjectAndProp(rules);
      data.forEach((item: any, index: number) => {
        errors.push(...validatorFn(item, `${fieldName}[${index}]`));
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
  if (data === "" || !Number.isNaN(Date.parse(data))) {
    return [];
  }
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

export default {
  validateFieldsAndGetErrorData,
  valObjectAndProp,
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
