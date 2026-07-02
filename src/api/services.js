import api from './client';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  getMe:    ()     => api.get('/auth/me'),
};

export const productService = {
  getAll:           (params)   => api.get('/products', { params }),
  getById:          (id)       => api.get(`/products/${id}`),
  getImage:         (filename) => `/api/products/image/${filename}`,
  getOwnerInventory:()         => api.get('/products/owner/inventory'),
  create:           (formData) => api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/products/${id}`),
};

export const orderService = {
  placeOrder:    (data)     => api.post('/orders', data),
  validateCoupon:(data)     => api.post('/orders/validate-coupon', data),
  getMyOrders:   ()         => api.get('/orders/my-orders'),
  getOrderById:  (id)       => api.get(`/orders/${id}`),
  getAllOrders:   ()         => api.get('/orders/admin/all'),
  updateStatus:  (id, data) => api.patch(`/orders/admin/${id}/status`, data),
};