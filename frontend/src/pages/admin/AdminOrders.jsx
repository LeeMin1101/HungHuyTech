import { useState, useEffect, useRef } from 'react';
import { 
    Eye, Truck, CheckCircle, XCircle, Clock, X, MapPin, 
    CreditCard, Package, Printer, Download, History, 
    ClipboardList, ArrowRight, Save
} from 'lucide-react';
import axiosClient from '../../utils/axiosClient';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State cho Modal chi tiết đơn hàng
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);

    // State cho việc Hủy đơn hàng
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    // State cho Mã vận đơn
    const [trackingNumber, setTrackingNumber] = useState('');

    // Lấy danh sách đơn hàng
    const fetchOrders = async () => {
        try {
            const res = await axiosClient.get('/admin/orders');
            const data = res?.data?.content || res?.data?.data || res?.data || [];
            const sortedData = Array.isArray(data) ? data.sort((a, b) => b.id - a.id) : [];
            setOrders(sortedData);
        } catch (error) {
            console.error('Lỗi khi tải danh sách đơn hàng:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // --- UTILS: STATUS STYLES ---
    const getStatusStyle = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'CONFIRMED': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'PROCESSING': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'SHIPPING': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'DELIVERED': 
            case 'COMPLETED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'PENDING': return 'Chờ xác nhận';
            case 'CONFIRMED': return 'Đã xác nhận';
            case 'PROCESSING': return 'Đang đóng gói';
            case 'SHIPPING': return 'Đang giao hàng';
            case 'DELIVERED':
            case 'COMPLETED': return 'Đã hoàn thành';
            case 'CANCELLED': return 'Đã hủy';
            default: return status;
        }
    };

    // --- ACTIONS: EXPORT & PRINT ---
    const handleExportExcel = () => {
        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
            + "Mã ĐH,Khách hàng,SĐT,Ngày đặt,Tổng tiền,Trạng thái,Mã vận đơn\n" 
            + orders.map(o => {
                return `${o.orderCode || o.id},"${o.recipientName}","${o.recipientPhone}","${new Date(o.createdAt).toLocaleString('vi-VN')}","${o.totalAmount}","${getStatusText(o.status)}","${o.trackingNumber || ''}"`;
            }).join("\n");
            
        const link = document.createElement("a");
        link.href = encodeURI(csvContent);
        link.download = `Danh_Sach_Don_Hang_${new Date().getTime()}.csv`;
        link.click();
    };

    const handlePrintInvoice = () => {
        if (!selectedOrder) return;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Hóa đơn #${selectedOrder.orderCode || selectedOrder.id}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
                        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                        .info-grid { display: flex; justify-content: space-between; margin-bottom: 30px; }
                        table { w-full: 100%; width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                        th { background-color: #f8f9fa; }
                        .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
                        .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #666; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>HÓA ĐƠN BÁN HÀNG</h1>
                        <p>Mã đơn hàng: <strong>${selectedOrder.orderCode || selectedOrder.id}</strong></p>
                        <p>Ngày lập: ${new Date().toLocaleString('vi-VN')}</p>
                    </div>
                    <div class="info-grid">
                        <div>
                            <h3>Thông tin Khách hàng</h3>
                            <p>Tên: ${selectedOrder.recipientName}</p>
                            <p>SĐT: ${selectedOrder.recipientPhone}</p>
                            <p>Địa chỉ: ${selectedOrder.shippingAddress}</p>
                        </div>
                        <div>
                            <h3>Thông tin Giao hàng</h3>
                            <p>Trạng thái: ${getStatusText(selectedOrder.status)}</p>
                            <p>Mã vận đơn: ${selectedOrder.trackingNumber || 'Chưa có'}</p>
                            <p>Thanh toán: ${selectedOrder.paymentMethod}</p>
                        </div>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Tên sản phẩm</th>
                                <th>Số lượng</th>
                                <th>Đơn giá</th>
                                <th>Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(selectedOrder.items || []).map((item, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${item.productName}${item.variantName ? `(${item.variantName})` : ''}</td>
                                    <td>${item.quantity}</td>
                                    <td>${new Intl.NumberFormat('vi-VN').format(item.unitPrice || 0)}đ</td>
                                    <td>${new Intl.NumberFormat('vi-VN').format((item.unitPrice || 0) * item.quantity)}đ</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="total">
                        Tổng cộng: ${new Intl.NumberFormat('vi-VN').format(selectedOrder.totalAmount || 0)}đ
                    </div>
                    <div class="footer">
                        Cảm ơn quý khách đã mua hàng!
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    // --- ACTIONS: UPDATE & CANCEL ---
    const handleViewDetail = (order) => {
        setSelectedOrder(order);
        setTrackingNumber(order.trackingNumber || '');
        setIsModalOpen(true);
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        if (!window.confirm(`Chuyển trạng thái đơn hàng thành: ${getStatusText(newStatus)}?`)) return;
        
        setUpdatingId(orderId);
        try {
            const res = await axiosClient.put(`/admin/orders/${orderId}/status`, { status: newStatus });
            const updatedOrder = res?.data?.data || res?.data;
            
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus, statusHistory: updatedOrder.statusHistory } : o));
            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus, statusHistory: updatedOrder.statusHistory });
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Lỗi cập nhật trạng thái.');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleCancelOrder = async (e) => {
        e.preventDefault();
        if (!cancelReason.trim()) return alert("Vui lòng nhập lý do hủy đơn!");
        
        setUpdatingId(selectedOrder.id);
        try {
            const res = await axiosClient.put(`/admin/orders/${selectedOrder.id}/cancel`, { reason: cancelReason });
            const updatedOrder = res?.data?.data || res?.data;

            setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, status: 'CANCELLED', cancelReason, statusHistory: updatedOrder.statusHistory } : o));
            setSelectedOrder({ ...selectedOrder, status: 'CANCELLED', cancelReason, statusHistory: updatedOrder.statusHistory });
            setIsCancelModalOpen(false);
            setCancelReason('');
            alert('Hủy đơn hàng thành công!');
        } catch (error) {
            alert(error.response?.data?.message || 'Lỗi khi hủy đơn hàng.');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleSaveTracking = async () => {
        if (!trackingNumber.trim()) return alert("Vui lòng nhập mã vận đơn!");
        try {
            await axiosClient.put(`/admin/orders/${selectedOrder.id}/tracking`, { trackingNumber });
            
            setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, trackingNumber } : o));
            setSelectedOrder({ ...selectedOrder, trackingNumber });
            alert('Cập nhật mã vận đơn thành công!');
        } catch (error) {
            alert(error.response?.data?.message || 'Lỗi cập nhật mã vận đơn.');
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div></div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative">
            {/* Header & Export */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Quản lý Đơn hàng</h1>
                    <p className="text-sm text-gray-500 mt-1">Tổng số: {orders.length} đơn hàng</p>
                </div>
                <button onClick={handleExportExcel} className="px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors border border-emerald-200">
                    <Download size={16} /> Xuất File Excel
                </button>
            </div>

            {/* Bảng Danh sách */}
            <div className="overflow-x-auto rounded-lg border border-gray-100">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-slate-600 text-sm border-b border-gray-100">
                            <th className="p-4 font-semibold w-24">Mã ĐH</th>
                            <th className="p-4 font-semibold">Khách hàng</th>
                            <th className="p-4 font-semibold text-center">Ngày đặt</th>
                            <th className="p-4 font-semibold text-right">Tổng tiền</th>
                            <th className="p-4 font-semibold text-center">Trạng thái</th>
                            <th className="p-4 font-semibold text-center w-24">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-blue-50/50 transition-colors">
                                <td className="p-4 font-bold text-gray-700">{order.orderCode || `#${order.id}`}</td>
                                <td className="p-4">
                                    <div className="font-semibold text-gray-800">{order.recipientName || 'Khách vãng lai'}</div>
                                    <div className="text-gray-500 text-xs mt-0.5">{order.recipientPhone}</div>
                                </td>
                                <td className="p-4 text-gray-600 text-center">
                                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="p-4 text-red-600 font-bold text-right">
                                    {new Intl.NumberFormat('vi-VN').format(order.totalAmount || 0)}đ
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase border ${getStatusStyle(order.status)}`}>
                                        {getStatusText(order.status)}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <button onClick={() => handleViewDetail(order)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-md transition-colors inline-flex" title="Xem chi tiết">
                                        <Eye size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {orders.length === 0 && <tr><td colSpan="6" className="text-center py-12 text-gray-500">Chưa có đơn hàng nào trong hệ thống.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* MODAL CHI TIẾT ĐƠN HÀNG */}
            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                        
                        {/* Header Modal */}
                        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-white shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    Đơn hàng {selectedOrder.orderCode || `#${selectedOrder.id}`}
                                    <span className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase border ${getStatusStyle(selectedOrder.status)}`}>
                                        {getStatusText(selectedOrder.status)}
                                    </span>
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">Ngày đặt: {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={handlePrintInvoice} className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 border border-gray-200">
                                    <Printer size={18}/> <span className="text-sm font-medium hidden sm:block">In Hóa đơn</span>
                                </button>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><X size={24} /></button>
                            </div>
                        </div>
                        
                        {/* Body Modal (Scrollable) */}
                        <div className="p-6 flex-1 overflow-y-auto bg-slate-50/50">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                
                                {/* Cột Trái (2/3): Thông tin & Sản phẩm */}
                                <div className="lg:col-span-2 space-y-6">
                                    
                                    {/* Grid Thông tin Khách hàng & Thanh toán */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 border-b pb-2"><MapPin size={16} className="text-blue-600"/> Giao hàng tới</h3>
                                            <div className="space-y-2 text-sm text-gray-600">
                                                <p><span className="font-medium text-gray-700">Người nhận:</span> {selectedOrder.recipientName}</p>
                                                <p><span className="font-medium text-gray-700">Điện thoại:</span> {selectedOrder.recipientPhone}</p>
                                                <p><span className="font-medium text-gray-700">Địa chỉ:</span> {selectedOrder.shippingAddress}</p>
                                                {selectedOrder.note && <p className="text-orange-600 bg-orange-50 p-2 rounded mt-2"><span className="font-medium">Lưu ý:</span> {selectedOrder.note}</p>}
                                            </div>
                                        </div>
                                        
                                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 border-b pb-2"><CreditCard size={16} className="text-blue-600"/> Thanh toán</h3>
                                            <div className="space-y-2 text-sm text-gray-600">
                                                <p><span className="font-medium text-gray-700">Phương thức:</span> {selectedOrder.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản / Trực tuyến'}</p>
                                                <p className="flex justify-between items-center mt-4 pt-4 border-t border-dashed">
                                                    <span className="font-bold text-gray-800">Tổng thu:</span> 
                                                    <span className="text-red-600 font-bold text-lg">{new Intl.NumberFormat('vi-VN').format(selectedOrder.totalAmount || 0)}đ</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Danh sách sản phẩm */}
                                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                        <div className="p-4 border-b border-gray-100 bg-slate-50"><h3 className="font-bold text-gray-800 flex items-center gap-2"><Package size={16} className="text-blue-600"/> Sản phẩm đặt mua</h3></div>
                                        <div className="divide-y divide-gray-100">
                                            {(selectedOrder.items || []).map((item, index) => (
                                                <div key={index} className="flex gap-4 p-4 items-center hover:bg-slate-50 transition-colors">
                                                    <img src={item.productImageUrl || 'https://placehold.co/100'} alt="" className="w-16 h-16 object-contain border border-gray-200 rounded p-1 bg-white" />
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-800 text-sm line-clamp-2">{item.productName}</h4>
                                                        {item.variantName && <p className="text-blue-600 text-xs mt-0.5 font-medium border border-blue-100 bg-blue-50 inline-block px-1.5 rounded">{item.variantName}</p>}
                                                        <p className="text-gray-500 text-xs mt-1">SL: {item.quantity}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-gray-800 text-sm">{new Intl.NumberFormat('vi-VN').format(item.unitPrice || 0)}đ</p>
                                                        <p className="text-red-600 font-bold text-sm mt-1">{new Intl.NumberFormat('vi-VN').format((item.unitPrice || 0) * item.quantity)}đ</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>

                                {/* Cột Phải (1/3): Lịch sử & Vận đơn */}
                                <div className="space-y-6">
                                    
                                    {/* Section Hủy Đơn Hàng (Nếu đã hủy) */}
                                    {selectedOrder.status === 'CANCELLED' && selectedOrder.cancelReason && (
                                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
                                            <h3 className="font-bold text-red-700 flex items-center gap-2 mb-2"><XCircle size={16}/> Lý do hủy đơn</h3>
                                            <p className="text-sm text-red-600 italic">{selectedOrder.cancelReason}</p>
                                        </div>
                                    )}

                                    {/* Section Vận Đơn */}
                                    {['PROCESSING', 'SHIPPING', 'DELIVERED', 'COMPLETED'].includes(selectedOrder.status) && (
                                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                            <div className="p-3 border-b border-gray-100 bg-slate-50"><h3 className="font-bold text-gray-800 text-sm flex items-center gap-2"><Truck size={16} className="text-blue-600"/> Vận chuyển</h3></div>
                                            <div className="p-4">
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Mã vận đơn (Tracking No.)</label>
                                                <div className="flex gap-2">
                                                    <input type="text" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="VD: GHTK-123456" className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:border-blue-500 outline-none" disabled={['DELIVERED', 'COMPLETED'].includes(selectedOrder.status)} />
                                                    {!['DELIVERED', 'COMPLETED'].includes(selectedOrder.status) && (
                                                        <button onClick={handleSaveTracking} className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center gap-1"><Save size={14}/> Lưu</button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Section Lịch sử trạng thái (Timeline) */}
                                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                        <div className="p-3 border-b border-gray-100 bg-slate-50"><h3 className="font-bold text-gray-800 text-sm flex items-center gap-2"><History size={16} className="text-blue-600"/> Lịch sử cập nhật</h3></div>
                                        <div className="p-4 pl-6 relative">
                                            <div className="absolute left-[1.125rem] top-6 bottom-6 w-0.5 bg-gray-200"></div>
                                            <div className="space-y-4 relative">
                                                {/* Giả định DB trả về mảng statusHistory. Nếu không có, tự map cứng 1 dòng Tạo đơn */}
                                                {(selectedOrder.statusHistory || [{ status: 'PENDING', timestamp: selectedOrder.createdAt, note: 'Khách hàng tạo đơn' }]).map((history, idx) => (
                                                    <div key={idx} className="flex gap-3 relative">
                                                        <div className={`w-3 h-3 rounded-full mt-1.5 z-10 shrink-0 ${idx === 0 ? 'bg-blue-500 ring-4 ring-blue-100' : 'bg-gray-300'}`}></div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-800">{getStatusText(history.status)}</p>
                                                            <p className="text-xs text-gray-500">{new Date(history.timestamp).toLocaleString('vi-VN')}</p>
                                                            {history.note && <p className="text-xs text-gray-600 mt-1">{history.note}</p>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Thanh công cụ Chuyển trạng thái cố định ở dưới */}
                        <div className="p-4 border-t border-gray-100 bg-white shrink-0 flex flex-wrap gap-3 justify-end items-center">
                            {selectedOrder.status === 'PENDING' && (
                                <button disabled={updatingId === selectedOrder.id} onClick={() => handleUpdateStatus(selectedOrder.id, 'CONFIRMED')} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shadow-sm">
                                    <ClipboardList size={18}/> Duyệt đơn & Xác nhận
                                </button>
                            )}
                            {selectedOrder.status === 'CONFIRMED' && (
                                <button disabled={updatingId === selectedOrder.id} onClick={() => handleUpdateStatus(selectedOrder.id, 'PROCESSING')} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shadow-sm">
                                    <Package size={18}/> Đã đóng gói (Chuẩn bị hàng)
                                </button>
                            )}
                            {selectedOrder.status === 'PROCESSING' && (
                                <button disabled={updatingId === selectedOrder.id} onClick={() => handleUpdateStatus(selectedOrder.id, 'SHIPPING')} className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shadow-sm">
                                    <Truck size={18}/> Bắt đầu Giao hàng
                                </button>
                            )}
                            {selectedOrder.status === 'SHIPPING' && (
                                <button disabled={updatingId === selectedOrder.id} onClick={() => handleUpdateStatus(selectedOrder.id, 'COMPLETED')} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shadow-sm">
                                    <CheckCircle size={18}/> Khách đã nhận hàng (Hoàn thành)
                                </button>
                            )}
                            {['PENDING', 'CONFIRMED', 'PROCESSING'].includes(selectedOrder.status) && (
                                <button disabled={updatingId === selectedOrder.id} onClick={() => setIsCancelModalOpen(true)} className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors ml-auto md:ml-0">
                                    <XCircle size={18}/> Hủy đơn
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* SUB-MODAL: XÁC NHẬN HỦY ĐƠN */}
            {isCancelModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-red-50">
                            <h3 className="font-bold text-red-700 flex items-center gap-2"><XCircle size={18}/> Xác nhận Hủy đơn hàng</h3>
                            <button onClick={() => setIsCancelModalOpen(false)} className="text-gray-400 hover:text-red-500"><X size={20}/></button>
                        </div>
                        <form onSubmit={handleCancelOrder} className="p-5">
                            <p className="text-sm text-gray-600 mb-4">Bạn đang thực hiện hủy đơn hàng <b>{selectedOrder?.orderCode || `#${selectedOrder?.id}`}</b>. Hành động này không thể hoàn tác.</p>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lý do hủy đơn *</label>
                            <textarea 
                                required rows="3"
                                value={cancelReason} 
                                onChange={(e) => setCancelReason(e.target.value)} 
                                placeholder="Nhập lý do hủy (VD: Khách đổi ý, Hết hàng...)"
                                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:border-red-500 outline-none resize-none bg-gray-50 focus:bg-white"
                            ></textarea>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsCancelModalOpen(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium">Đóng</button>
                                <button type="submit" disabled={updatingId === selectedOrder?.id} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-50">
                                    {updatingId === selectedOrder?.id ? 'Đang xử lý...' : 'Xác nhận Hủy'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminOrders;