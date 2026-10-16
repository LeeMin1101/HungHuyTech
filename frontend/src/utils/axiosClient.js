import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:8081/api/v1',
    headers: {
        'Content-Type': 'application/json',
    }
});

// Interceptor 1: Tự động gắn Token vào Request trước khi gửi lên Server
axiosClient.interceptors.request.use(
    (config) => {
        // Phân loại: Nếu gọi API có chữ /admin thì dùng adminToken, ngược lại dùng accessToken
        const isAdminApi = config.url.includes('/admin');
        const token = isAdminApi ? localStorage.getItem('adminToken') : localStorage.getItem('accessToken');
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor 2: Bắt lỗi Response từ Server trả về
axiosClient.interceptors.response.use(
    (response) => {
        // Nếu Backend trả về body rỗng (VD: status 201 Created hoặc 204 No Content)
        // Trả về toàn bộ response để Frontend có thể lấy được response.status
        if (response.data === "" || response.data === undefined || response.data === null) {
            return response;
        }
        
        // Trả về thẳng data để code ngắn gọn đối với các API GET/POST có dữ liệu
        return response.data;
    },
    (error) => {
        if (error.response) {
            const originalRequest = error.config;

            // Nếu Token hết hạn hoặc sai mật khẩu (Lỗi 401 Unauthorized)
            if (error.response.status === 401) {
                
                // QUAN TRỌNG: Kiểm tra nếu API đang gọi KHÔNG PHẢI là API đăng nhập
                // Việc này giúp giữ lại thông báo lỗi màu đỏ khi nhập sai tài khoản, không bị F5 trang
                if (!originalRequest.url.includes('/login')) {
                    
                    const isAdminApi = originalRequest.url.includes('/admin');
                    
                    if (isAdminApi) {
                        localStorage.removeItem('adminToken');
                        localStorage.removeItem('adminInfo');
                        window.location.href = '/admin/login'; // Văng ra trang login của Admin
                    } else {
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('userInfo');
                        window.location.href = '/login'; // Văng ra trang login của User
                    }
                }
            }
        }
        return Promise.reject(error);
    }
);

export default axiosClient;