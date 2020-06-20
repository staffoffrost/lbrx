import { ErrorFactory } from 'helpers/factories'
import { assertNotNullable } from 'helpers/functions'
import { CustomError } from 'helpers/test-subjects'
import { GlobalErrorStore } from 'lbrx'

describe('Global Error Store - Error Reference:', () => {

  const errMsg = 'New Error Msg'
  const error = ErrorFactory.createError()
  const nestedError = ErrorFactory.createNestedError()
  let globalErrorStore: GlobalErrorStore<Error>

  beforeEach(async () => {
    const providerModule = await import('provider')
    globalErrorStore = providerModule.GlobalErrorStore.getStore()
  })

  afterEach(() => {
    jest.resetModules()
  })

  it('should have different error object reference.', () => {
    globalErrorStore.setError(error)
    expect(globalErrorStore.getError()).not.toBe(error)
  })

  it("should not be effected by error object's change after set.", () => {
    const localError = ErrorFactory.createError()
    globalErrorStore.setError(localError)
    localError.message = errMsg
    const storeError = globalErrorStore.getError()
    assertNotNullable(storeError)
    expect(storeError.message).toBeTruthy()
    expect(storeError.message).not.toBe(errMsg)
  })

  it("should not be effected by returned error object's change.", () => {
    let localError: Error | null = ErrorFactory.createError()
    globalErrorStore.setError(localError)
    localError = globalErrorStore.getError()
    assertNotNullable(localError)
    localError.message = errMsg
    const storeError = globalErrorStore.getError()
    assertNotNullable(storeError)
    expect(storeError.message).toBeTruthy()
    expect(storeError.message).not.toBe(errMsg)
  })

  it('should have different nested custom error object reference.', () => {
    globalErrorStore.setError(nestedError)
    assertNotNullable(nestedError.innerError?.innerError)
    const storeError = globalErrorStore.getError() as CustomError
    assertNotNullable(storeError?.innerError?.innerError)
    expect(storeError.innerError.innerError).not.toBe(nestedError.innerError.innerError)
  })

  it("should not be effected by custom error object's change after set.", () => {
    const localNestedError = ErrorFactory.createNestedError()
    globalErrorStore.setError(localNestedError)
    assertNotNullable(localNestedError.innerError?.innerError)
    localNestedError.innerError.innerError.message = errMsg
    const storeError = globalErrorStore.getError() as CustomError
    assertNotNullable(storeError?.innerError?.innerError)
    expect(storeError.innerError.innerError.message).toBeTruthy()
    expect(storeError.innerError.innerError.message).not.toBe(errMsg)
  })
})