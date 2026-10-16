import { useState, useEffect } from 'react';
import { Ticket, Plus, Search, Calendar, Tag, CheckCircle, Clock, X, AlertCircle } from 'lucide-react';
import axiosClient from '../../utils/axiosClient';

const AdminPromotions = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // State form
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        discountType: 'PERCENTAGE', // PERCENTAGE, FIXED_AMOUNT
        discountValue: '',
        maxDiscountAmount: '',
        minOrderValue: '',
        usageLimit: '',
        isForStudent: false,
        startDate: '',
        endDate: '',
        isActive: true
    });

    const fetchPromotions = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get('/admin/promotions');
            setPromotions(res?.data?.data || res?.data || []);
        } catch (error) {
            console.error('Lỗi tải mã giảm giá:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromotions();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosClient.post('/admin/promotions', formData);
            alert('Tạo mã giảm giá thành công!');
            setIsModalOpen(false);
            fetchPromotions();
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi tạo khuyến mãi');
        }
    };

    const getStatusInfo = (startDate, endDate, isActive) => {
        if (!isActive) return { text: 'Đã tắt', style: 'bg-gray-100 text-gray-600' };
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (now < start) return { text: 'Sắp diễn ra', style: 'bg-blue-100 text-blue-700' };
        if (now > end) return { text: 'Đã hết hạn', style: 'bg-red-100 text-red-700' };
        return { text: 'Đang diễn ra', style: 'bg-emerald-100 text-emerald-700' };
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Khuyến mãi & Mã giảm giá</h1>
                    <p className="text-sm text-gray-500 mt-1">Quản lý các chương trình ưu đãi, coupon sinh viên và điều kiện áp dụng</p>
                </div>
                <button 
                    onClick={() => {
                        setFormData({ code: '', name: '', discountType: 'PERCENTAGE', discountValue: '', maxDiscountAmount: '', minOrderValue: '', usageLimit: '', isForStudent: false, startDate: '', endDate: '', isActive: true });
                        setIsModalOpen(true);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
                >
                    <Plus size={18} /> Tạo mã mới
                </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-slate-600 text-sm border-b border-gray-100">
                            <th className="p-4 font-semibold">Mã & Chương trình</th>
                            <th className="p-4 font-semibold">Mức giảm</th>
                            <th className="p-4 font-semibold">Điều kiện</th>
                            <th className="p-4 font-semibold text-center">Thời gian</th>
                            <th className="p-4 font-semibold text-center">Đã dùng</th>
                            <th className="p-4 font-semibold text-center">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {promotions.map((p) => {
                            const status = getStatusInfo(p.startDate, p.endDate, p.isActive);
                            return (
                                <tr key={p.id} className="hover:bg-slate-50">
                                    <td className="p-4">
                                        <div className="font-bold text-blue-600 flex items-center gap-2">
                                            <Ticket size={16}/> {p.code}
                                        </div>
                                        <div className="text-gray-800 font-medium mt-1">{p.name}</div>
                                        {p.isForStudent && <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded">Dành cho Sinh viên</span>}
                                    </td>
                                    <td className="p-4 font-bold text-red-600">
                                        {p.discountType === 'PERCENTAGE' ? `${p.discountValue}%` : `${new Intl.NumberFormat('vi-VN').format(p.discountValue)}đ`}
                                        {p.discountType === 'PERCENTAGE' && p.maxDiscountAmount && <div className="text-xs text-gray-500 font-normal mt-1">Tối đa: {new Intl.NumberFormat('vi-VN').format(p.maxDiscountAmount)}đ</div>}
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        Đơn tối thiểu: <span className="font-semibold text-gray-800">{new Intl.NumberFormat('vi-VN').format(p.minOrderValue || 0)}đ</span>
                                    </td>
                                    <td className="p-4 text-center text-xs text-gray-500 space-y-1">
                                        <div className="flex items-center justify-center gap-1"><Calendar size={12}/> {new Date(p.startDate).toLocaleDateString('vi-VN')}</div>
                                        <div>đến</div>
                                        <div className="flex items-center justify-center gap-1 text-gray-800 font-semibold"><Clock size={12}/> {new Date(p.endDate).toLocaleDateString('vi-VN')}</div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="font-bold text-gray-800">{p.usedCount || 0}</span> / {p.usageLimit || '∞'}
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2.5 py-1 rounded text-xs font-bold ${status.style}`}>{status.text}</span>
                                    </td>
                                </tr>
                            );
                        })}
                        {promotions.length === 0 && !loading && <tr><td colSpan="6" className="text-center py-12 text-gray-500">Chưa có chương trình khuyến mãi nào.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* Modal Tạo/Sửa mã giảm giá */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-5 flex justify-between items-center border-b border-gray-100 bg-slate-50">
                            <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2"><Tag size={20} className="text-blue-600"/> Tạo chương trình khuyến mãi</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500"><X size={20}/></button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã giảm giá (Code) *</label>
                                    <input required type="text" name="code" value={formData.code} onChange={handleChange} placeholder="VD: TET2026, SV50K..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none uppercase font-bold" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên chương trình *</label>
                                    <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Mô tả ngắn..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại giảm giá</label>
                                    <select name="discountType" value={formData.discountType} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none bg-white">
                                        <option value="PERCENTAGE">Giảm theo %</option>
                                        <option value="FIXED_AMOUNT">Giảm số tiền cố định</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mức giảm *</label>
                                    <input required type="number" name="discountValue" value={formData.discountValue} onChange={handleChange} placeholder={formData.discountType === 'PERCENTAGE' ? '% giảm' : 'VNĐ'} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none font-bold text-red-600" />
                                </div>
                                {formData.discountType === 'PERCENTAGE' && (
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Giới hạn mức giảm tối đa (VNĐ)</label>
                                        <input type="number" name="maxDiscountAmount" value={formData.maxDiscountAmount} onChange={handleChange} placeholder="Để trống nếu không giới hạn" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá trị đơn tối thiểu (VNĐ)</label>
                                    <input type="number" name="minOrderValue" value={formData.minOrderValue} onChange={handleChange} placeholder="VD: 500000" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Giới hạn số lượt dùng</label>
                                    <input type="number" name="usageLimit" value={formData.usageLimit} onChange={handleChange} placeholder="Để trống nếu không giới hạn" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian bắt đầu *</label>
                                    <input required type="datetime-local" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian kết thúc *</label>
                                    <input required type="datetime-local" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                                </div>
                            </div>

                            <label className="flex items-center gap-3 p-4 border border-purple-200 bg-purple-50 rounded-lg cursor-pointer">
                                <input type="checkbox" name="isForStudent" checked={formData.isForStudent} onChange={handleChange} className="w-5 h-5 text-purple-600 rounded" />
                                <div>
                                    <p className="font-bold text-purple-800 text-sm">Dành riêng cho Sinh viên</p>
                                    <p className="text-xs text-purple-600 mt-0.5">Yêu cầu tài khoản đã xác thực thẻ sinh viên hợp lệ</p>
                                </div>
                            </label>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">Hủy bỏ</button>
                                <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-md">Lưu chương trình</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPromotions;