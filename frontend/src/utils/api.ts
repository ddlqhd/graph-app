import axios from 'axios'

// 创建 axios 实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '', // 使用空字符串，让Vite代理处理
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加 token 等认证信息
    return config
  },
  (error) => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    // 统一处理响应数据
    return response.data
  },
  (error) => {
    console.error('API 请求错误:', error)

    // 处理不同的错误状态
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          console.error('未授权访问')
          break
        case 403:
          console.error('访问被禁止')
          break
        case 404:
          console.error('请求的资源不存在')
          break
        case 500:
          console.error('服务器内部错误')
          break
        case 503:
          console.error('服务不可用')
          break
        default:
          console.error(`请求错误 ${status}: ${data?.message || '未知错误'}`)
      }

      return Promise.reject(data || error.response)
    } else if (error.request) {
      console.error('网络错误，请检查网络连接')
      return Promise.reject({ message: '网络错误，请检查网络连接' })
    } else {
      console.error('请求配置错误:', error.message)
      return Promise.reject(error)
    }
  }
)

export default api