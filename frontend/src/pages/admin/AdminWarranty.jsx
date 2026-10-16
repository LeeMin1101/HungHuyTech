import { useState, useEffect } from 'react';
import { 
    ShieldCheck, Search, Filter, Wrench, FileText, CheckCircle, 
    XCircle, Clock, Eye, AlertTriangle, X 
} from 'lucide-react';
import axiosClient from '../../utils/axiosClient';

const AdminWarranty = () => {
    const [warranties, setWarranties] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Tìm kiếm và Lọc
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL'); // PENDING, PROCESSING, REPAIRED, COMPLETED, REJECTED

    // Modal chi tiết
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [techNote, setTechNote] = useState('');
    const [updateStatus, setUpdateStatus] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchWarranties = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get('/admin/warranties');
            setWarranties(res?.data?.data || res?.data?.content || res?.data || []);
        } catch (error) {
            console.error('Lỗi tải danh sách bảo hành:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWarranties();
    }, []);

    const filteredWarranties = warranties.filter(w => {
        const matchSearch = (w.ticketCode || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (w.serialNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (w.customerPhone || '').includes(searchTerm);
        const matchStatus = filterStatus === 'ALL' || w.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const getStatusInfo = (status) => {
        switch (status) {
            case 'PENDING': return { text: 'Mới tiếp nhận', style: 'bg-orange-100 text-orange-700 border-orange-200' };
            case 'PROCESSING': return { text: 'Đang kiểm tra/Sửa chữa', style: 'bg-blue-100 text-blue-700 border-blue-200' };
            case 'REPAIRED': return { text: 'Đã sửa xong', style: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
            case 'COMPLETED': return { text: 'Đã trả khách', style: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
            case 'REJECTED': return { text: 'Từ chối bảo hành', style: 'bg-red-100 text-red-700 border-red-200' };
            default: return { text: 'Không xác định', style: 'bg-gray-100 text-gray-700 border-gray-200' };
        }
    };

    const handleViewDetail = (ticket) => {
        setSelectedTicket(ticket);
        setUpdateStatus(ticket.status);
        setTechNote(ticket.technicianNote || '');
        setIsModalOpen(true);
    };

    const handleUpdateTicket = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            await axiosClient.put(`/admin/warranties/${selectedTicket.id}`, {
                status: updateStatus,
                technicianNote: techNote
            });
            alert('Cập nhật phiếu bảo hành thành công!');
            setIsModalOpen(false);
            fetchWarranties();
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.');
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div></div>;

    const pendingCount = warranties.filter(w => w.status === 'PENDING').length;
    const processingCount = warranties.filter(w => w.status === 'PROCESSING').length;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6 relative">
            {/* Header & Thống kê */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Quản lý Bảo hành & Hỗ trợ</h1>
                    <p className="text-sm text-gray-500 mt-1">Theo dõi serial, tiếp nhận yêu cầu và cập nhật tiến độ kỹ thuật</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-orange-50 px-4 py-2 rounded-lg border border-orange-100 flex items-center gap-3">
                        <Clock className="text-orange-600" size={20}/>
                        <div><p className="text-xs text-orange-600 font-semibold uppercase">Chờ xử lý</p><p className="font-bold text-gray-800">{pendingCount}</p></div>
                    </div>
                    <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 flex items-center gap-3">
                        <Wrench className="text-blue-600" size={20}/>
                        <div><p className="text-xs text-blue-600 font-semibold uppercase">Đang sửa chữa</p><p className="font-bold text-gray-800">{processingCount}</p></div>
                    </div>
                </div>
            </div>

            {/* Bộ lọc */}
            <div className="flex flex-col md:flex-row gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" placeholder="Tìm theo Mã YC, Serial Number hoặc SĐT khách hàng..." 
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 outline-none text-sm bg-white"
                    />
                </div>
                <div className="relative flex items-center bg-white border border-gray-200 rounded-lg px-3 shrink-0">
                    <Filter size={16} className="text-gray-400 mr-2"/>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="py-2 text-sm outline-none bg-transparent text-gray-700 font-medium cursor-pointer">
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="PENDING">Mới tiếp nhận</option>
                        <option value="PROCESSING">Đang kiểm tra/Sửa chữa</option>
                        <option value="REPAIRED">Đã sửa xong</option>
                        <option value="COMPLETED">Đã trả khách</option>
                        <option value="REJECTED">Từ chối bảo hành</option>
                    </select>
                </div>
            </div>

            {/* Bảng dữ liệu */}
            <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-slate-600 text-sm border-b border-gray-100">
                            <th className="p-4 font-semibold w-28">Mã YC</th>
                            <th className="p-4 font-semibold">Sản phẩm & Serial</th>
                            <th className="p-4 font-semibold">Khách hàng</th>
                            <th className="p-4 font-semibold text-center">Ngày hết hạn BH</th>
                            <th className="p-4 font-semibold text-center">Trạng thái</th>
                            <th className="p-4 font-semibold text-center w-24">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {filteredWarranties.map((w) => {
                            const statusInfo = getStatusInfo(w.status);
                            const isExpired = new Date(w.warrantyEndDate) < new Date();
                            
                            return (
                                <tr key={w.id} className="hover:bg-blue-50/50 transition-colors">
                                    <td className="p-4 font-bold text-gray-800">#{w.ticketCode}</td>
                                    <td className="p-4">
                                        <div className="font-semibold text-gray-800 line-clamp-1">{w.productName}</div>
                                        <div className="text-xs text-blue-600 mt-0.5 font-mono">SN: {w.serialNumber}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-gray-800">{w.customerName}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">{w.customerPhone}</div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`font-semibold ${isExpired ? 'text-red-600' : 'text-emerald-600'}`}>
                                            {new Date(w.warrantyEndDate).toLocaleDateString('vi-VN')}
                                        </span>
                                        {isExpired && <p className="text-[10px] text-red-500 uppercase font-bold mt-1">Đã hết hạn BH</p>}
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2.5 py-1 rounded text-xs font-bold border ${statusInfo.style}`}>
                                            {statusInfo.text}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button onClick={() => handleViewDetail(w)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors" title="Xử lý / Chi tiết">
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredWarranties.length === 0 && <tr><td colSpan="6" className="text-center py-12 text-gray-500">Không tìm thấy yêu cầu bảo hành nào.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* Modal Xử lý Bảo hành */}
            {isModalOpen && selectedTicket && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-5 flex justify-between items-center border-b border-gray-100 bg-slate-50">
                            <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2"><ShieldCheck size={20} className="text-blue-600"/> Cập nhật Phiếu bảo hành #{selectedTicket.ticketCode}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500"><X size={20}/></button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1">
                            {/* Thông tin sản phẩm & Khách hàng */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sản phẩm</h4>
                                    <p className="font-bold text-sm text-gray-800">{selectedTicket.productName}</p>
                                    <p className="text-sm"><span className="text-gray-500">Serial:</span> <span className="font-mono font-semibold">{selectedTicket.serialNumber}</span></p>
                                    <p className="text-sm"><span className="text-gray-500">Hết hạn BH:</span> <span className={`font-bold ${new Date(selectedTicket.warrantyEndDate) < new Date() ? 'text-red-600' : 'text-emerald-600'}`}>{new Date(selectedTicket.warrantyEndDate).toLocaleDateString('vi-VN')}</span></p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Khách hàng & Vấn đề</h4>
                                    <p className="font-bold text-sm text-gray-800">{selectedTicket.customerName} - {selectedTicket.customerPhone}</p>
                                    <div className="mt-2 p-2 bg-orange-50 border border-orange-100 rounded text-sm text-orange-800">
                                        <span className="font-bold">Khách báo lỗi:</span> {selectedTicket.issueDescription}
                                    </div>
                                </div>
                            </div>

                            {/* Form cập nhật trạng thái */}
                            <form onSubmit={handleUpdateTicket} className="space-y-4">
                                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                    <label className="block text-sm font-bold text-gray-800 mb-2">Cập nhật Trạng thái xử lý *</label>
                                    <select 
                                        value={updateStatus} onChange={(e) => setUpdateStatus(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none bg-white font-medium"
                                    >
                                        <option value="PENDING">Mới tiếp nhận (Chờ kỹ thuật kiểm tra)</option>
                                        <option value="PROCESSING">Đang kiểm tra / Sửa chữa</option>
                                        <option value="REPAIRED">Đã sửa xong (Chờ trả khách)</option>
                                        <option value="COMPLETED">Đã trả khách (Hoàn tất)</option>
                                        <option value="REJECTED">Từ chối bảo hành (Hết BH, lỗi người dùng...)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2"><FileText size={16} className="text-gray-500"/> Ghi chú của Kỹ thuật viên</label>
                                    <textarea 
                                        rows="4" 
                                        value={techNote} onChange={(e) => setTechNote(e.target.value)}
                                        placeholder="Ghi nhận tình trạng thực tế, linh kiện thay thế, chi phí phát sinh (nếu có)..."
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none resize-none"
                                    ></textarea>
                                    <p className="text-xs text-gray-500 mt-1">Khách hàng có thể xem được nội dung này khi tra cứu trực tuyến.</p>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 mt-4">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">Đóng</button>
                                    <button type="submit" disabled={isUpdating} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-md disabled:opacity-50">
                                        {isUpdating ? 'Đang lưu...' : 'Lưu cập nhật'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminWarranty;