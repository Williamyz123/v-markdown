// src/plugins/core/PluginManager.ts
import { Plugin, EditorAPI } from '@/types/plugin';

export class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private api: EditorAPI;

  constructor(api: EditorAPI) {
    this.api = api;
  }

  registerPlugin(plugin: Plugin) {
    if (this.plugins.has(plugin.id)) {
      console.warn(`插件 ${plugin.id} 已经注册过了`);
      return;
    }

    try {
      plugin.initialize(this.api);
      this.plugins.set(plugin.id, plugin);
      console.log(`插件 ${plugin.id} 注册成功`);
    } catch (error) {
      console.error(`插件 ${plugin.id} 注册失败:`, error);
      throw error;
    }
  }

  unregisterPlugin(pluginId: string) {
    const plugin = this.plugins.get(pluginId);
    if (plugin?.destroy) {
      try {
        plugin.destroy();
        this.plugins.delete(pluginId);
      } catch (error) {
        console.error(`注销插件 ${pluginId} 失败:`, error);
      }
    }
  }

  getPlugin(pluginId: string) {
    return this.plugins.get(pluginId);
  }

  getExtensions(extensionPoint: keyof Plugin) {
    const extensions: any[] = [];

    for (const plugin of this.plugins.values()) {
      const ext = plugin[extensionPoint];
      if (typeof ext === 'function' && extensionPoint === 'initialize') {
        try {
          const result = ext(this.api);
          if (Array.isArray(result)) {
            extensions.push(...result);
          }
        } catch (error) {
          console.error(`从插件 ${plugin.id} 获取扩展失败:`, error);
        }
      } else if (typeof ext === 'function') {
        try {
          const result = ext();
          if (Array.isArray(result)) {
            extensions.push(...result);
          }
        } catch (error) {
          console.error(`从插件 ${plugin.id} 获取扩展失败:`, error);
        }
      }
    }

    return extensions;
  }
}
