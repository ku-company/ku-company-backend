export function enumToDropdown<T extends { [key: string]: string }>(e: T) {
  return Object.values(e).map(v => ({
    value: v,
    label: v.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2")
  }));
}