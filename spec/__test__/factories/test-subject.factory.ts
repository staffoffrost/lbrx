import { DeepNestedTestSubject, InnerTestSubject, TestSubject, TestSubjectConfigurations, TestSubjectWithMethods } from '__test__/test-subjects'

export class TestSubjectFactory {

  public static createTestSubject_initial(): TestSubject {
    return this.createTestSubject(TestSubjectConfigurations.initial)
  }
  public static createTestSubject_configA(): TestSubject {
    return this.createTestSubject(TestSubjectConfigurations.configurationA)
  }
  public static createTestSubject_configA_plain(): TestSubject {
    return this.createTestSubject(TestSubjectConfigurations.configurationA_plain)
  }
  public static createTestSubject_configB(): TestSubject {
    return this.createTestSubject(TestSubjectConfigurations.configurationB)
  }

  public static createTestSubjectWithMethods_initial(): TestSubjectWithMethods {
    return this.createTestSubjectWithMethods(TestSubjectConfigurations.initial)
  }
  public static createTestSubjectWithMethods_configA(): TestSubjectWithMethods {
    return this.createTestSubjectWithMethods(TestSubjectConfigurations.configurationA)
  }
  public static createTestSubjectWithMethods_configA_plain(): TestSubjectWithMethods {
    return this.createTestSubjectWithMethods(TestSubjectConfigurations.configurationA_plain)
  }
  public static createTestSubjectWithMethods_configB(): TestSubjectWithMethods {
    return this.createTestSubjectWithMethods(TestSubjectConfigurations.configurationB)
  }

  public static createTestSubject(configuration: TestSubjectConfigurations): TestSubject {
    switch (configuration) {
      case TestSubjectConfigurations.initial:
        return new TestSubject({
          stringValue: `abcdefg`,
          numberValue: 5,
          booleanValue: false,
          dateValue: new Date(2020, 5),
          getterSetterDate: new Date(2020, 6),
          innerTestObject: TestSubjectFactory.createInnerTestSubject(configuration),
          innerTestObjectGetSet: TestSubjectFactory.createInnerTestSubject(configuration),
        })
      case TestSubjectConfigurations.configurationA:
        return new TestSubject({
          stringValue: `abcdefg`,
          numberValue: 5,
          booleanValue: false,
          dateValue: new Date(2020, 2),
          getterSetterDate: new Date(2020, 6),
          innerTestObject: TestSubjectFactory.createInnerTestSubject(configuration),
          innerTestObjectGetSet: TestSubjectFactory.createInnerTestSubject(configuration),
        })
      case TestSubjectConfigurations.configurationA_plain:
        return JSON.parse(JSON.stringify(this.createTestSubject(TestSubjectConfigurations.configurationA)))
      case TestSubjectConfigurations.configurationB:
        return new TestSubject({
          stringValue: `abcdefg`,
          numberValue: 5,
          booleanValue: false,
          dateValue: new Date(2020, 2),
          getterSetterDate: new Date(2020, 6),
          innerTestObject: null,
          innerTestObjectGetSet: null,
        })
    }
  }

  public static createInnerTestSubject(configuration: TestSubjectConfigurations): InnerTestSubject | null {
    switch (configuration) {
      case TestSubjectConfigurations.initial:
        return new InnerTestSubject({
          stringValue: `a b c`,
          numberValue: 112346579.1236549,
          booleanValue: true,
          dateValue: new Date(2018, 9),
          getterSetterDate: new Date(2018, 8),
          deepNestedObj: TestSubjectFactory.createDeepNestedTestSubject(configuration),
          obj: {
            value: `aaaaaaaa bbbbbbbbb`,
            date: new Date(2017, 5)
          },
        })
      case TestSubjectConfigurations.configurationA:
        return new InnerTestSubject({
          stringValue: `a b c`,
          numberValue: 112346579.1236549,
          booleanValue: true,
          dateValue: new Date(2018, 9),
          getterSetterDate: new Date(2018, 8),
          deepNestedObj: TestSubjectFactory.createDeepNestedTestSubject(configuration),
          obj: {
            value: `aaaaaaaa bbbbbbbbb`,
            date: new Date(2017, 5)
          },
        })
      case TestSubjectConfigurations.configurationA_plain:
        return JSON.parse(JSON.stringify(this.createInnerTestSubject(TestSubjectConfigurations.configurationA)))
      case TestSubjectConfigurations.configurationB:
        return null
    }
  }

