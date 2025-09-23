import type { NextApiRequest, NextApiResponse } from 'next';
import { API_CONFIG, ApiResponse, ApiError } from '../../lib/api-config';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse | ApiError>
) {
  const { path } = req.query;
  const { method, body, headers } = req;

  if (!path) {
    return res.status(400).json({
      message: 'Path parameter is required',
      status: 400,
      code: 'MISSING_PATH'
    });
  }

  try {
    const apiPath = Array.isArray(path) ? path.join('/') : path;
    const targetUrl = `${API_CONFIG.baseURL}/${apiPath}`;

    const requestHeaders: HeadersInit = {
      ...API_CONFIG.headers,
      ...(headers.authorization && { Authorization: headers.authorization as string }),
    };

    const fetchOptions: RequestInit = {
      method,
      headers: requestHeaders,
      ...(body && method !== 'GET' && { body: JSON.stringify(body) }),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    const response = await fetch(targetUrl, {
      ...fetchOptions,
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        message: data.message || 'Request failed',
        status: response.status,
        code: data.code
      });
    }

    res.status(200).json({
      data,
      success: true,
      message: data.message
    });
  } catch (error) {
    console.error('API Proxy Error:', error);

    if (error.name === 'AbortError') {
      return res.status(408).json({
        message: 'Request timeout',
        status: 408,
        code: 'TIMEOUT'
      });
    }

    res.status(500).json({
      message: 'Internal server error',
      status: 500,
      code: 'PROXY_ERROR'
    });
  }
}