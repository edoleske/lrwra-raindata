export const today = () => {
  const result = new Date();
  result.setHours(0);
  result.setMinutes(0);
  result.setSeconds(0);
  result.setMilliseconds(0);
  return result;
};
