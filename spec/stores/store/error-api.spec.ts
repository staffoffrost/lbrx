import { ErrorFactory, TestSubjectFactory } from 'helpers/factories'
import { TestSubject } from 'helpers/test-subjects'
import { Store } from 'lbrx'
import { from, timer } from 'rxjs'

describe('Store Error API:', () => {

  const error = ErrorFactory.createError()
  const pureError = ErrorFactory.createError()
  const initialState = TestSubjectFactory.createTestSubject_initial()
  let store: Store<TestSubject, Error>

  beforeEach(async () => {
    const providerModule = await import('provider')
    store = providerModule.StoresFactory.createStore(initialState)
  })

  afterEach(() => {
    jest.resetModules()
  })

  it('should have null as the default error value.', () => {
    expect(store.getError()).toBeNull()
  })

  it('should return null as the default error value from observable.', done => {
    store.error$.subscribe(value => {
      expect(value).toBeNull()
      done()
    })
  })

  it('should return the exact same error after setting it.', () => {
    store.setError(error)
    expect(store.getError()).toStrictEqual(pureError)
  })

  it('should return the exact same error from observable after setting it.', done => {
    store.setError(error)
    store.error$.subscribe(value => {
      expect(value).toStrictEqual(pureError)
      done()
    })
  })

  it('should not emit null value more then once.', async () => {
    let nullCounter = 0
    store.error$.subscribe(value => {
      if (value === null) nullCounter++
    })
    store.setError(null)
    store.setError(null)
    store.setError(null)
    await timer(100).toPromise()
    expect(nullCounter).toBe(1)
  }, 200)

  it('should return the errors data flow from observable.', async () => {
    const errorsStream = [error, null, null, error]
    const expectedErrors = [null, error, null, error]
    const actualErrors: any[] = []
    store.error$.subscribe(value => actualErrors.push(value))
    from(errorsStream).subscribe(value => store.setError(value))
    await Promise.resolve()
    expect(actualErrors).toStrictEqual(expectedErrors)
  })
})