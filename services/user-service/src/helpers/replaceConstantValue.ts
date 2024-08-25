export default function changeConstantValue(
  string: string,
  values: Record<string, string | number | boolean> = {},
) {
  let replaceValue = '';
  for (const value in values) {
    replaceValue = '{' + value + '}';
    string = string.replace(replaceValue, <string>values[value]);
  }
  return string;
}
