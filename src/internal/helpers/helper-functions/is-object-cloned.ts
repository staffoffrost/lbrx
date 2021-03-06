import { compareObjects } from './compare-objects'
import { isObject } from './is-object'

export function isObjectCloned(objA: {}, objB: {}): boolean {
  if (!compareObjects(objA, objB)
    || !isObject(objA)
    || !isObject(objB)
    || objA === objB
    || objA.constructor.name != objB.constructor.name
  ) {
    return false
  }
  for (const key in objA) {
    if (isObject(objA[key]) && !isObjectCloned(objA[key], objB[key])) return false
  }
  return true
}
