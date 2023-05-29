const generateErrorData = (field: string, error: string) => ({ field, error });

function addErrors(errors: any, newErrors: any) {
  errors.push(...newErrors);
}

const valString = (data: any, field: string) => {
  if (data === undefined || typeof data === "string" || data === "") {
    return [];
  }
  return [generateErrorData(field, `${field} must be a string`)];
};

function hasExtraKeys(data: any, schema: any, fieldName: string) {
  const schemaKeysSet = new Set(Object.keys(schema));
  const dataKeysSet = new Set(Object.keys(data));
  const extraKeys = Array.from(dataKeysSet).filter((key) => !schemaKeysSet.has(key));
  if (extraKeys.length > 0) {
    return [
      generateErrorData(
        `${fieldName}.${extraKeys[0]}`,
        `${fieldName} is not allow to have extra keys ${extraKeys.join(",")}`,
      ),
    ];
  }
  return [];
}
function hasField(data: any, fieldName: any, key: any) {
  if (!Object.prototype.hasOwnProperty.call(data, key)) {
    return [generateErrorData(fieldName, `${fieldName} is required`)];
  }
  return [];
}
function isEmpty(data: any, fieldNestName: any) {
  if (((Array.isArray(data) || typeof data === "string") && data.length === 0) || data === null || data === undefined) {
    return [generateErrorData(fieldNestName, `${fieldNestName} is not allow to be empty`)];
  }
  return [];
}

function checkRequiredFieldForObjects(data: any, fieldName: any, key: any) {
  if (typeof data === "object" && !Array.isArray(data)) {
    return [hasField(data, fieldName, key)];
  }
  return [];
}
function checkEmptyForNonObjects(data: any, fieldName: any) {
  if (typeof data !== "object" || Array.isArray(data)) {
    return [isEmpty(data, fieldName)];
  }
  return [];
}
export const validatorHelper = (schema: any) => {
  return (data: any, fieldName: string) => {
    const errors: any[] = [];
    const schemaKeys = Object.keys(schema);

    addErrors(errors, hasExtraKeys(data, schema, fieldName));

    schemaKeys.forEach((key: any) => {
      const fieldValSchema = schema[key];
      const fieldValue = data[key];
      const fieldNestName = `${fieldName}.${key}`;
      if (fieldValSchema.isRequired) {
        addErrors(errors, checkRequiredFieldForObjects(data, fieldNestName, key));
        addErrors(errors, checkEmptyForNonObjects(fieldValue, fieldNestName));
      }
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        fieldValSchema.validators.forEach((validatorSchema: any) => {
          addErrors(errors, validatorSchema(fieldValue, `${fieldNestName}`));
        });
      }
    });

    return errors;
  };
};

export const valObject = (rules: any) => {
  return (data: any, field: string) => {
    if (typeof data !== "object" || Array.isArray(data)) {
      return [generateErrorData(field, `${field} must be an object`)];
    }
    return validatorHelper(rules)(data, `${field}`);
  };
};

export const valArrayAndItemOrProp = (rules: any) => {
  return (data: any, field: string) => {
    const errors: any[] = [];
    if (data !== undefined && data !== null && !Array.isArray(data)) {
      return [generateErrorData(field, `${field} must be an array`)];
    }
    if (Array.isArray(rules)) {
      data.forEach((item: any) => {
        rules.forEach((val: any, index: number) => {
          addErrors(
            errors,
            val(item, field, `${field}[${index}]`).map((e: any) => {
              return generateErrorData(e.field, `${e.error} array`);
            }),
          );
        });
      });
    } else {
      const val = valObject(rules);
      data.forEach((item: any, index: number) => {
        addErrors(errors, val(item, `${field}[${index}]`));
      });
    }
    return errors;
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
          isRequired: true,
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
