import { isObject } from 'lbrx/utils'
import moment from 'moment'
import { ClassTestSubject } from '__test__/test-subjects'

describe(`Helper Function - isObject():`, () => {

  it(`should return true for plain object.`, () => {
    expect(isObject({})).toBeTruthy()
  })

  it(`should return true for constructable object.`, () => {
    expect(isObject(new ClassTestSubject())).toBeTruthy()
  })

  it(`should return true date's object.`, () => {
    expect(isObject(new Date())).toBeTruthy()
  })

  it(`should return true for moment.`, () => {
    expect(isObject(moment())).toBeTruthy()
  })

  it(`should return false for null.`, () => {
    expect(isObject(null)).toBeFalsy()
  })

  it(`should return false for undefined.`, () => {
    expect(isObject(undefined)).toBeFalsy()
  })

  it(`should return false for string.`, () => {
    expect(isObject(`test string`)).toBeFalsy()
  })

  it(`should return false for number.`, () => {
    expect(isObject(-1986)).toBeFalsy()
  })

  it(`should return false for boolean.`, () => {
    expect(isObject(false)).toBeFalsy()
  })

  it(`should return false for Symbol.`, () => {
    expect(isObject(Symbol())).toBeFalsy()
  })

  it(`should return false for function.`, () => {
    expect(isObject(() => { })).toBeFalsy()
  })
})
