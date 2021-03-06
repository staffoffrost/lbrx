import { QueryContext, QueryContextsList as QueryContextList_type } from 'lbrx/internal/stores/store-accessories'
import { Observable } from 'rxjs'
import { StoresFactory as StoresFactory_type } from '__test__/factories'


describe(`Store Accessories - QueryContextsList:`, () => {

  const createQueryContext = () => ({ isDisposed: false, wasHardReset: false, observable: new Observable() })
  let QueryContextList: typeof QueryContextList_type
  let StoresFactory: typeof StoresFactory_type

  beforeEach(async () => {
    const provider = await import(`provider`)
    QueryContextList = provider.QueryContextsList
    StoresFactory = provider.StoresFactory
  })

  it(`should require a store for the constructor.`, () => {
    const store = StoresFactory.createStore(null)
    const queryContextList = new QueryContextList(store)
    expect(queryContextList[`_store`]).toBe(store)
  })

  it(`should extend array.`, () => {
    const store = StoresFactory.createStore(null)
    const queryContextList = new QueryContextList(store)
    expect(queryContextList).toBeInstanceOf(Array)
  })

  it(`should return length of the query context list.`, () => {
    const store = StoresFactory.createStore(null)
    const queryContextList = new QueryContextList(store)
    expect(queryContextList.length).toBe(0)
    queryContextList.push(createQueryContext())
    queryContextList.push(createQueryContext())
    expect(queryContextList.length).toBe(2)
  })

  it(`should allow pushing query context.`, () => {
    const store = StoresFactory.createStore(null)
    const queryContextList = new QueryContextList(store)
    const queryContext = createQueryContext()
    queryContextList.push(queryContext)
    expect(queryContextList[0]).toBe(queryContext)
  })

  it(`should invoke store's initializeAsync if lazyInitContext exists.`, () => {
    const store = StoresFactory.createStore(null)
    const initializeAsyncApy = jest.spyOn(store, `initializeAsync`)
    const queryContextList = new QueryContextList(store)
    store.initializeLazily(Promise.resolve({}))
    const queryContext = createQueryContext()
    queryContextList.push(queryContext)
    expect(initializeAsyncApy).toBeCalledTimes(1)
  })

  it(`should invoke store's initializeAsync with resolve if lazyInitContext exists.`, async done => {
    const store = StoresFactory.createStore(null)
    const queryContextList = new QueryContextList(store)
    store.initializeLazily(Promise.resolve({ foo: `foo` }))
      .then(x => {
        expect(x).toBeUndefined()
        done()
      })
    queryContextList.push(createQueryContext())
  })

  it(`should invoke store's initializeAsync with reject if lazyInitContext exists but initialization returned an error.`, async done => {
    const store = StoresFactory.createStore(null)
    const queryContextList = new QueryContextList(store)
    const error = new Error(`foo`)
    store.initializeLazily(Promise.reject(error))
      .catch(e => {
        expect(e).toStrictEqual(error)
        done()
      })
    queryContextList.push(createQueryContext())
  })

  it(`should allow disposing a context by index.`, () => {
    const store = StoresFactory.createStore(null)
    const queryContextList = new QueryContextList(store)
    queryContextList.push(createQueryContext())
    const queryContext = createQueryContext()
    queryContextList.push(queryContext)
    queryContextList.push(createQueryContext())
    queryContextList.push(createQueryContext())
    expect(queryContextList.length).toBe(4)
    expect(queryContextList).toContain(queryContext)
    expect(queryContext.isDisposed).toBeFalsy()
    const result = queryContextList.disposeByIndex(1)
    expect(result).toBeTruthy()
    expect(queryContextList.length).toBe(3)
    expect(queryContextList).not.toContain(queryContext)
    expect(queryContext.isDisposed).toBeTruthy()
  })

  it(`should ignore when disposing an element by index that doesn't exist.`, () => {
    const store = StoresFactory.createStore(null)
    const queryContextList = new QueryContextList(store)
    queryContextList.push(createQueryContext())
    queryContextList.push(createQueryContext())
    queryContextList.push(createQueryContext())
    expect(queryContextList.length).toBe(3)
    const result = queryContextList.disposeByIndex(3)
    expect(result).toBeFalsy()
    expect(queryContextList.length).toBe(3)
    expect(queryContextList.every(x => !x.isDisposed)).toBeTruthy()
  })

  it(`should allow disposing a context by observable.`, () => {
    const store = StoresFactory.createStore(null)
    const queryContextList = new QueryContextList(store)
    queryContextList.push(createQueryContext())
    const queryContext = createQueryContext()
    queryContextList.push(queryContext)
    queryContextList.push(createQueryContext())
    queryContextList.push(createQueryContext())
    expect(queryContextList.length).toBe(4)
    expect(queryContextList).toContain(queryContext)
    expect(queryContext.isDisposed).toBeFalsy()
    const result = queryContextList.disposeByObservable(queryContext.observable)
    expect(result).toBeTruthy()
    expect(queryContextList.length).toBe(3)
    expect(queryContextList).not.toContain(queryContext)
    expect(queryContext.isDisposed).toBeTruthy()
  })

  it(`should ignore when disposing an element by observable that doesn't exist.`, () => {
    const store = StoresFactory.createStore(null)
    const queryContextList = new QueryContextList(store)
    queryContextList.push(createQueryContext())
    queryContextList.push(createQueryContext())
    queryContextList.push(createQueryContext())
    expect(queryContextList.length).toBe(3)
    const queryContext = createQueryContext()
    const result = queryContextList.disposeByObservable(queryContext.observable)
    expect(result).toBeFalsy()
    expect(queryContextList.length).toBe(3)
    expect(queryContextList.every(x => !x.isDisposed)).toBeTruthy()
  })

  it(`should allow disposing all element at once.`, () => {
    const store = StoresFactory.createStore(null)
    const queryContextList = new QueryContextList(store)
    const numOfRequiredContexts = 3
    const contextsCacheList: QueryContext[] = []
    for (let i = 0; i < numOfRequiredContexts; i++) {
      const queryContext = createQueryContext()
      contextsCacheList.push(queryContext)
      queryContextList.push(queryContext)
    }
    expect(queryContextList.length).toBe(numOfRequiredContexts)
    const result = queryContextList.disposeAll()
    expect(result).toBe(numOfRequiredContexts)
    expect(queryContextList.length).toBe(0)
    expect(contextsCacheList.every(x => x.isDisposed)).toBeTruthy()
  })

  it(`should allow updating all elements that there was a hard reset.`, () => {
    const store = StoresFactory.createStore(null)
    const queryContextList = new QueryContextList(store)
    queryContextList.push(createQueryContext())
    queryContextList.push(createQueryContext())
    queryContextList.push(createQueryContext())
    queryContextList.wasHardReset = true
    expect(queryContextList.every(x => x.wasHardReset)).toBeTruthy()
    queryContextList.wasHardReset = false
    expect(queryContextList.every(x => x.wasHardReset)).toBeFalsy()
  })
})
