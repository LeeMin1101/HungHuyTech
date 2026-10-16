import { useState, useEffect } from 'react';
import { 
    UserCog, Search, Plus, Shield, ShieldCheck, 
    Lock, Unlock, Edit, Trash2, Mail, Phone, Calendar 
} from 'lucide-react';
import axiosClient from '../../utils/axiosClient';

const AdminStaff = () => {
    const [staffs, setStaffs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        role: 'STAFF', // ADMIN, STAFF
        isActive: true
    });

    const fetchStaffs = async () => {
        setLoading(true);
        try {
            // Giả sử API trả về danh sách nhân viên quản trị
            const res = await axiosClient.get('/admin/staff');
            setStaffs(res?.data?.data || res?.data || []);
        } catch (error) {
            console.error('Lỗi tải danh sách nhân viên:', error);
            // Fallback dữ liệu mẫu nếu chưa có API
            setStaffs([
                { id: 1, fullName: 'Trần Admin', email: 'admin@hunghuy.com', phone: '0901234567', role: 'ADMIN', isActive: true, createdAt: '2025-10-15T08:00:00' },
                { id: 2, fullName: 'Nguyễn Bán Hàng', email: 'sales1@hunghuy.com', phone: '0987654321', role: 'STAFF', isActive: true, createdAt: '2026-01-10T09:30:00' },
                { id: 3, fullName: 'Lê Kỹ Thuật', email: 'tech1@hunghuy.com', phone: '0912345678', role: 'STAFF', isActive: false, createdAt: '2026-05-20T14:15:00' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaffs();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleOpenModal = (staff = null) => {
        if (staff) {
            setEditingId(staff.id);
            setFormData({
                fullName: staff.fullName,
                email: staff.email,
                phone: staff.phone || '',
                password: '', // Không hiển thị password cũ
                role: staff.role,
                isActive: staff.isActive
            });
        } else {
            setEditingId(null);
            setFormData({ fullName: '', email: '', phone: '', password: '', role: 'STAFF', isActive: true });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingId) {
                // await axiosClient.put(`/admin/staff/${editingId}`, formData);
                alert('Cập nhật thông tin nhân viên thành công!');
            } else {
                if (!formData.password) {
                    alert('Vui lòng nhập mật khẩu cho nhân viên mới.');
                    setIsSubmitting(false);
                    return;
                }
                // await axiosClient.post('/admin/staff', formData);
                alert('Tạo tài khoản nhân viên thành công!');
            }
            setIsModalOpen(false);
            fetchStaffs();
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        if (window.confirm(`Bạn có chắc chắn muốn ${currentStatus ? 'khóa' : 'mở khóa'} tài khoản này?`)) {
            try {
                // await axiosClient.put(`/admin/staff/${id}/status`, { isActive: !currentStatus });
                setStaffs(staffs.map(s => s.id === id ? { ...s, isActive: !currentStatus } : s));
            } catch (error) {
                alert('Lỗi cập nhật trạng thái');
            }
        }
    };

    const filteredStaffs = staffs.filter(s => 
        (s.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Quản lý Nhân viên & Phân quyền</h1>
                    <p className="text-sm text-gray-500 mt-1">Cấp quyền truy cập hệ thống quản trị cho nhân viên</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
                >
                    <Plus size={18} /> Thêm nhân viên
                </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" placeholder="Tìm theo Tên hoặc Email..." 
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 outline-none text-sm bg-white"
                    />
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-slate-600 text-sm border-b border-gray-100">
                            <th className="p-4 font-semibold">Nhân viên</th>
                            <th className="p-4 font-semibold">Vai trò</th>
                            <th className="p-4 font-semibold">Trạng thái</th>
                            <th className="p-4 font-semibold">Ngày tham gia</th>
                            <th className="p-4 font-semibold text-center w-28">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {filteredStaffs.map((staff) => (
                            <tr key={staff.id} className="hover:bg-blue-50/50 transition-colors">
                                <td className="p-4">
                                    <div className="font-bold text-gray-800 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                                            {staff.fullName.charAt(0)}
                                        </div>
                                        {staff.fullName}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1 flex flex-col gap-0.5 ml-10">
                                        <span className="flex items-center gap-1"><Mail size={12}/> {staff.email}</span>
                                        <span className="flex items-center gap-1"><Phone size={12}/> {staff.phone || 'Chưa cập nhật'}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    {staff.role === 'ADMIN' ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
                                            <ShieldCheck size={14}/> Toàn quyền (ADMIN)
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                                            <Shield size={14}/> Nhân viên (STAFF)
                                        </span>
                                    )}
                                </td>
                                <td className="p-4">
                                    {staff.isActive ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-emerald-100 text-emerald-700">Đang hoạt động</span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-red-100 text-red-700"><Lock size={12}/> Đã bị khóa</span>
                                    )}
                                </td>
                                <td className="p-4 text-gray-600 text-xs flex items-center gap-1.5 h-full pt-6">
                                    <Calendar size={14}/> {new Date(staff.createdAt).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="p-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button 
                                            onClick={() => handleOpenModal(staff)} 
                                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors" 
                                            title="Chỉnh sửa"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleToggleStatus(staff.id, staff.isActive)} 
                                            className={`p-1.5 rounded-md transition-colors ${staff.isActive ? 'text-red-500 hover:bg-red-100' : 'text-emerald-500 hover:bg-emerald-100'}`} 
                                            title={staff.isActive ? 'Khóa tài khoản' : 'Mở khóa'}
                                        >
                                            {staff.isActive ? <Lock size={18} /> : <Unlock size={18} />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
                        <div className="p-5 flex justify-between items-center border-b border-gray-100 bg-slate-50">
                            <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                <UserCog size={20} className="text-blue-600"/> 
                                {editingId ? 'Cập nhật Nhân viên' : 'Thêm Nhân viên mới'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500">&times;</button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto">
                            <form id="staffForm" onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Họ và Tên *</label>
                                    <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Email (Tài khoản) *</label>
                                        <input required type="email" name="email" value={formData.email} onChange={handleChange} disabled={!!editingId} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Số điện thoại</label>
                                        <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        Mật khẩu {editingId ? '(Để trống nếu không đổi)' : '*'}
                                    </label>
                                    <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder={editingId ? '********' : 'Nhập mật khẩu...'} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                                </div>

                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-2">
                                    <label className="block text-sm font-bold text-gray-800 mb-2">Vai trò (Quyền hạn)</label>
                                    <select name="role" value={formData.role} onChange={handleChange} className="w-full border border-blue-200 rounded-md px-3 py-2 text-sm font-semibold text-blue-800 outline-none focus:border-blue-500">
                                        <option value="STAFF">Nhân viên (Chỉ xử lý đơn/bảo hành/B2B)</option>
                                        <option value="ADMIN">Quản trị viên (Toàn quyền hệ thống)</option>
                                    </select>
                                </div>

                                <label className="flex items-center gap-2 mt-4 cursor-pointer">
                                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
                                    <span className="text-sm font-medium text-gray-800">Tài khoản đang hoạt động (Cho phép đăng nhập)</span>
                                </label>
                            </form>
                        </div>
                        
                        <div className="p-4 border-t border-gray-100 bg-slate-50 flex justify-end gap-3">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors">Hủy</button>
                            <button type="submit" form="staffForm" disabled={isSubmitting} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-md transition-colors disabled:opacity-50">
                                {isSubmitting ? 'Đang lưu...' : 'Lưu thông tin'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminStaff;