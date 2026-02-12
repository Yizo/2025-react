/**
 * 排除对象中为null, undefined的属性
 * @param obj 对象
 * @param deep 是否深度排除
 * @returns 排除后的对象
 */
export function cleanObject<T = Record<string, any>>(obj: T, deep: boolean = false): T {
  if (obj == null || typeof obj !== 'object') {
    return obj;
  }
  if (Object.prototype.toString.call(obj) !== '[object Object]') {
    return obj;
  }

  const result = {} as T;

  for (const [key, value] of Object.entries(obj)) {
    if (value != null) {
      result[key as keyof T] = deep ? cleanObject(value, deep) : value;
    }
  }

  return result;
}
