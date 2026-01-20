/**
 * 请求取消管理器
 */
class RequestCancelManager {
  private cancelTokens: Map<string, AbortController> = new Map();

  /**
   * 生成请求的唯一 key
   */
  private generateKey(url: string, method: string): string {
    return `${method?.toUpperCase()}_${url}`;
  }

  /**
   * 获取或创建 AbortController
   */
  getController(url: string, method: string = 'GET'): AbortController {
    const key = this.generateKey(url, method);
    if (!this.cancelTokens.has(key)) {
      this.cancelTokens.set(key, new AbortController());
    }
    return this.cancelTokens.get(key)!;
  }

  /**
   * 取消特定请求
   */
  cancel(url: string, method: string = 'GET'): void {
    const key = this.generateKey(url, method);
    const controller = this.cancelTokens.get(key);
    if (controller) {
      controller.abort();
      this.cancelTokens.delete(key);
    }
  }

  /**
   * 取消所有请求
   */
  cancelAll(): void {
    this.cancelTokens.forEach((controller) => controller.abort());
    this.cancelTokens.clear();
  }

  /**
   * 清除特定请求的 token
   */
  clear(url: string, method: string = 'GET'): void {
    const key = this.generateKey(url, method);
    this.cancelTokens.delete(key);
  }
}

export const requestCancelManager = new RequestCancelManager();
