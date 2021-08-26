import { warn, error, hasOwn } from '@garfish/utils';

type Plugin<T extends any> = (result: T) => any;

export class PluginManager<T> {
  private _plugins: Set<Plugin<T>> = new Set();

  type: string;
  onerror: (errMsg: string | Error) => void = error;

  constructor(type?: string) {
    this.type = type;
  }

  on(plugin: Plugin<T>) {
    if (this._plugins.has(plugin)) {
      __DEV__ && warn('Repeat add plugin');
      return;
    }
    this._plugins.add(plugin);
  }

  once(plugin: Plugin<T>) {
    const self = this;
    return this.once(function wrapper(...args) {
      self.remove(wrapper);
      return plugin.apply(null, args);
    });
  }

  emit<T extends Record<string, any>>(result: T) {
    for (const plugin of this._plugins) {
      try {
        let illegalResult = false;
        const tempResult = plugin(result as any);

        for (const key in result) {
          if (!hasOwn(key, tempResult)) {
            illegalResult = true;
            break;
          }
        }
        if (illegalResult) {
          this.onerror(
            `The "${this.type}" type has a plugin return value error.`,
          );
        } else {
          result = tempResult;
        }
      } catch (err) {
        __DEV__ && warn(err);
        this.onerror(err);
      }
    }
    return result;
  }

  remove(plugin: Plugin<T>) {
    if (this._plugins.has(plugin)) {
      this._plugins.delete(plugin);
    }
  }

  removeAll() {
    this._plugins.clear();
  }
}
