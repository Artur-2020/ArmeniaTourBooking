/**
 * Change constant values in string like {name} to name value
 * @param string
 * @param values
 */
export default function changeConstantValue(
  string: string,
  values: Record<string, string | number | boolean> = {},
) {
  let replaceValue = '';
  for (const value in values) {
    replaceValue = '{' + value + '}';
    string = string.replaceAll(replaceValue, <string>values[value]);
  }
  return string;
}
