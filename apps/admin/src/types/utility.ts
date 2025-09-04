// Makes all properties optional except a required subset K
export type OptionalExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

// Picks keys K and makes them required
export type RequiredOnly<T, K extends keyof T> = Required<Pick<T, K>>;

// Makes only keys K optional; others stay as-is
export type OptionalOnly<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;
