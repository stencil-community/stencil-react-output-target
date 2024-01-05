export const dashToPascalCase = (str: string) =>
  str
    .toLowerCase()
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('');

export const eventListenerName = (eventName: string) => {
  return `on${eventName.charAt(0).toUpperCase()}${eventName.slice(1)}`;
};
