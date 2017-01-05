declare module 'electron-config' {

  class Config {
    constructor(opts: any)

    /**
     * Set an item.
     */
    set(key: string, value: any): void

    /**
     * Set multiple items at once.
     */
    set(object: Object): void

    /**
     * Get an item.
     */
    get(key: string): any

    /**
     * Check if an item exists.
     */
    has(key: string): boolean

    /**
     * Delete an item.
     */
    delete(key: string): void

    /**
     * Delete all items.
     */
    clear(): void;

    /**
     * Get the item count.
     */
    size: number

    /**
     * Get all the config as an object or replace the current config with an object:
     * `conf.store = {  hello: 'world' };`
     */
    store: Object

    /**
     * Get the path to the config file.
     */
    path: string
  }

  export = Config
}
