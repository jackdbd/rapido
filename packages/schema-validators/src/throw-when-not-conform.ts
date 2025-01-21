import { conformResult, type Config, type Options } from "./conform-result.js";

export const throwWhenNotConform = <V>(
  config: Config<V>,
  options?: Options
) => {
  const { error } = conformResult(config, options);
  if (error) {
    throw error;
  }
};
