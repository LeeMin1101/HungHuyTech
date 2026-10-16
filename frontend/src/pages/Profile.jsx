import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../utils/axiosClient';
import {
    Package, Clock, CheckCircle2, XCircle, ArrowLeft,
    Truck, User, ShieldCheck, Crown, Key, LogOut
} from 'lucide-react';

const Profile = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('orders'); // 'profile', 'orders', 'vip'
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    // State mặc định
    const [userInfo, setUserInfo] = useState({
        fullName: 'Khách hàng',
        email: 'Chưa cập nhật',
        phone: 'Chưa cập nhật',
        avatarUrl: null
    });

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('userInfo');

        if (!token) {
            navigate('/login');
            return;
        }

        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUserInfo(parsedUser);
            } catch (error) {
                console.error("Lỗi khi đọc dữ liệu User từ LocalStorage:", error);
                localStorage.removeItem('userInfo');
            }
        }
    }, [navigate]);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
            const response = await axiosClient.get('/orders/my-orders');
            const orderData = response?.data?.content || response?.data?.data?.content || [];
            setOrders(Array.isArray(orderData) ? orderData : []);
        } catch (error) {
            console.error("Lỗi khi tải lịch sử đơn hàng:", error);
        } finally {
            setLoadingOrders(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    const getStatusBadge = (status) => {
        switch (status?.toUpperCase()) {
            case 'PENDING':
                return <span className="bg-amber-50 text-amber-600 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Clock size={12} /> Chờ xác nhận</span>;
            case 'PROCESSING':
            case 'SHIPPING':
                return <span className="bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Truck size={12} /> Đang giao hàng</span>;
            case 'COMPLETED':
            case 'SUCCESS':
            case 'CONFIRMED':
            case 'DELIVERED':
                return <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle2 size={12} /> Hoàn thành</span>;
            case 'CANCELLED':
                return <span className="bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><XCircle size={12} /> Đã hủy</span>;
            default:
                return <span className="bg-gray-50 text-gray-600 border border-gray-200 px-3 py-1 rounded-full text-xs font-bold w-fit">{status || 'Chờ xử lý'}</span>;
        }
    };

    const vipStats = useMemo(() => {
        const totalSpent = orders.reduce((total, order) => {
            if (order.status?.toUpperCase() !== 'CANCELLED') {
                return total + (order.totalAmount || 0);
            }
            return total;
        }, 0);

        const TIERS = [
            { name: 'MEMBER', threshold: 0, nextThreshold: 5000000, nextName: 'SILVER', perks: 'Tích điểm cơ bản' },
            { name: 'SILVER', threshold: 5000000, nextThreshold: 20000000, nextName: 'GOLD', perks: 'Giảm 5% mọi đơn hàng' },
            { name: 'GOLD', threshold: 20000000, nextThreshold: 50000000, nextName: 'DIAMOND', perks: 'Giảm 10% + Miễn phí vận chuyển' },
            { name: 'DIAMOND', threshold: 50000000, nextThreshold: null, nextName: 'MAX', perks: 'Đặc quyền ưu tiên cao nhất' }
        ];

        let currentTier = TIERS[0];
        for (let i = TIERS.length - 1; i >= 0; i--) {
            if (totalSpent >= TIERS[i].threshold) {
                currentTier = TIERS[i];
                break;
            }
        }

        let remainingAmount = 0;
        let progressPercentage = 100;

        if (currentTier.nextThreshold !== null) {
            remainingAmount = currentTier.nextThreshold - totalSpent;
            const tierRange = currentTier.nextThreshold - currentTier.threshold;
            const spentInRange = totalSpent - currentTier.threshold;
            progressPercentage = Math.min((spentInRange / tierRange) * 100, 100);
        }

        return { totalSpent, currentTier, remainingAmount, progressPercentage };
    }, [orders]);

    return (
        <div className="bg-[#f8f9fa] min-h-screen py-8">
            <div className="max-w-6xl mx-auto px-4">
                <div className="mb-6">
                    <Link to="/" className="text-blue-600 flex items-center hover:underline font-medium text-sm w-fit">
                        <ArrowLeft size={16} className="mr-1" /> Về trang chủ
                    </Link>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* SIDEBAR TÀI KHOẢN */}
                    <div className="md:w-1/3 lg:w-1/4">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
                            <div className="p-6 text-center border-b border-gray-100 bg-gradient-to-b from-blue-50 to-white">
                                <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3 shadow-inner relative">
                                    {userInfo?.avatarUrl ? (
                                        <img 
                                            src={userInfo.avatarUrl} 
                                            alt="Avatar" 
                                            className="w-full h-full object-cover rounded-full"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                // Hiển thị ảnh Avatar mặc định tạo từ tên nếu link bị lỗi
                                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo?.fullName || 'User')}&background=0D8ABC&color=fff&size=128`;
                                            }}
                                        />
                                    ) : (
                                        <User size={40} className="text-blue-600" />
                                    )}
                                    <div className="absolute -bottom-2 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white flex items-center gap-1 shadow-sm">
                                        <Crown size={10} /> {vipStats.currentTier.name}
                                    </div>
                                </div>
                                <h2 className="font-bold text-gray-900 text-lg">{userInfo?.fullName || 'Khách hàng'}</h2>
                                <p className="text-sm text-gray-500">{userInfo?.email || 'Chưa có email'}</p>
                            </div>

                            <div className="p-3 space-y-1">
                                <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'profile' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                                    <ShieldCheck size={18} /> Thông tin cá nhân
                                </button>
                                <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'orders' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                                    <Package size={18} /> Lịch sử đơn hàng
                                </button>
                                <button onClick={() => setActiveTab('vip')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'vip' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                                    <Crown size={18} /> Hạng thành viên
                                </button>
                                <hr className="my-2 border-gray-100" />
                                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">
                                    <LogOut size={18} /> Đăng xuất
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* CONTENT AREA */}
                    <div className="md:w-2/3 lg:w-3/4">

                        {/* TAB: THÔNG TIN CÁ NHÂN */}
                        {activeTab === 'profile' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h1 className="text-xl font-black text-gray-900 mb-6 uppercase flex items-center gap-2">
                                    <ShieldCheck className="text-blue-600" /> Hồ sơ của tôi
                                </h1>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Họ và tên</label>
                                        <input type="text" value={userInfo?.fullName || ''} disabled className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-gray-50 text-gray-700" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Email</label>
                                        <input type="email" value={userInfo?.email || ''} disabled className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-gray-50 text-gray-700" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Số điện thoại</label>
                                        <input type="tel" value={userInfo?.phone || 'Chưa cập nhật'} disabled className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-gray-50 text-gray-700" />
                                    </div>
                                </div>

                                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-t border-gray-100 pt-6">
                                    <Key size={18} className="text-blue-600" /> Đổi mật khẩu
                                </h2>
                                <form className="max-w-md space-y-4">
                                    <div>
                                        <input type="password" placeholder="Mật khẩu hiện tại" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <input type="password" placeholder="Mật khẩu mới" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <input type="password" placeholder="Xác nhận mật khẩu mới" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500" />
                                    </div>
                                    <button type="button" className="bg-blue-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                                        Cập nhật mật khẩu
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* TAB: LỊCH SỬ ĐƠN HÀNG */}
                        {activeTab === 'orders' && (
                            <div className="space-y-4">
                                <h1 className="text-xl font-black text-gray-900 mb-6 uppercase flex items-center gap-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <Package className="text-blue-600" /> Đơn hàng đã đặt
                                </h1>

                                {loadingOrders ? (
                                    <div className="flex justify-center items-center h-32 bg-white rounded-xl shadow-sm">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Package size={32} />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-2">Chưa có đơn hàng nào</h3>
                                        <button onClick={() => navigate('/')} className="mt-4 bg-blue-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-blue-700 transition">Mua sắm ngay</button>
                                    </div>
                                ) : (
                                    orders.map((order) => (
                                        <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 mb-4 gap-2">
                                                <div>
                                                    <span className="text-xs text-gray-400 font-semibold uppercase">Mã đơn hàng: #{order.id || order.orderCode}</span>
                                                    <p className="text-xs text-gray-500 mt-0.5">Ngày: {new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                                                </div>
                                                <div>{getStatusBadge(order.status)}</div>
                                            </div>

                                            <div className="space-y-3 mb-4">
                                                {order.items?.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-4">
                                                        <div className="w-14 h-14 border border-gray-200 rounded-lg p-1 bg-gray-50 flex-shrink-0">
                                                            {/* Đã thêm link dự phòng placeholder và fallback onError */}
                                                            <img 
                                                                src={item.productImageUrl || item.imageUrl || 'https://placehold.co/150x150/f8f9fa/a1a1aa?text=No+Image'} 
                                                                alt={item.productName} 
                                                                className="w-full h-full object-contain"
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = 'https://placehold.co/150x150/f8f9fa/a1a1aa?text=No+Image';
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="text-sm font-bold text-gray-800 line-clamp-1">{item.productName}</h4>
                                                            <p className="text-xs text-gray-500">SL: x{item.quantity}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-sm font-bold text-red-600">{new Intl.NumberFormat('vi-VN').format(item.price || item.unitPrice || 0)}đ</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="border-t border-gray-100 pt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-sm">
                                                <div className="text-gray-600">
                                                    <p><strong className="text-gray-800">Người nhận:</strong> {order.recipientName || order.fullName}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5 max-w-sm truncate" title={order.shippingAddress || order.address}>{order.shippingAddress || order.address}</p>
                                                </div>
                                                <div className="text-right w-full md:w-auto">
                                                    <span className="text-xs text-gray-500 mr-2">Tổng thanh toán:</span>
                                                    <span className="text-xl font-black text-red-600">{new Intl.NumberFormat('vi-VN').format(order.totalAmount || order.total || 0)}đ</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* TAB: HẠNG THÀNH VIÊN */}
                        {activeTab === 'vip' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 py-16">
                                <div className="text-center mb-8">
                                    <Crown size={64} className="text-yellow-400 mx-auto mb-4" />
                                    <h2 className="text-2xl font-black text-gray-900 mb-2">
                                        Thành Viên Hạng {vipStats.currentTier.name}
                                    </h2>
                                    
                                    <div className="mt-4 inline-block bg-blue-50 border border-blue-100 px-6 py-3 rounded-xl text-left">
                                        <p className="text-sm text-gray-600 mb-1">Tổng chi tiêu tích lũy:</p>
                                        <p className="text-2xl font-black text-blue-700">
                                            {new Intl.NumberFormat('vi-VN').format(vipStats.totalSpent)}đ
                                        </p>
                                    </div>
                                    
                                    {vipStats.currentTier.nextThreshold !== null ? (
                                        <p className="text-gray-500 max-w-md mx-auto mt-6">
                                            Mua sắm thêm <strong className="text-blue-600">{new Intl.NumberFormat('vi-VN').format(vipStats.remainingAmount)}đ</strong> để thăng hạng <strong>{vipStats.currentTier.nextName}</strong> và nhận đặc quyền: <span className="italic">{vipStats.currentTier.perks}</span>
                                        </p>
                                    ) : (
                                        <p className="text-emerald-600 font-bold max-w-md mx-auto mt-6">
                                            Chúc mừng! Bạn đã đạt hạng cao nhất. Tận hưởng mọi đặc quyền VIP!
                                        </p>
                                    )}
                                </div>

                                {vipStats.currentTier.nextThreshold !== null && (
                                    <div className="max-w-md mx-auto">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                                            <div 
                                                className="bg-yellow-400 h-2.5 rounded-full transition-all duration-1000 ease-in-out" 
                                                style={{ width: `${vipStats.progressPercentage}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between text-xs font-bold text-gray-400">
                                            <span>{vipStats.currentTier.name}</span>
                                            <span>{vipStats.currentTier.nextName}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;