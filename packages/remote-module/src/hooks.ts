import type { ModuleManager } from '@garfish/loader';
import { PluginSystem, SyncHook, SyncWaterfallHook } from '@garfish/hooks';
import type { Actuator } from './actuator';

export const hooks = new PluginSystem({
  preloaded: new SyncHook<[ModuleManager], any>(),
  initModule: new SyncHook<[Actuator], any>('initModule'),
  afterLoadModule: new SyncWaterfallHook<Record<PropertyKey, any>>(
    'afterLoadModule',
  ),
});
