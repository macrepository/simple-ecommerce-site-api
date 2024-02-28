/**
 * The function `__` is a template string tag function in JavaScript that replaces placeholders in the
 * template string with corresponding values provided as arguments.
 * @param {string} template 
 * @param  {...any} values 
 * @returns 
 */
export function __(template, ...values) {
  return template.replace(/%(\d+)/g, (match, number) => {
    return typeof values[number - 1] !== "undefined"
      ? values[number - 1]
      : match;
  });
}
