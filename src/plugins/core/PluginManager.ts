// src/plugins/core/PluginManager.ts
import { Plugin, EditorAPI } from '@/types/plugin';

/**
 * 插件管理器类
 * 负责管理编辑器的所有插件，包括插件的注册、注销、获取等功能
 * 同时负责处理插件的扩展点(extension points)机制
 */
export class PluginManager {
  /**
   * 存储已注册的插件
   * 使用 Map 数据结构，key 为插件ID，value 为插件实例
   */
  private plugins: Map<string, Plugin> = new Map();

  /**
   * 编辑器API实例
   * 用于向插件提供编辑器的核心功能
   */
  private api: EditorAPI;

  /**
   * 构造函数
   * @param api 编辑器API实例，提供给插件使用的核心功能接口
   */
  constructor(api: EditorAPI) {
    this.api = api;
  }

  /**
   * 注册新插件
   * @param plugin 要注册的插件实例
   *
   * 注册流程：
   * 1. 检查插件是否已经注册
   * 2. 初始化插件（调用插件的initialize方法）
   * 3. 将插件存储到插件Map中
   */
  registerPlugin(plugin: Plugin) {
    // 检查插件是否已经注册，避免重复注册
    if (this.plugins.has(plugin.id)) {
      console.warn(`插件 ${plugin.id} 已经注册过了`);
      return;
    }

    try {
      // 调用插件的初始化方法，传入编辑器API
      plugin.initialize(this.api);
      // 将插件实例保存到插件Map中
      this.plugins.set(plugin.id, plugin);
      console.log(`插件 ${plugin.id} 注册成功`);
    } catch (error) {
      // 如果初始化过程中出现错误，记录错误并抛出
      console.error(`插件 ${plugin.id} 注册失败:`, error);
      throw error;
    }
  }

  /**
   * 注销插件
   * @param pluginId 要注销的插件ID
   *
   * 注销流程：
   * 1. 获取插件实例
   * 2. 调用插件的destroy方法（如果存在）
   * 3. 从插件Map中删除该插件
   */
  unregisterPlugin(pluginId: string) {
    const plugin = this.plugins.get(pluginId);
    // 检查插件是否存在且有销毁方法
    if (plugin?.destroy) {
      try {
        // 调用插件的销毁方法
        plugin.destroy();
        // 从插件Map中移除该插件
        this.plugins.delete(pluginId);
      } catch (error) {
        console.error(`注销插件 ${pluginId} 失败:`, error);
      }
    }
  }

  /**
   * 获取指定ID的插件实例
   * @param pluginId 插件ID
   * @returns 插件实例或undefined（如果插件不存在）
   */
  getPlugin(pluginId: string) {
    return this.plugins.get(pluginId);
  }

  /**
   * 获取所有插件在指定扩展点的扩展内容
   * @param extensionPoint 扩展点名称（keyof Plugin表示必须是Plugin接口中定义的属性）
   * @returns 所有插件在该扩展点返回的内容数组
   *
   * 扩展获取流程：
   * 1. 遍历所有已注册的插件
   * 2. 对每个插件，检查是否实现了指定的扩展点
   * 3. 调用扩展点方法并收集返回结果
   */
  getExtensions(extensionPoint: keyof Plugin) {
    const extensions: any[] = [];

    // 遍历所有已注册的插件
    for (const plugin of this.plugins.values()) {
      // 获取插件在指定扩展点的实现
      const ext = plugin[extensionPoint];

      // 特殊处理initialize扩展点
      if (typeof ext === 'function' && extensionPoint === 'initialize') {
        console.log("跳过")
      }
      // 处理其他扩展点
      else if (typeof ext === 'function') {
        try {
          const result = ext();
          // 如果返回结果是数组，则添加到扩展列表中
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
