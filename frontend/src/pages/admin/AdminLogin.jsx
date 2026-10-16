import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, User, ArrowRight } from 'lucide-react';
import axiosClient from '../../utils/axiosClient'; // Đảm bảo đường dẫn đúng

const AdminLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ identifier: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // BỔ SUNG: Tự động chuyển hướng nếu Admin đã đăng nhập từ trước
    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            navigate('/admin/dashboard');
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Gọi API dành riêng cho Admin
            const response = await axiosClient.post('/auth/admin/login', {
                email: formData.identifier,
                password: formData.password
            });

            // Lưu trữ token vào key riêng cho Admin
            const token = response.data?.data?.accessToken || response.data?.accessToken;
            localStorage.setItem('adminToken', token);
            localStorage.setItem('adminInfo', JSON.stringify(response.data?.data?.user || response.data?.user));

            // Chuyển hướng vào Dashboard
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Truy cập bị từ chối. Vui lòng kiểm tra lại tài khoản.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
                <div className="p-8">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20">
                            <ShieldAlert size={32} className="text-blue-400" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white text-center mb-2">Hệ thống Quản trị</h2>
                    <p className="text-slate-400 text-sm text-center mb-8">HungHuyTech Admin Portal</p>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm mb-6 text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-slate-300 text-sm font-medium mb-2">Tên đăng nhập / Email</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input 
                                    type="text" 
                                    required
                                    value={formData.identifier}
                                    onChange={(e) => setFormData({...formData, identifier: e.target.value})}
                                    className="w-full bg-[#0f172a] border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    placeholder="admin@hunghuy.net"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-slate-300 text-sm font-medium mb-2">Mật khẩu</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input 
                                    type="password" 
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    className="w-full bg-[#0f172a] border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? 'Đang xác thực...' : (
                                <>Đăng nhập hệ thống <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>
                </div>
                <div className="bg-[#0f172a] px-8 py-4 border-t border-slate-700 text-center">
                    <p className="text-xs text-slate-500">Khu vực hạn chế. Mọi hành vi truy cập trái phép sẽ bị ghi log.</p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;