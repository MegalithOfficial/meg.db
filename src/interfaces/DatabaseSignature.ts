export type DatabaseSignature<V> = {
    [key in keyof V]: any;
  };