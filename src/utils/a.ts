// const rules = {
//   name: {
//     isRequired: true, // name 是必填欄位
//     validators: [valString, valLengthInRange(1, 10)],
//     message: "Invalid name",
//   },
//   tags: {
//     validators: [valArray, valArrayItems({ name: [valIn(["fix", "bug", "cancel"])] })],
//     message: "Invalid tag",
//   },
//     validators: [
//       valObject({
//         description: {
//           validators: [valString, valMaxLength(50)],
//           message: "Invalid description",
//         },
//         likes: {
//           validators: [valArray],
//           message: "Invalid likes",
//         },
//       }),
//     ],
//     message: "Invalid meta",
//   },
// };

// function validator(schema) {
//   return function (data) {
//     const errors = [];

//     for (const key in schema) {
//       const value = data[key];
//       const rules = schema[key];

//       // 檢查值是否為 undefined 或 null
//       if (value === undefined || value === null) {
//         if (rules.isRequired) {
//           errors.push(`${key} is required`);
//         }
//         continue;

//       // 執行所有的驗證器
//       for (const validate of rules.validators) {
//         if (!validate(value)) {
//           errors.push(rules.message);
//           break;
//         }
//       }
//     }

// function validator(schema) {
//   return function (data) {
//     let errors = [];
//     for (let key in schema) {
//       if (schema[key].isRequired && (data[key] === null || data[key] === undefined)) {
//         errors.push(`${key} is required`);
//         continue; // 跳過後續的驗證
//       }
//       if (data[key] !== null && data[key] !== undefined) { // 只有值已提供時才進行驗證
//         for (let validator of schema[key].validators) {
//           if (!validator(data[key])) {
//             errors.push(schema[key].message);
//           }
//         }
//       }
//     }
//     return errors.length > 0 ? errors : null;
//   }
// }
//     // 如果有任何錯誤，則回傳這些錯誤，否則回傳 null
//     return errors.length > 0 ? errors : null;
//   };
// }

// function valString(value) {
//   return typeof value === "string";
// }

// function valMaxLength(maxLength) {
//   return function (value) {
//     return typeof value === "string" && value.length <= maxLength;
//   };
// }

// function valArray(value) {
//   return Array.isArray(value);
// }

// function valArrayItems(ruls) {
//   return function (value) {
//     if (!Array.isArray(value)) {
//       return false;
//     }
//     for (const item of value) {
//       if (!validator(ruls)) {
//         return false;
//       }
//     }
//     return true;
//   };
// }
// // function valArrayItems(itemSchema) {
// //   return function(array) {
// //     if (!Array.isArray(array)) {
// //       return false;
// //     }
// //     const itemValidator = validator(itemSchema);
// //     for (let item of array) {
// //       const errors = itemValidator(item);
// //       if (errors !== null) {
// //         return false;
// //       }
// //     }
// //     return true;
// //   };
// // }

// function valIn(values) {
//   return function (value) {
//     return values.includes(value);
//   };
// }

// function valDate(value) {
//   return Object.prototype.toString.call(value) === "[object Date]" && !isNaN(value);
// }

// function valBoolean(value) {
//   return typeof value === "boolean";
// }

// // 注意: 這個函式只檢查物件本身的屬性，不檢查原型鍊。
// function valObject(validator) {
//   return function (value) {
//     if (typeof value !== "object" || value === null || Array.isArray(value)) {
//       return false;
//     }
//     for (const key in value) {
//       if (!validator(value[key])) {
//         return false;
//       }
//     }
//     return true;
//   };
// }

// const validateCard = validator(cardRules);
// const errors = validateCard(data);

// if (errors) {
//   console.log("Validation failed:", errors);
// } else {
//   console.log("Validation succeeded");
// }
