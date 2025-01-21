// src/plugins/core/PluginManager.ts
import { Plugin, EditorAPI } from '@/types/plugin';

export class PluginManager {
  // 存储所有注册的插件，使用 Map 保证插件 ID 的唯一性
  private plugins: Map<string, Plugin> = new Map();

  // 存储编辑器 API 实例，用于提供给插件使用
  private api: EditorAPI;

  constructor(api: EditorAPI) {
    console.log('PluginManager 初始化，当前 API:');
    console.log(api);
    this.api = api;
  }

  // 注册新插件
  registerPlugin(plugin: Plugin) {
    console.log('尝试注册插件:', plugin.id);
    console.log('当前已注册的插件:', Array.from(this.plugins.keys()));
    // 检查插件是否已经注册
    if (this.plugins.has(plugin.id)) {
      console.warn(`插件 ${plugin.id} 已经注册过了`);
      return;
    }

    // 检查插件依赖
    if (plugin.dependencies) {
      for (const depId of plugin.dependencies) {
        // 确保所有依赖的插件都已经注册
        if (!this.plugins.has(depId)) {
          throw new Error(`插件 ${plugin.id} 依赖于 ${depId}，但该插件尚未注册`);
        }
      }
    }

    // 初始化插件
    try {
      console.log('初始化插件:', plugin.id);
      // 调用插件的初始化方法，传入编辑器 API
      plugin.initialize(this.api);
      // 将插件实例保存到插件映射表中
      this.plugins.set(plugin.id, plugin);
      console.log('插件注册成功:', plugin.id);
      console.log('注册后的插件列表:', Array.from(this.plugins.keys()));
    } catch (error) {
      console.error(`初始化插件 ${plugin.id} 失败:`, error);
    }
  }

  // 注销插件
  unregisterPlugin(pluginId: string) {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      // 检查是否有其他插件依赖于此插件
      for (const [id, p] of this.plugins) {
        if (p.dependencies?.includes(pluginId)) {
          throw new Error(`无法注销插件 ${pluginId}: 它被插件 ${id} 依赖`);
        }
      }

      // 执行插件的清理工作
      try {
        if (plugin.destroy) {
          plugin.destroy();
        }
        // 从插件映射表中移除
        this.plugins.delete(pluginId);
      } catch (error) {
        console.error(`注销插件 ${pluginId} 失败:`, error);
      }
    }
  }

  // 获取指定 ID 的插件实例
  getPlugin(pluginId: string) {
    return this.plugins.get(pluginId);
  }

  // 获取所有插件提供的特定类型的扩展
  getExtensions(extensionPoint: keyof Plugin) {
    console.log(`获取扩展点 ${String(extensionPoint)} 的扩展`);
    console.log('当前注册的插件:', Array.from(this.plugins.keys()));
    const extensions: any[] = [];

    // 遍历所有已注册的插件
    for (const plugin of this.plugins.values()) {
      console.log(`检查插件 ${plugin.id} 的扩展点 ${String(extensionPoint)}`);
      // 获取插件提供的指定扩展点的函数
      const ext = plugin[extensionPoint];
      // 如果插件提供了该扩展点的实现
      if (typeof ext === 'function') {
        try {
          // 调用扩展函数，绑定插件实例作为 this 上下文
          const result = ext.bind(plugin)();
          console.log(`插件 ${plugin.id} 的扩展点返回结果:`, result);
          // 如果返回结果是数组，则展开添加到扩展列表中
          if (Array.isArray(result)) {
            console.log(`插件 ${plugin.id} 返回的扩展:`, result);
            extensions.push(...result);
          }
        } catch (error) {
          console.error(`从插件 ${plugin.id} 获取 ${String(extensionPoint)} 扩展失败:`, error);
        }
      } else {
        console.log(`插件 ${plugin.id} 没有实现扩展点 ${String(extensionPoint)}`);
      }
    }
    console.log('最终获取到的所有扩展:', extensions);
    return extensions;
  }
}
