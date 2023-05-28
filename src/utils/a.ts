const generateErrorData = (field: string, error: string) => {
  return { field, error };
};

const valString = (data: any, field: string) => {
  const errors = [];
  if (data && typeof data !== "string") {
    errors.push(generateErrorData(field, `${field} must be a string`));
  }
  return errors;
};

function isEmptyValue(value: any) {
  if (Array.isArray(value) || typeof value === "string") {
    return value.length === 0;
  }
  if (value === null || value === undefined) {
    return true;
  }
  return false;
}

function hasTheRequiredField(data: any, field: any) {
  return Object.prototype.hasOwnProperty.call(data, field);
}
function hasExtraKeys(data: any, schema: any, field: string) {
  const schemaKeysSet = new Set(Object.keys(schema));
  const dataKeysSet = new Set(Object.keys(data));
  const extraKeys = Array.from(dataKeysSet).filter((key) => !schemaKeysSet.has(key));
  const errors = [];
  if (extraKeys.length > 0) {
    errors.push(
      generateErrorData(`${field}.${extraKeys[0]}`, `${field} is not allow to have extra keys ${extraKeys.join(",")}`),
    );
  }
  return errors;
}
export const validatorHelper = (schema: any) => {
  return (data: any, field: string) => {
    let errors: any[] = [];
    const schemaKeys = Object.keys(schema);

    errors = errors.concat(hasExtraKeys(data, schema, field));
    errors = errors.concat(
      schemaKeys.reduce((error: any, key: any) => {
        const fieldValSchema = schema[key];
        const fieldValue = data[key];
        const fieldNestName = `${field}.${key}`;
        if (fieldValSchema.isRequired && typeof data === "object" && !hasTheRequiredField(data, key)) {
          error.push(generateErrorData(fieldNestName, `${fieldNestName} is required`));
        } else if (fieldValSchema.isRequired && isEmptyValue(fieldValue)) {
          error.push(generateErrorData(fieldNestName, `${fieldNestName} is not allow to be empty`));
        }

        if (fieldValue !== undefined || fieldValue !== null) {
          return error.concat(
            fieldValSchema.validators.reduce((err: any, validatorSchema: any) => {
              return err.concat(validatorSchema(fieldValue, `${fieldNestName}`));
            }, []),
          );
        }
        return error;
      }, []),
    );
    return errors;
  };
};

export const valObject = (rules: any) => {
  return (data: any, field: string) => {
    const errors: any[] = [];
    if (typeof data !== "object" || Array.isArray(data)) {
      errors.push(generateErrorData(field, `${field} must be an object`));
      return errors;
    }
    return errors.concat(validatorHelper(rules)(data, `${field}`));
  };
};

export const valArrayAndItemOrProp = (rules: any) => {
  return (data: any, field: string) => {
    const errors: any[] = [];
    if (!Array.isArray(data)) {
      errors.push(generateErrorData(field, `${field} must be an array`));
      return errors;
    }
    if (Array.isArray(rules)) {
      return errors.concat(
        data.reduce((error, item) => {
          return error.concat(
            rules.reduce((err: any, val: any, index: number) => {
              return err.concat(val(item, field, `${field}[${index}]`)).map((e: any) => {
                return generateErrorData(e.field, `${e.error} array`);
              });
            }, []),
          );
        }, []),
      );
    }
    const val = valObject(rules);
    return errors.concat(
      data.reduce((error, item, index: number) => {
        return error.concat(val(item, `${field}[${index}]`));
      }, []),
    );
  };
};

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
          isrequired: true,
        },
      }),
    ],
  },
};

console.log(validatorHelper(rules)(card, "Card" as any));

// const rules = {
//   name: {
//     isRequired: true, // name 是必填欄位
//     validators: [valString, valLengthInRange(1, 10)],
//   },
//   tags: {
//     validators: [
//       valArrayAndItemOrProp({
//         name: {
//           validators: [valString, valIn(["fix", "bug", "cancel"])],
//           isRequired: true,
//         },
//         color: {
//           validators: [valString, valLengthInRange(1, 10)],
//           isRequired: true,
//         },
//       }),
//     ],
//   },
//   other: {
//     isRequired: true,
//     validators: [
//       valObject({
//         description: {
//           validators: [valString, valMaxLength(50)],
//         },
//         likes: {
//           validators: [valArrayAndItemOrProp([valString, valEnum()])],
//         },
//       }),
//     ],
//   },
// };
