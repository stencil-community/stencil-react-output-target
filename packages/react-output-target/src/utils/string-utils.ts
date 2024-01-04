export const dashToPascalCase = (str: string) =>
  str
    .toLowerCase()
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join("");

export const dashToCamelCase = (str: string) =>
  str
    .toLowerCase()
    .split("-")
    .map((segment, index) => {
      if (index === 0) {
        return segment;
      }
      return segment.charAt(0).toUpperCase() + segment.slice(1);
    })
    .join("");
