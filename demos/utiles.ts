export function capFirstOne(str: string) {
  return str.replace(/^\w/, (m) => m.toUpperCase());
}
