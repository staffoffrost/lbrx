
/**
 * Implement to use onAfterInit hook.
 */
export interface StoreAfterInit<T = object> {

	/**
	 * Will be triggered only once, after the store would complete the initialization.
	 * - Allows state's value modification after initialization.
	 */
	onAfterInit(state: T): T | void
}
