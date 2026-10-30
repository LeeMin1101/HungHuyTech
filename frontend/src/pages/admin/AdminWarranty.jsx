import { useState, useEffect } from 'react';
import { 
    ShieldCheck, Search, Filter, Wrench, FileText, CheckCircle, 
    Clock, Eye, AlertTriangle, X, Image as ImageIcon, Calendar, Plus 
} from 'lucide-react';
import axiosClient from '../../utils/axiosClient';

const AdminWarranty = () => {
    const [warranties, setWarranties] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Tìm kiếm và Lọc
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    // State cho Modal Cập nhật
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [techNote, setTechNote] = useState('');
    const [updateStatus, setUpdateStatus] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    // State cho Modal Tạo mới
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newTicket, setNewTicket] = useState({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        productName: '',
        serialNumber: '',
        issueDescription: ''
    });

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
            case 'PROCESSING': return { text: 'Đang kiểm tra/Sửa', style: 'bg-blue-100 text-blue-700 border-blue-200' };
            case 'REPAIRED': return { text: 'Đã sửa xong', style: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
            case 'COMPLETED': return { text: 'Đã trả khách', style: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
            case 'REJECTED': return { text: 'Từ chối bảo hành', style: 'bg-red-100 text-red-700 border-red-200' };
            default: return { text: 'Không xác định', style: 'bg-gray-100 text-gray-700 border-gray-200' };
        }
    };

    // Xử lý mở modal cập nhật
    const handleViewDetail = (ticket) => {
        setSelectedTicket(ticket);
        setUpdateStatus(ticket.status);
        setTechNote(ticket.technicianNote || '');
        setIsUpdateModalOpen(true);
    };

    // Submit cập nhật
    const handleUpdateTicket = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            await axiosClient.put(`/admin/warranties/${selectedTicket.id}`, {
                status: updateStatus,
                technicianNote: techNote
            });
            alert('Cập nhật phiếu bảo hành thành công!');
            setIsUpdateModalOpen(false);
            fetchWarranties();
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.');
        } finally {
            setIsUpdating(false);
        }
    };

    // Submit tạo mới
    const handleCreateTicket = async (e) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            await axiosClient.post('/admin/warranties', newTicket);
            alert('Tạo yêu cầu bảo hành thành công!');
            setIsCreateModalOpen(false);
            // Reset form
            setNewTicket({ customerName: '', customerPhone: '', customerEmail: '', productName: '', serialNumber: '', issueDescription: '' });
            fetchWarranties();
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi tạo phiếu.');
        } finally {
            setIsCreating(false);
        }
    };

    const handleNewTicketChange = (e) => {
        const { name, value } = e.target;
        setNewTicket(prev => ({ ...prev, [name]: value }));
    };

    if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div></div>;

    const pendingCount = warranties.filter(w => w.status === 'PENDING').length;
    const processingCount = warranties.filter(w => w.status === 'PROCESSING').length;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6 relative">
            {/* Header & Thống kê */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Quản lý Yêu cầu Bảo hành</h1>
                    <p className="text-sm text-gray-500 mt-1">Đồng bộ dữ liệu khách hàng & Cập nhật tiến độ sửa chữa</p>
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="bg-orange-50 px-4 py-2 rounded-lg border border-orange-100 flex items-center gap-3 hidden sm:flex">
                        <Clock className="text-orange-600" size={20}/>
                        <div><p className="text-xs text-orange-600 font-semibold uppercase">Chờ xử lý</p><p className="font-bold text-gray-800">{pendingCount}</p></div>
                    </div>
                    <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 flex items-center gap-3 hidden sm:flex">
                        <Wrench className="text-blue-600" size={20}/>
                        <div><p className="text-xs text-blue-600 font-semibold uppercase">Đang sửa chữa</p><p className="font-bold text-gray-800">{processingCount}</p></div>
                    </div>
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-md shadow-blue-200 flex items-center gap-2 transition-colors"
                    >
                        <Plus size={18} /> Tạo đơn mới
                    </button>
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
                            <th className="p-4 font-semibold text-center">Ngày yêu cầu</th>
                            <th className="p-4 font-semibold text-center">Trạng thái</th>
                            <th className="p-4 font-semibold text-center w-24">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {filteredWarranties.map((w) => {
                            const statusInfo = getStatusInfo(w.status);
                            
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
                                        <div className="font-medium text-gray-800">
                                            {w.createdAt ? new Date(w.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2.5 py-1 rounded text-xs font-bold border ${statusInfo.style}`}>
                                            {statusInfo.text}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button onClick={() => handleViewDetail(w)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors" title="Xử lý / Cập nhật">
                                            <Wrench size={18} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredWarranties.length === 0 && <tr><td colSpan="6" className="text-center py-12 text-gray-500">Không tìm thấy yêu cầu bảo hành nào.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* MODAL 1: TẠO MỚI YÊU CẦU BẢO HÀNH */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[95vh]">
                        <div className="p-5 flex justify-between items-center border-b border-gray-100 bg-slate-50">
                            <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                <Plus size={22} className="text-blue-600"/> 
                                Tạo Yêu cầu Bảo hành Mới
                            </h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors p-1"><X size={24}/></button>
                        </div>
                        
                        <form onSubmit={handleCreateTicket} className="p-6 overflow-y-auto flex-1 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Khung thông tin khách hàng */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-gray-800 border-b pb-2 flex items-center gap-2">1. Thông tin khách hàng</h4>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">Họ và tên *</label>
                                        <input required type="text" name="customerName" value={newTicket.customerName} onChange={handleNewTicketChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" placeholder="Nhập tên khách hàng" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">Số điện thoại *</label>
                                        <input required type="text" name="customerPhone" value={newTicket.customerPhone} onChange={handleNewTicketChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" placeholder="Nhập số điện thoại" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">Email (Tùy chọn)</label>
                                        <input type="email" name="customerEmail" value={newTicket.customerEmail} onChange={handleNewTicketChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" placeholder="Nhập email" />
                                    </div>
                                </div>

                                {/* Khung thông tin sản phẩm */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-gray-800 border-b pb-2 flex items-center gap-2">2. Chi tiết thiết bị</h4>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">Tên sản phẩm *</label>
                                        <input required type="text" name="productName" value={newTicket.productName} onChange={handleNewTicketChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" placeholder="VD: Laptop Dell XPS 15" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">Số Serial (S/N) hoặc IMEI *</label>
                                        <input required type="text" name="serialNumber" value={newTicket.serialNumber} onChange={handleNewTicketChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none font-mono uppercase" placeholder="Nhập mã Serial" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-sm font-bold text-gray-800 border-b pb-2 flex items-center gap-2">3. Tình trạng lỗi</h4>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Khách hàng báo lỗi / Ghi chú ngoại quan *</label>
                                    <textarea required name="issueDescription" value={newTicket.issueDescription} onChange={handleNewTicketChange} rows="3" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none resize-none" placeholder="Mô tả chi tiết tình trạng máy khi tiếp nhận (VD: Không lên nguồn, có vết xước ở góc...)"></textarea>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-200">Hủy</button>
                                <button type="submit" disabled={isCreating} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-md disabled:opacity-50">
                                    {isCreating ? 'Đang tạo...' : 'Lưu và Tiếp nhận'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: CẬP NHẬT TRẠNG THÁI (Giữ nguyên như cũ) */}
            {isUpdateModalOpen && selectedTicket && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh]">
                        <div className="p-5 flex justify-between items-center border-b border-gray-100 bg-slate-50">
                            <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                <ShieldCheck size={22} className="text-blue-600"/> 
                                Chi tiết Yêu cầu Bảo hành <span className="text-blue-600 bg-blue-100 px-2 py-0.5 rounded ml-2">#{selectedTicket.ticketCode}</span>
                            </h3>
                            <button onClick={() => setIsUpdateModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors p-1"><X size={24}/></button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1 flex flex-col lg:flex-row gap-6">
                            {/* CỘT TRÁI: Dữ liệu từ User/Tiếp nhận */}
                            <div className="flex-1 space-y-5">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-800 border-b pb-2 mb-3 flex items-center gap-2">
                                        <AlertTriangle size={16} className="text-orange-500"/> Thông tin khách báo lỗi
                                    </h4>
                                    <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 text-sm">
                                        <p className="text-gray-700 italic">"{selectedTicket.issueDescription || 'Không có mô tả chi tiết.'}"</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Khách hàng</p>
                                        <p className="font-bold text-gray-800">{selectedTicket.customerName}</p>
                                        <p className="text-gray-600 mt-1">📞 {selectedTicket.customerPhone}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sản phẩm</p>
                                        <p className="font-bold text-gray-800 line-clamp-1" title={selectedTicket.productName}>{selectedTicket.productName}</p>
                                        <p className="text-gray-600 mt-1">SN: <span className="font-mono font-medium">{selectedTicket.serialNumber}</span></p>
                                    </div>
                                </div>
                            </div>

                            {/* CỘT PHẢI: Admin xử lý */}
                            <div className="flex-1 bg-blue-50/30 p-5 rounded-xl border border-blue-100 flex flex-col">
                                <h4 className="text-sm font-bold text-blue-800 border-b border-blue-200 pb-2 mb-4 flex items-center gap-2">
                                    <Wrench size={16}/> Cập nhật Tiến độ & Ghi chú
                                </h4>
                                
                                <form onSubmit={handleUpdateTicket} className="flex flex-col flex-1">
                                    <div className="mb-5">
                                        <label className="block text-sm font-bold text-gray-800 mb-2">Trạng thái hiện tại *</label>
                                        <select 
                                            value={updateStatus} onChange={(e) => setUpdateStatus(e.target.value)}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white font-bold text-gray-700 shadow-sm"
                                        >
                                            <option value="PENDING">📦 Mới tiếp nhận (Chờ KTV kiểm tra)</option>
                                            <option value="PROCESSING">🔧 Đang kiểm tra / Đang sửa chữa</option>
                                            <option value="REPAIRED">✅ Đã sửa xong (Chờ trả khách)</option>
                                            <option value="COMPLETED">🎉 Đã trả khách (Hoàn tất)</option>
                                            <option value="REJECTED">❌ Từ chối bảo hành (Hết BH/Vào nước)</option>
                                        </select>
                                    </div>

                                    <div className="flex-1 flex flex-col">
                                        <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                                            <FileText size={16} className="text-gray-500"/> Ghi chú từ Kỹ thuật viên
                                        </label>
                                        <textarea 
                                            value={techNote} onChange={(e) => setTechNote(e.target.value)}
                                            placeholder="Ghi lại nguyên nhân lỗi, linh kiện đã thay, chi phí phát sinh... Nội dung này khách hàng có thể tra cứu được."
                                            className="w-full flex-1 min-h-[120px] border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none resize-none bg-white"
                                        ></textarea>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-gray-200">
                                        <button type="button" onClick={() => setIsUpdateModalOpen(false)} className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">Đóng</button>
                                        <button type="submit" disabled={isUpdating} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md disabled:opacity-50 flex items-center gap-2 transition-colors">
                                            {isUpdating ? <span className="animate-pulse">Đang lưu...</span> : <><CheckCircle size={18}/> Lưu trạng thái</>}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminWarranty;