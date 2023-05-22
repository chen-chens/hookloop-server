const filteredUndefinedConditions = (conditions: { [key: string]: any }) => {
  const filteredConditions: { [key: string]: any } = {};
  Object.entries(conditions).forEach(([key, value]) => {
    if (value !== undefined) {
      filteredConditions[key] = value;
    }
  });
  return filteredConditions;
};
export default filteredUndefinedConditions;
