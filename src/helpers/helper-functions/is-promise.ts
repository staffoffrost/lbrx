
export function isPromise(obj: unknown): obj is Promise<unknown> {
  return obj instanceof Promise
}
