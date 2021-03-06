import { Subscription } from 'rxjs'
import { isDev } from '../core'
import { cloneError, compareObjects, countObjectChanges, filterObject, isBrowser, isError, isObject, isString, logWarn, mergeObjects, newError, objectKeys, parse, shallowCloneObject, stringify } from '../helpers'
import { BaseStore } from '../stores'
import { Actions, getDefaultState, State } from '../stores/store-accessories'
import { KeyOf, KeyValue, ZoneLike } from '../types'
import { DevtoolsOptions, getDefaultDevToolsConfig, ReduxDevToolsOptions } from './config'
import { DevToolsAdapter } from './dev-tools-adapter'
import { activateStreamToDevTools } from './dev-tools-mode'
import { ReduxDevToolsExtension } from './redux-dev-tools-extension.interface'
import { ReduxDevToolsMessage } from './redux-dev-tools-message.interface'
import { ReduxDevToolsMonitor } from './redux-dev-tools-monitor.interface'
import { StoreDevToolsApi } from './store-dev-tools-api.interface'

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__: ReduxDevToolsExtension
  }
}

export class DevToolsManager {

  private static _wasInitialized = false

  private _sub = new Subscription()
  private _state: KeyValue = {}
  private _storeLastAction: KeyValue<string, Actions | string> = {}
  private _zone = {
    run: (f: any) => f()
  }
  private _reduxMonitor: ReduxDevToolsMonitor | null = null
  private _reduxDevToolsOptionsKeys: KeyOf<ReduxDevToolsOptions>[] = [`name`, `maxAge`]
  private _devToolsOptions: DevtoolsOptions
  private _partialStateHistory: { historyLength: number, history: KeyValue<string, Partial<State<any>>[]> } =
    { historyLength: 0, history: {} }
  private _errorsCache: KeyValue<string, any> = {}
  private _pauseRecording = false

  constructor(
    devToolsOptions: Partial<DevtoolsOptions> = {}
  ) {
    this._devToolsOptions = mergeObjects(getDefaultDevToolsConfig(), devToolsOptions)
  }

  public initialize(): void {
    if (!isDev() || !isBrowser() || !window.__REDUX_DEVTOOLS_EXTENSION__ || DevToolsManager._wasInitialized) return
    if (objectKeys(DevToolsAdapter.stores).length) {
      logWarn(`DevToolsManager was initialized after one or more stores were created. This can result an unexpected results when debugging with Redux Monitor.`)
    }
    (window as any).$$LbrX = {
      $$stores: DevToolsAdapter.stores,
      $$states: DevToolsAdapter.states,
      $$values: DevToolsAdapter.values,
    }
    const reduxDevToolsOptions = filterObject(this._devToolsOptions as DevtoolsOptions, this._reduxDevToolsOptionsKeys, false)
    this._reduxMonitor = window.__REDUX_DEVTOOLS_EXTENSION__.connect(reduxDevToolsOptions)
    if (this._devToolsOptions.displayValueAsState) this._addPartialStatesToHistory()
    this._state = shallowCloneObject(this._devToolsOptions.displayValueAsState ? DevToolsAdapter.values : DevToolsAdapter.states)
    this._reduxMonitor.init(this._state)
    this._setSubscribers(this._reduxMonitor)
    activateStreamToDevTools()
    DevToolsManager._wasInitialized = true
  }

  public setDevToolsZone(zone: ZoneLike): void {
    this._zone = zone
  }

  private _addPartialStatesToHistory(): void {
    const partialStateHistory = this._partialStateHistory
    objectKeys(DevToolsAdapter.states).forEach(key => {
      const history = partialStateHistory.history
      if (!history[key]) history[key] = []
      const state = DevToolsAdapter.states[key]
      history[key][partialStateHistory.historyLength] = {
        isPaused: state.isPaused,
        isLoading: state.isLoading,
        isHardResettings: state.isHardResettings,
        error: cloneError(state.error)
      }
    })
    partialStateHistory.historyLength++
    if (partialStateHistory.historyLength > this._devToolsOptions.maxAge) {
      const indexToSetToNull = partialStateHistory.historyLength - this._devToolsOptions.maxAge
      objectKeys(partialStateHistory.history).forEach(key => {
        const stateArr = partialStateHistory.history[key]
        stateArr[0] = stateArr[indexToSetToNull]
        stateArr[indexToSetToNull] = null!
      })
    }
  }