  public static createDeepNestedTestSubject(configuration: TestSubjectConfigurations): DeepNestedTestSubject | null {
    switch (configuration) {
      case TestSubjectConfigurations.initial: {
        const partialDeepNestedObject: Partial<DeepNestedTestSubject> = {
          stringValue: `some string here`,
          numberValue: 5.55,
          booleanValue: false,
          dateValue: new Date(2019, 0),
          objectList: [
            {
              value: `some value`,
              date: new Date(2019, 5)
            },
            {
              value: `some other value`,
              date: new Date(2019, 5)
            },
            null,
            {
              value: `some value`,
              date: new Date(2019, 6)
            },
          ],
          stringsList: [
            `a`,
            `b b b`,
            `c`,
            null,
            `e e`
          ]
        }
        return Object.assign(new DeepNestedTestSubject(), partialDeepNestedObject)
      }
      case TestSubjectConfigurations.configurationA: {
        const partialDeepNestedObject: Partial<DeepNestedTestSubject> = {
          stringValue: `some string here`,
          numberValue: 5.55,
          booleanValue: false,
          dateValue: new Date(2019, 0),
          objectList: [
            {
              value: `some value`,
              date: new Date(2019, 5)
            },
            {
              value: `some other value`,
              date: new Date(2019, 5)
            },
            {
              value: `some value`,
              date: new Date(2019, 9)
            },
            {
              value: `some value`,
              date: new Date(2019, 6)
            },
          ],
          stringsList: [
            `a`,
            `b b b`,
            `c`,
            null,
            `e e`
          ]
        }
        return Object.assign(new DeepNestedTestSubject(), partialDeepNestedObject)
      }
      case TestSubjectConfigurations.configurationA_plain:
        return JSON.parse(JSON.stringify(this.createDeepNestedTestSubject(TestSubjectConfigurations.configurationA)))
      case TestSubjectConfigurations.configurationB:
        return null
    }
  }

  public static createTestSubjectWithMethods(configuration: TestSubjectConfigurations): TestSubjectWithMethods {
    switch (configuration) {
      case TestSubjectConfigurations.initial: {
        const partialObj: Partial<TestSubjectWithMethods> = {
          method: () => { },
          methodGetSet: () => { },
          innerObjectWithMethod: { method: () => { } },
          listOfMethods: [
            () => { },
            () => { },
          ]
        }
        const testSubject = this.createTestSubject(configuration)
        return new TestSubjectWithMethods(Object.assign(testSubject, partialObj))
      }
      case TestSubjectConfigurations.configurationA: {
        const partialObj: Partial<TestSubjectWithMethods> = {
          method: () => { },
          methodGetSet: () => { },
          innerObjectWithMethod: { method: () => { } },
          listOfMethods: [
            () => { },
            () => { },
            () => { },
          ]
        }
        const testSubject = this.createTestSubject(configuration)
        return new TestSubjectWithMethods(Object.assign(testSubject, partialObj))
      }
      case TestSubjectConfigurations.configurationA_plain: {
        const partialObj: Partial<TestSubjectWithMethods> = {
          method: () => { },
          methodGetSet: () => { },
          innerObjectWithMethod: { method: () => { } },
          listOfMethods: [
            () => { },
            () => { },
          ]
        }
        const testSubject = this.createTestSubject(configuration)
        const testSubjectWithMethods = new TestSubjectWithMethods(Object.assign(testSubject, partialObj))
        return JSON.parse(JSON.stringify(testSubjectWithMethods))
      }
      case TestSubjectConfigurations.configurationB: {
        const partialObj: Partial<TestSubjectWithMethods> = {
          method: null,
          methodGetSet: () => { },
          innerObjectWithMethod: { method: null },
          listOfMethods: [
            null,
            () => { },
          ]
        }
        const testSubject = this.createTestSubject(configuration)
        return new TestSubjectWithMethods(Object.assign(testSubject, partialObj))
      }
    }
  }
}
