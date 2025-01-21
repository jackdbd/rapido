export const EMOJI = {
  ERROR: "❌",
  EXCEPTION: "🚨",
  EXIT_ONE: "🚩",
};

export type Result<V, E extends Error = Error> =
  | { error: E; value?: undefined }
  | { error?: undefined; value: V };

export interface Config<E extends Error = Error> {
  onError: (error: E) => never;
  onUndefinedValue: () => never;
}

export const defUnwrap = (config: Config) => {
  const { onError, onUndefinedValue } = config;

  const unwrap = <V, E extends Error = Error>(result: Result<V, E>) => {
    const { error, value } = result;

    if (error) {
      return onError(error);
    }

    if (!value) {
      return onUndefinedValue();
    }
    return value;
  };

  return unwrap;
};

export const unwrap = defUnwrap({
  onError: (error) => {
    console.error(`${EMOJI.ERROR} ${error.message}`);
    process.exit(1);
  },
  onUndefinedValue: () => {
    console.error(`${EMOJI.ERROR} value is undefined`);
    process.exit(1);
  },
});

export const unwrapP = async <V, E extends Error = Error>(
  promise: Promise<Result<V, E>>
) => {
  const result = await promise;
  return unwrap(result);
};