  private _setSubscribers(reduxMonitor: ReduxDevToolsMonitor): void {
    const options = this._devToolsOptions
    this._sub.add(DevToolsAdapter.stateChange$.subscribe(x => {
      if (this._pauseRecording) return
      if (x.state.error && !compareObjects(this._errorsCache[x.storeName], x.state.error)) {
        let errMsg = `An ERROR occurred at "${x.storeName}". Message: `
        const error: string | Error | object = x.state.error
        if (isError(error) && error.message && !error[`toJSON`]) errMsg += `"${error.message}"`
        else if (isString(error)) errMsg += `"${error}"`
        else if (isObject(error)) errMsg += `"${stringify(error)}"`
        else errMsg += `DevTools Manager couldn't resolve the error message.`
        reduxMonitor.error(errMsg)
      }
      this._errorsCache[x.storeName] = x.state.error
      const clonedState = shallowCloneObject(options.displayValueAsState ? x.state.value! : x.state)
      const numOfChanges = countObjectChanges(this._state[x.storeName], clonedState)
      if (!numOfChanges && this._storeLastAction[x.storeName] == x.actionName && !options.logEqualStates) return
      this._state[x.storeName] = clonedState
      this._storeLastAction[x.storeName] = x.actionName
      let state: KeyValue | void
      if (options.showStackTrace && this._state[x.storeName]) {
        state = shallowCloneObject(this._state)
        state[x.storeName][`action-stack-trace`] = newError().stack
      }
      reduxMonitor.send(`${x.storeName} - ${x.actionName}`, state || this._state)
      if (options.displayValueAsState) this._addPartialStatesToHistory()
    }))
    reduxMonitor.subscribe((message: ReduxDevToolsMessage) => {
      if (message.type != `DISPATCH`) return
      const payload = message.payload
      const payloadType: string = payload.type
      if (payloadType == `COMMIT`) {
        reduxMonitor.init(this._state)
        if (!this._devToolsOptions.displayValueAsState) return
        this._partialStateHistory = { historyLength: 0, history: {} }
        this._addPartialStatesToHistory()
      } else if (payloadType == `PAUSE_RECORDING`) {
        this._pauseRecording = payload.status
      } else if (!message.state) {
        return
      } else if (payloadType == `JUMP_TO_STATE` || payloadType == `JUMP_TO_ACTION`) {
        const reduxDevToolsState = parse<object>(message.state)
        const reduxStoreNames = objectKeys(reduxDevToolsState)
        objectKeys(DevToolsAdapter.stores).forEach((storeName: string) => {
          const store: BaseStore<any, any> = DevToolsAdapter.stores[storeName]
          if (!store) return
          const getReduxDevToolsState = (): State<any> => {
            const reduxDevToolsStoreState: State<any> | {} = reduxDevToolsState[storeName]
            this._state[storeName] = reduxDevToolsStoreState
            if (!options.displayValueAsState) return reduxDevToolsStoreState as State<any>
            const partialStateHistory = this._partialStateHistory
            const partialState = partialStateHistory.history[storeName][payload.actionId]
            return mergeObjects({ value: reduxDevToolsStoreState } as State<any>, partialState)
          }
          const isStoreExisted = reduxStoreNames.includes(storeName)
          this._zone.run(() => {
            this._setState(store, isStoreExisted ? getReduxDevToolsState() : getDefaultState())
          })
        })
      } else if (payloadType == `TOGGLE_ACTION`) {
        reduxMonitor.error(`"skip" option is not supported.`)
      }
    })
  }

  private _setState(store: BaseStore<any, any> | any, state: State<any>): void {
    const storeDevApi: StoreDevToolsApi = store._devToolsApi
    if (storeDevApi.isClassHandler && storeDevApi.instancedValue) {
      state.value = storeDevApi.handleClasses(storeDevApi.instancedValue, state.value!)
    }
    storeDevApi.setState(state)
  }
}
