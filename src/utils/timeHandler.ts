const isValidDateTime = (dateTimeString: string) => {
  const timestamp = Date.parse(dateTimeString);
  return !Number.isNaN(timestamp);
};

export default { isValidDateTime };
