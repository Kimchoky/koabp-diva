import type { NextApiRequest, NextApiResponse } from 'next';
import { API_CONFIG, ApiResponse, ApiError } from '../../lib/api-config';

interface ProxyRequest extends NextApiRequest {
  query: {
    path: string;
  };
}

export default async function handler(
  req: ProxyRequest,
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
    const targetUrl = `${API_CONFIG.baseURL}/${Array.isArray(path) ? path.join('/') : path}`;

    const requestHeaders: HeadersInit = {
      ...API_CONFIG.headers,
      ...(headers.authorization && { Authorization: headers.authorization as string }),
    };

    const fetchOptions: RequestInit = {
      method,
      headers: requestHeaders,
      ...(body && method !== 'GET' && { body: JSON.stringify(body) }),
    };

    const response = await fetch(targetUrl, fetchOptions);
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
    res.status(500).json({
      message: 'Internal server error',
      status: 500,
      code: 'PROXY_ERROR'
    });
  }
}