import { useState, useEffect } from 'react';
import { 
    Briefcase, Search, Filter, Building2, UserCog, 
    FileText, CheckCircle, Clock, Eye, Server, Wrench, X,
    DollarSign, CalendarDays
} from 'lucide-react';
import axiosClient from '../../utils/axiosClient';

const AdminB2B = () => {
    const [b2bRequests, setB2bRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Tìm kiếm và Lọc
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL'); 
    const [filterStatus, setFilterStatus] = useState('ALL'); 

    // Modal chi tiết & Cập nhật
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReq, setSelectedReq] = useState(null);
    const [updateStatus, setUpdateStatus] = useState('');
    const [assignedStaff, setAssignedStaff] = useState('');
    const [adminNote, setAdminNote] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    // Mock danh sách nhân viên (Trong thực tế nên gọi API lấy danh sách staff)
    const staffList = [
        { id: 1, name: 'Nguyễn Văn A (Sales B2B)' },
        { id: 2, name: 'Trần Thị B (Kỹ thuật hệ thống)' },
        { id: 3, name: 'Lê Hoàng C (Quản lý dự án)' }
    ];

    const fetchB2BRequests = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get('/admin/b2b-requests');
            setB2bRequests(res?.data?.data || res?.data?.content || res?.data || []);
        } catch (error) {
            console.error('Lỗi tải danh sách yêu cầu B2B:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchB2BRequests();
    }, []);

    const getRequestTypeInfo = (type) => {
        switch (type) {
            case 'QUOTATION': return { text: 'Báo giá thiết bị', icon: <FileText size={14}/>, style: 'text-blue-700 bg-blue-100' };
            case 'INFRASTRUCTURE': return { text: 'Thi công phòng máy/Mạng', icon: <Server size={14}/>, style: 'text-purple-700 bg-purple-100' };
            case 'MAINTENANCE': return { text: 'Bảo trì định kỳ', icon: <Wrench size={14}/>, style: 'text-orange-700 bg-orange-100' };
            case 'RENTAL': return { text: 'Thuê thiết bị', icon: <Briefcase size={14}/>, style: 'text-emerald-700 bg-emerald-100' };
            default: return { text: 'Khác', icon: <FileText size={14}/>, style: 'text-gray-700 bg-gray-100' };
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'NEW': return { text: 'Mới tiếp nhận', style: 'bg-red-100 text-red-700 border-red-200' };
            case 'CONSULTING': return { text: 'Đang tư vấn', style: 'bg-orange-100 text-orange-700 border-orange-200' };
            case 'QUOTED': return { text: 'Đã gửi báo giá', style: 'bg-blue-100 text-blue-700 border-blue-200' };
            case 'DEPLOYING': return { text: 'Đang triển khai', style: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
            case 'COMPLETED': return { text: 'Hoàn tất', style: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
            case 'CANCELLED': return { text: 'Đã hủy', style: 'bg-gray-100 text-gray-600 border-gray-200' };
            default: return { text: 'N/A', style: 'bg-gray-100 text-gray-700' };
        }
    };

    const filteredRequests = b2bRequests.filter(req => {
        const matchSearch = (req.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (req.contactName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (req.contactPhone || '').includes(searchTerm);
        const matchType = filterType === 'ALL' || req.requestType === filterType;
        const matchStatus = filterStatus === 'ALL' || req.status === filterStatus;
        return matchSearch && matchType && matchStatus;
    });

    const handleViewDetail = (req) => {
        setSelectedReq(req);
        setUpdateStatus(req.status);
        setAssignedStaff(req.assignedStaffId || '');
        setAdminNote(req.adminNote || '');
        setIsModalOpen(true);
    };

    const handleUpdateRequest = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            await axiosClient.put(`/admin/b2b-requests/${selectedReq.id}`, {
                status: updateStatus,
                assignedStaffId: assignedStaff,
                adminNote: adminNote
            });
            alert('Cập nhật tiến độ dự án thành công!');
            setIsModalOpen(false);
            fetchB2BRequests();
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.');
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div></div>;

    const newReqCount = b2bRequests.filter(r => r.status === 'NEW').length;
    const deployingCount = b2bRequests.filter(r => r.status === 'DEPLOYING').length;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6 relative">
            {/* Header & Thống kê */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Dịch vụ Doanh nghiệp (B2B)</h1>
                    <p className="text-sm text-gray-500 mt-1">Quản lý yêu cầu báo giá, dự án mạng, phòng máy và bảo trì</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-red-50 px-4 py-2 rounded-lg border border-red-100 flex items-center gap-3">
                        <Clock className="text-red-600" size={20}/>
                        <div><p className="text-xs text-red-600 font-semibold uppercase">Yêu cầu mới</p><p className="font-bold text-gray-800">{newReqCount}</p></div>
                    </div>
                    <div className="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100 flex items-center gap-3">
                        <Server className="text-indigo-600" size={20}/>
                        <div><p className="text-xs text-indigo-600 font-semibold uppercase">Đang triển khai</p><p className="font-bold text-gray-800">{deployingCount}</p></div>
                    </div>
                </div>
            </div>

            {/* Bộ lọc */}
            <div className="flex flex-col md:flex-row gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" placeholder="Tìm theo Tên công ty, Người liên hệ, SĐT..." 
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 outline-none text-sm bg-white"
                    />
                </div>
                <div className="flex gap-2 shrink-0">
                    <div className="relative flex items-center bg-white border border-gray-200 rounded-lg px-3">
                        <Filter size={16} className="text-gray-400 mr-2"/>
                        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="py-2 text-sm outline-none bg-transparent text-gray-700 font-medium cursor-pointer">
                            <option value="ALL">Tất cả dịch vụ</option>
                            <option value="QUOTATION">Báo giá thiết bị</option>
                            <option value="INFRASTRUCTURE">Thi công phòng máy/Mạng</option>
                            <option value="MAINTENANCE">Bảo trì định kỳ</option>
                            <option value="RENTAL">Thuê thiết bị</option>
                        </select>
                    </div>
                    <div className="relative flex items-center bg-white border border-gray-200 rounded-lg px-3">
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="py-2 text-sm outline-none bg-transparent text-gray-700 font-medium cursor-pointer">
                            <option value="ALL">Tất cả tiến độ</option>
                            <option value="NEW">Mới tiếp nhận</option>
                            <option value="CONSULTING">Đang tư vấn</option>
                            <option value="QUOTED">Đã gửi báo giá</option>
                            <option value="DEPLOYING">Đang triển khai</option>
                            <option value="COMPLETED">Hoàn tất</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Bảng dữ liệu */}
            <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-slate-600 text-sm border-b border-gray-100">
                            <th className="p-4 font-semibold">Công ty & Liên hệ</th>
                            <th className="p-4 font-semibold">Loại dịch vụ</th>
                            <th className="p-4 font-semibold">Ngân sách (Dự kiến)</th>
                            <th className="p-4 font-semibold">Phụ trách</th>
                            <th className="p-4 font-semibold text-center">Tiến độ</th>
                            <th className="p-4 font-semibold text-center w-24">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {filteredRequests.map((req) => {
                            const typeInfo = getRequestTypeInfo(req.requestType);
                            const statusInfo = getStatusInfo(req.status);
                            
                            return (
                                <tr key={req.id} className="hover:bg-blue-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-gray-800 flex items-center gap-2"><Building2 size={16} className="text-gray-400"/> {req.companyName}</div>
                                        <div className="text-xs text-gray-500 mt-1">{req.contactName} - {req.contactPhone}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold ${typeInfo.style}`}>
                                            {typeInfo.icon} {typeInfo.text}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-gray-800">{new Intl.NumberFormat('vi-VN').format(req.estimatedBudget || 0)}đ</div>
                                        <div className="text-xs text-gray-500 mt-0.5">Hạn: {req.expectedTimeline || 'Chưa rõ'}</div>
                                    </td>
                                    <td className="p-4">
                                        {req.assignedStaffName ? (
                                            <span className="flex items-center gap-1.5 font-medium text-blue-700"><UserCog size={14}/> {req.assignedStaffName}</span>
                                        ) : (
                                            <span className="text-xs text-red-500 font-bold italic">Chưa phân công</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2.5 py-1 rounded text-xs font-bold border ${statusInfo.style}`}>
                                            {statusInfo.text}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button onClick={() => handleViewDetail(req)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors" title="Xử lý hồ sơ">
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredRequests.length === 0 && <tr><td colSpan="6" className="text-center py-12 text-gray-500">Không có yêu cầu doanh nghiệp nào.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* Modal Xử lý Dự án B2B */}
            {isModalOpen && selectedReq && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-5 flex justify-between items-center border-b border-gray-100 bg-slate-50">
                            <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2"><Briefcase size={20} className="text-blue-600"/> Hồ sơ Dự án B2B #{selectedReq.id}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500"><X size={20}/></button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1 bg-white">
                            {/* Chi tiết yêu cầu */}
                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 mb-6">
                                <h4 className="font-bold text-gray-800 mb-4 border-b pb-2">Thông tin Khách hàng & Nhu cầu</h4>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                                    <p><span className="text-gray-500">Công ty:</span> <strong className="ml-1">{selectedReq.companyName}</strong></p>
                                    <p><span className="text-gray-500">MST/Email:</span> <span className="ml-1 font-medium">{selectedReq.taxCode} | {selectedReq.contactEmail}</span></p>
                                    <p><span className="text-gray-500">Người liên hệ:</span> <strong className="ml-1">{selectedReq.contactName} ({selectedReq.contactPhone})</strong></p>
                                    <p><span className="text-gray-500">Loại dịch vụ:</span> <strong className="ml-1 text-blue-700">{getRequestTypeInfo(selectedReq.requestType).text}</strong></p>
                                    <p className="flex items-center gap-1"><DollarSign size={16} className="text-green-600"/><span className="text-gray-500">Ngân sách:</span> <strong className="ml-1 text-green-700">{new Intl.NumberFormat('vi-VN').format(selectedReq.estimatedBudget || 0)}đ</strong></p>
                                    <p className="flex items-center gap-1"><CalendarDays size={16} className="text-orange-600"/><span className="text-gray-500">Hạn chót mong muốn:</span> <strong className="ml-1">{selectedReq.expectedTimeline || 'Không có'}</strong></p>
                                    <div className="col-span-2 mt-2">
                                        <p className="text-gray-500 mb-1">Mô tả chi tiết yêu cầu:</p>
                                        <div className="p-3 bg-white border border-gray-200 rounded-lg text-gray-700 whitespace-pre-wrap">{selectedReq.description}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Form phân công và cập nhật tiến độ */}
                            <form onSubmit={handleUpdateRequest} className="space-y-5">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-800 mb-2">Phân công nhân viên phụ trách</label>
                                        <select 
                                            value={assignedStaff} onChange={(e) => setAssignedStaff(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none bg-white"
                                        >
                                            <option value="">-- Chọn nhân viên xử lý --</option>
                                            {staffList.map(staff => (
                                                <option key={staff.id} value={staff.id}>{staff.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-800 mb-2">Tiến độ hiện tại *</label>
                                        <select 
                                            value={updateStatus} onChange={(e) => setUpdateStatus(e.target.value)}
                                            className="w-full border border-blue-300 bg-blue-50 text-blue-800 rounded-lg px-3 py-2 text-sm focus:border-blue-600 outline-none font-semibold"
                                        >
                                            <option value="NEW">Mới tiếp nhận</option>
                                            <option value="CONSULTING">Đang tư vấn / Khảo sát</option>
                                            <option value="QUOTED">Đã gửi báo giá / Chờ duyệt</option>
                                            <option value="DEPLOYING">Đang ký HĐ & Triển khai</option>
                                            <option value="COMPLETED">Hoàn tất / Nghiệm thu</option>
                                            <option value="CANCELLED">Đã hủy bỏ</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-800 mb-2">Ghi chú quản trị & Cập nhật nội bộ</label>
                                    <textarea 
                                        rows="4" 
                                        value={adminNote} onChange={(e) => setAdminNote(e.target.value)}
                                        placeholder="Ghi chú về kết quả buổi meeting, phản hồi từ khách, lý do hủy..."
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none resize-none"
                                    ></textarea>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">Đóng</button>
                                    <button type="submit" disabled={isUpdating} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-md disabled:opacity-50">
                                        {isUpdating ? 'Đang lưu...' : 'Lưu Hồ Sơ'}
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

export default AdminB2B;