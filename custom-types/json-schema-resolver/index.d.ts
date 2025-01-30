declare module "json-schema-resolver" {
  type BuildLocalReference = (
    json: Record<string, any>,
    baseUri: URL,
    fragment: any,
    i: number
  ) => string;

  type Resolve = (rootSchema: any, opts: any) => any;

  interface Options {
    clone?: boolean;
    buildLocalReference?: BuildLocalReference;
    target?: "draft-07";
  }
  export function jsonSchemaResolver(options?: Options): {
    resolve: Resolve;
    definitions: () => Record<number, any>;
  };

  export default jsonSchemaResolver;
}
