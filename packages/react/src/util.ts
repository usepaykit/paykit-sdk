export const parseElementContext = <T>(ctx: T, name: string): T => {
  if (!ctx) throw new Error(`${name}Context must be used within the ${name}Provider`);

  return ctx;
};
