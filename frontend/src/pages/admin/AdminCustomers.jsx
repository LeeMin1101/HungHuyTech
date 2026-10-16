import { useState, useEffect } from 'react';
import { 
    Users, Search, Lock, Unlock, Eye, ShoppingBag, 
    MapPin, Shield, Mail, Phone, Briefcase, GraduationCap, 
    User, Filter, X, Calendar, CheckCircle
} from 'lucide-react';
import axiosClient from '../../utils/axiosClient';

const AdminCustomers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State tìm kiếm và lọc
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL'); // ALL, PERSONAL, STUDENT, BUSINESS
    const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, ACTIVE, LOCKED

    // State Modal Chi tiết khách hàng
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerDetails, setCustomerDetails] = useState(null);
    const [activeTab, setActiveTab] = useState('info'); // 'info', 'orders', 'warranty'
    const [loadingDetails, setLoadingDetails] = useState(false);

    // Lấy danh sách khách hàng từ Backend
    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get('/admin/users');
            const data = res?.data?.content || res?.data?.data || res?.data || [];
            // Giả định sắp xếp khách hàng mới nhất lên đầu
            const sortedData = Array.isArray(data) ? data.sort((a, b) => b.id - a.id) : [];
            setCustomers(sortedData);
        } catch (error) {
            console.error('Lỗi tải danh sách khách hàng:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    // Helper: Style và Text cho Loại khách hàng
    const getCustomerTypeInfo = (type) => {
        switch (type) {
            case 'STUDENT': return { icon: <GraduationCap size={14}/>, text: 'Sinh viên', style: 'bg-blue-100 text-blue-700 border-blue-200' };
            case 'BUSINESS': return { icon: <Briefcase size={14}/>, text: 'Doanh nghiệp', style: 'bg-purple-100 text-purple-700 border-purple-200' };
            default: return { icon: <User size={14}/>, text: 'Cá nhân', style: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
        }
    };

    // Lọc dữ liệu
    const filteredCustomers = customers.filter(c => {
        const matchSearch = (c.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (c.phone || '').includes(searchTerm);
        const matchType = filterType === 'ALL' || c.customerType === filterType;
        const matchStatus = filterStatus === 'ALL' || c.status === filterStatus;
        return matchSearch && matchType && matchStatus;
    });

    // Mở Modal và tải chi tiết khách hàng (Lịch sử đơn, bảo hành)
    const handleViewDetail = async (customer) => {
        setSelectedCustomer(customer);
        setIsModalOpen(true);
        setActiveTab('info');
        setLoadingDetails(true);
        try {
            const res = await axiosClient.get(`/admin/users/${customer.id}/details`);
            setCustomerDetails(res?.data?.data || res?.data);
        } catch (error) {
            console.error('Lỗi tải chi tiết khách hàng:', error);
            // Fallback hiển thị rỗng nếu chưa có API
            setCustomerDetails({ orders: [], warranties: [], addresses: [] });
        } finally {
            setLoadingDetails(false);
        }
    };

    // Xóa/Khóa/Mở khóa tài khoản
    const handleToggleStatus = async (customerId, currentStatus) => {
        const newStatus = currentStatus === 'LOCKED' ? 'ACTIVE' : 'LOCKED';
        const actionText = currentStatus === 'LOCKED' ? 'MỞ KHÓA' : 'KHÓA';
        
        if (!window.confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản này?`)) return;

        try {
            await axiosClient.put(`/admin/users/${customerId}/status`, { status: newStatus });
            alert(`${actionText} tài khoản thành công!`);
            
            // Cập nhật state cục bộ
            setCustomers(customers.map(c => c.id === customerId ? { ...c, status: newStatus } : c));
            if (selectedCustomer?.id === customerId) {
                setSelectedCustomer({ ...selectedCustomer, status: newStatus });
            }
        } catch (error) {
            alert(error.response?.data?.message || `Lỗi khi ${actionText.toLowerCase()} tài khoản.`);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div></div>;

    // Thống kê nhanh
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.status !== 'LOCKED').length;
    const lockedCustomers = totalCustomers - activeCustomers;
    const businessCount = customers.filter(c => c.customerType === 'BUSINESS').length;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6 relative">
            {/* Header & Thống kê */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Quản lý Khách hàng</h1>
                    <p className="text-sm text-gray-500 mt-1">Quản lý hồ sơ, phân loại và lịch sử giao dịch của người dùng</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100 flex items-center gap-3">
                        <Users className="text-emerald-600" size={20}/>
                        <div><p className="text-xs text-emerald-600 font-semibold uppercase">Hoạt động</p><p className="font-bold text-gray-800">{activeCustomers}</p></div>
                    </div>
                    <div className="bg-red-50 px-4 py-2 rounded-lg border border-red-100 flex items-center gap-3">
                        <Lock className="text-red-600" size={20}/>
                        <div><p className="text-xs text-red-600 font-semibold uppercase">Đã khóa</p><p className="font-bold text-gray-800">{lockedCustomers}</p></div>
                    </div>
                </div>
            </div>

            {/* Bộ lọc */}
            <div className="flex flex-col md:flex-row gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" placeholder="Tìm kiếm theo Tên, Email, Số điện thoại..." 
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 outline-none text-sm bg-white"
                    />
                </div>
                <div className="flex gap-2 shrink-0">
                    <div className="relative flex items-center bg-white border border-gray-200 rounded-lg px-3">
                        <Filter size={16} className="text-gray-400 mr-2"/>
                        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="py-2 text-sm outline-none bg-transparent text-gray-700 font-medium cursor-pointer">
                            <option value="ALL">Tất cả phân loại</option>
                            <option value="PERSONAL">Khách cá nhân</option>
                            <option value="STUDENT">Sinh viên</option>
                            <option value="BUSINESS">Doanh nghiệp (B2B)</option>
                        </select>
                    </div>
                    <div className="relative flex items-center bg-white border border-gray-200 rounded-lg px-3">
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="py-2 text-sm outline-none bg-transparent text-gray-700 font-medium cursor-pointer">
                            <option value="ALL">Tất cả trạng thái</option>
                            <option value="ACTIVE">Đang hoạt động</option>
                            <option value="LOCKED">Đã khóa</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Bảng Danh sách */}
            <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-slate-600 text-sm border-b border-gray-100">
                            <th className="p-4 font-semibold">Khách hàng</th>
                            <th className="p-4 font-semibold">Liên hệ</th>
                            <th className="p-4 font-semibold text-center">Phân loại</th>
                            <th className="p-4 font-semibold text-right">Lịch sử mua</th>
                            <th className="p-4 font-semibold text-center">Trạng thái</th>
                            <th className="p-4 font-semibold text-center w-28">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {filteredCustomers.map((c) => {
                            const typeInfo = getCustomerTypeInfo(c.customerType);
                            const isLocked = c.status === 'LOCKED';

                            return (
                                <tr key={c.id} className={`transition-colors ${isLocked ? 'bg-red-50/30' : 'hover:bg-blue-50/50'}`}>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">
                                                {c.avatarUrl ? <img src={c.avatarUrl} className="w-full h-full rounded-full object-cover"/> : (c.fullName?.charAt(0) || 'U')}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-800">{c.fullName || 'Chưa cập nhật'}</div>
                                                <div className="text-gray-500 text-xs mt-0.5">{c.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-600 font-medium">{c.phone || 'N/A'}</td>
                                    <td className="p-4 text-center">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${typeInfo.style}`}>
                                            {typeInfo.icon} {typeInfo.text}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="font-bold text-gray-800">{c.totalOrders || 0} đơn</div>
                                        <div className="text-red-600 font-bold text-xs mt-0.5">{new Intl.NumberFormat('vi-VN').format(c.totalSpent || 0)}đ</div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2.5 py-1 rounded text-xs font-bold ${isLocked ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                            {isLocked ? 'Đã khóa' : 'Hoạt động'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => handleViewDetail(c)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors" title="Xem hồ sơ">
                                                <Eye size={18} />
                                            </button>
                                            <button onClick={() => handleToggleStatus(c.id, c.status)} className={`p-1.5 rounded-md transition-colors ${isLocked ? 'text-emerald-600 hover:bg-emerald-100' : 'text-red-600 hover:bg-red-100'}`} title={isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}>
                                                {isLocked ? <Unlock size={18}/> : <Lock size={18}/>}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredCustomers.length === 0 && <tr><td colSpan="6" className="text-center py-12 text-gray-500">Không tìm thấy khách hàng nào.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* MODAL HỒ SƠ KHÁCH HÀNG */}
            {isModalOpen && selectedCustomer && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
                        
                        {/* Header Modal */}
                        <div className="flex justify-between items-start p-6 border-b border-gray-100 bg-slate-50 shrink-0">
                            <div className="flex gap-4 items-center">
                                <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-2xl border-2 border-white shadow-sm">
                                    {selectedCustomer.avatarUrl ? <img src={selectedCustomer.avatarUrl} className="w-full h-full rounded-full object-cover"/> : (selectedCustomer.fullName?.charAt(0) || 'U')}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                                        {selectedCustomer.fullName || 'Chưa cập nhật'}
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold border ${selectedCustomer.status === 'LOCKED' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}`}>
                                            {selectedCustomer.status === 'LOCKED' ? 'Đã khóa' : 'Hoạt động'}
                                        </span>
                                    </h2>
                                    <div className="flex gap-4 mt-2 text-sm text-gray-600 font-medium">
                                        <span className="flex items-center gap-1.5"><Mail size={14} className="text-gray-400"/> {selectedCustomer.email}</span>
                                        <span className="flex items-center gap-1.5"><Phone size={14} className="text-gray-400"/> {selectedCustomer.phone || 'Chưa cập nhật'}</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 bg-white p-1 rounded-md shadow-sm"><X size={24}/></button>
                        </div>

                        {/* Tabs Điều hướng */}
                        <div className="flex border-b border-gray-200 px-6 bg-slate-50">
                            <button onClick={() => setActiveTab('info')} className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'info' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}><User size={16}/> Hồ sơ & Liên hệ</button>
                            <button onClick={() => setActiveTab('orders')} className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'orders' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}><ShoppingBag size={16}/> Lịch sử mua hàng</button>
                            <button onClick={() => setActiveTab('warranty')} className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'warranty' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}><Shield size={16}/> Bảo hành & Hỗ trợ</button>
                        </div>

                        {/* Nội dung Tabs */}
                        <div className="p-6 flex-1 overflow-y-auto bg-white">
                            {loadingDetails ? (
                                <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div></div>
                            ) : (
                                <>
                                    {/* TAB 1: THÔNG TIN */}
                                    {activeTab === 'info' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <h3 className="font-bold text-gray-800 border-b pb-2">Thông tin tài khoản</h3>
                                                <div className="bg-gray-50 p-4 rounded-xl space-y-3 text-sm">
                                                    <p className="flex justify-between"><span className="text-gray-500">Phân loại:</span> <span className="font-bold text-gray-800">{getCustomerTypeInfo(selectedCustomer.customerType).text}</span></p>
                                                    <p className="flex justify-between"><span className="text-gray-500">Ngày tham gia:</span> <span className="font-semibold text-gray-800">{selectedCustomer.createdAt ? new Date(selectedCustomer.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</span></p>
                                                    <p className="flex justify-between"><span className="text-gray-500">Tổng chi tiêu:</span> <span className="font-bold text-red-600">{new Intl.NumberFormat('vi-VN').format(selectedCustomer.totalSpent || 0)}đ</span></p>
                                                    <p className="flex justify-between"><span className="text-gray-500">Tổng số đơn:</span> <span className="font-bold text-gray-800">{selectedCustomer.totalOrders || 0} đơn</span></p>
                                                </div>
                                                
                                                {/* Button Khóa trực tiếp trong modal */}
                                                <button onClick={() => handleToggleStatus(selectedCustomer.id, selectedCustomer.status)} className={`w-full py-2.5 rounded-lg font-bold text-sm flex justify-center items-center gap-2 border transition-colors ${selectedCustomer.status === 'LOCKED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'}`}>
                                                    {selectedCustomer.status === 'LOCKED' ? <><Unlock size={16}/> Mở khóa tài khoản này</> : <><Lock size={16}/> Khóa tài khoản này</>}
                                                </button>
                                            </div>
                                            
                                            <div>
                                                <h3 className="font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2"><MapPin size={16} className="text-blue-600"/> Sổ địa chỉ giao hàng</h3>
                                                <div className="space-y-3">
                                                    {customerDetails?.addresses?.length > 0 ? customerDetails.addresses.map((addr, idx) => (
                                                        <div key={idx} className="border border-gray-100 rounded-lg p-3 bg-white shadow-sm relative">
                                                            {addr.isDefault && <span className="absolute top-3 right-3 text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Mặc định</span>}
                                                            <p className="font-bold text-gray-800 text-sm">{addr.receiverName} <span className="font-normal text-gray-500">| {addr.receiverPhone}</span></p>
                                                            <p className="text-gray-600 text-sm mt-1">{addr.street}, {addr.ward}, {addr.district}, {addr.city}</p>
                                                        </div>
                                                    )) : (
                                                        <p className="text-gray-500 text-sm italic">Chưa có địa chỉ giao hàng nào được lưu.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* TAB 2: LỊCH SỬ ĐƠN HÀNG */}
                                    {activeTab === 'orders' && (
                                        <div className="border border-gray-100 rounded-lg overflow-hidden">
                                            <table className="w-full text-left">
                                                <thead className="bg-slate-50 text-gray-600 text-sm">
                                                    <tr>
                                                        <th className="p-3 font-semibold">Mã ĐH</th>
                                                        <th className="p-3 font-semibold">Ngày đặt</th>
                                                        <th className="p-3 font-semibold text-right">Tổng tiền</th>
                                                        <th className="p-3 font-semibold text-center">Trạng thái</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 text-sm">
                                                    {customerDetails?.orders?.length > 0 ? customerDetails.orders.map((o, idx) => (
                                                        <tr key={idx} className="hover:bg-slate-50">
                                                            <td className="p-3 font-bold text-blue-600">{o.orderCode}</td>
                                                            <td className="p-3 text-gray-600">{new Date(o.createdAt).toLocaleDateString('vi-VN')}</td>
                                                            <td className="p-3 font-bold text-red-600 text-right">{new Intl.NumberFormat('vi-VN').format(o.totalAmount)}đ</td>
                                                            <td className="p-3 text-center">
                                                                <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700">{o.status}</span>
                                                            </td>
                                                        </tr>
                                                    )) : <tr><td colSpan="4" className="p-6 text-center text-gray-500">Chưa có lịch sử mua hàng.</td></tr>}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* TAB 3: BẢO HÀNH & HỖ TRỢ */}
                                    {activeTab === 'warranty' && (
                                        <div className="border border-gray-100 rounded-lg overflow-hidden">
                                            <table className="w-full text-left">
                                                <thead className="bg-slate-50 text-gray-600 text-sm">
                                                    <tr>
                                                        <th className="p-3 font-semibold w-24">Mã YC</th>
                                                        <th className="p-3 font-semibold">Sản phẩm / Serial</th>
                                                        <th className="p-3 font-semibold">Vấn đề</th>
                                                        <th className="p-3 font-semibold">Ngày tạo</th>
                                                        <th className="p-3 font-semibold text-center">Trạng thái</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 text-sm">
                                                    {customerDetails?.warranties?.length > 0 ? customerDetails.warranties.map((w, idx) => (
                                                        <tr key={idx} className="hover:bg-slate-50">
                                                            <td className="p-3 font-bold text-gray-700">#{w.ticketCode}</td>
                                                            <td className="p-3">
                                                                <p className="font-semibold">{w.productName}</p>
                                                                <p className="text-xs text-gray-500">SN: {w.serialNumber}</p>
                                                            </td>
                                                            <td className="p-3 text-gray-600">{w.issueDescription}</td>
                                                            <td className="p-3 text-gray-500 text-xs">{new Date(w.createdAt).toLocaleDateString('vi-VN')}</td>
                                                            <td className="p-3 text-center">
                                                                <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">{w.status}</span>
                                                            </td>
                                                        </tr>
                                                    )) : <tr><td colSpan="5" className="p-6 text-center text-gray-500">Không có yêu cầu bảo hành/hỗ trợ nào.</td></tr>}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminCustomers;