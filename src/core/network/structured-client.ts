import { requestJson } from './api-client';
import { cleanStructuredText } from '../utils/plainText';

export async function requestStructuredJson<T>(url: string, options?: RequestInit): Promise<T> {
  return cleanStructuredText(await requestJson<T>(url, options));
}
