import { deleteLocalStorageMock, deleteMockedWindow, deleteReduxDevToolsExtensionMock, deleteSessionStorageMock, mockLocalStorage, mockReduxDevToolsExtension, mockSessionStorage, mockWindow } from '__test__/mocks'

export default class MockBuilder {

  private static jobsList: (() => any)[] = []

  private constructor() { }

  public static addWindowMock(): typeof MockBuilder {
    MockBuilder.jobsList.push(mockWindow)
    return MockBuilder
  }

  public static addReduxDevToolsExtensionMock(): typeof MockBuilder {
    MockBuilder.jobsList.push(mockReduxDevToolsExtension)
    return MockBuilder
  }

  public static addLocalStorageMock(): typeof MockBuilder {
    MockBuilder.jobsList.push(mockLocalStorage)
    return MockBuilder
  }

  public static addSessionStorageMock(): typeof MockBuilder {
    MockBuilder.jobsList.push(mockSessionStorage)
    return MockBuilder
  }

  public static buildMocks(): void {
    MockBuilder.jobsList.forEach(f => f())
    MockBuilder.jobsList = []
  }

  public static deleteAllMocks(): void {
    deleteReduxDevToolsExtensionMock()
    deleteLocalStorageMock()
    deleteSessionStorageMock()
    deleteMockedWindow()
  }
}
