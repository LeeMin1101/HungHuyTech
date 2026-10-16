import { useState, useEffect } from 'react';
import { 
    Package, ArrowUpRight, ArrowDownLeft, RefreshCw, 
    AlertTriangle, Search, History, BarChart3, Plus, ShieldCheck, X
} from 'lucide-react';
import axiosClient from '../../utils/axiosClient';

const AdminInventory = () => {
    const [inventoryItems, setInventoryItems] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'history', 'report'
    
    // State tìm kiếm và lọc
    const [searchTerm, setSearchTerm] = useState('');
    const [filterLowStock, setFilterLowStock] = useState(false);

    // State Modal Điều chỉnh kho (Nhập/Xuất/Kiểm kê)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [actionType, setActionType] = useState('IMPORT'); // IMPORT, EXPORT, ADJUST
    const [quantity, setQuantity] = useState('');
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Lấy dữ liệu kho từ Backend
    const fetchInventoryData = async () => {
        setLoading(true);
        try {
            // Đã đồng bộ thêm chữ 's' thành /admin/inventories và /admin/inventories/history
            const [invRes, histRes] = await Promise.all([
                axiosClient.get('/admin/inventories'),
                axiosClient.get('/admin/inventories/history').catch(() => ({ data: [] }))
            ]);
            
            setInventoryItems(invRes?.data?.content || invRes?.data?.data || invRes?.data || []);
            setHistory(histRes?.data?.content || histRes?.data?.data || histRes?.data || []);
        } catch (error) {
            console.error('Lỗi tải dữ liệu kho:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventoryData();
    }, []);

    // Lọc danh sách tồn kho
    const filteredItems = inventoryItems.filter(item => {
        const matchSearch = item.productName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.sku?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchLowStock = filterLowStock ? (item.stock <= (item.minStockAlert || 5)) : true;
        return matchSearch && matchLowStock;
    });

    // Mở modal điều chỉnh kho
    const handleOpenModal = (item, type) => {
        setSelectedVariant(item);
        setActionType(type);
        setQuantity('');
        setNote('');
        setIsModalOpen(true);
    };

    // Gửi yêu cầu cập nhật kho lên Backend
    const handleSubmitInventory = async (e) => {
        e.preventDefault();
        if (!quantity || parseInt(quantity) <= 0) {
            return alert('Vui lòng nhập số lượng hợp lệ!');
        }

        setIsSubmitting(true);
        try {
            const payload = {
                variantId: selectedVariant.variantId || selectedVariant.id,
                warehouseId: selectedVariant.warehouseId || 1, // Mặc định kho số 1 nếu chưa chọn
                quantity: parseInt(quantity),
                transactionType: actionType === 'IMPORT' ? 'IMPORT' : 'EXPORT', // Khớp với DTO Backend
                note: note
            };

            // Đồng bộ endpoint adjust thành /admin/inventories/adjust
            await axiosClient.post('/admin/inventories/adjust', payload);
            alert('Cập nhật kho thành công!');
            setIsModalOpen(false);
            fetchInventoryData(); // Refresh data
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật kho.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Thống kê nhanh
    const totalSKUs = inventoryItems.length;
    const totalStockQty = inventoryItems.reduce((acc, item) => acc + (item.quantity ?? item.stock ?? 0), 0);
    const lowStockCount = inventoryItems.filter(item => (item.quantity ?? item.stock ?? 0) <= (item.minStockAlert || 5)).length;
    const reservedQty = inventoryItems.reduce((acc, item) => acc + (item.reservedQuantity ?? 0), 0);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
            
            {/* Header & Thống kê tổng quan */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Quản lý Kho hàng & Tồn kho</h1>
                    <p className="text-sm text-gray-500 mt-1">Kiểm soát chi tiết tồn kho theo SKU, biến thể và lịch sử giao dịch</p>
                </div>
                <button 
                    onClick={fetchInventoryData}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                >
                    <RefreshCw size={16} /> Làm mới dữ liệu
                </button>
            </div>

            {/* Thẻ KPI Kho */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center shrink-0"><Package size={22}/></div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Tổng số SKU</p>
                        <h3 className="text-xl font-bold text-gray-800">{totalSKUs} mã</h3>
                    </div>
                </div>
                <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-600 text-white rounded-lg flex items-center justify-center shrink-0"><BarChart3 size={22}/></div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Tổng tồn kho thực tế</p>
                        <h3 className="text-xl font-bold text-emerald-700">{totalStockQty} sản phẩm</h3>
                    </div>
                </div>
                <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-lg flex items-center justify-center shrink-0"><ShieldCheck size={22}/></div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Đang giữ cho đơn (Reserved)</p>
                        <h3 className="text-xl font-bold text-indigo-700">{reservedQty} sản phẩm</h3>
                    </div>
                </div>
                <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-600 text-white rounded-lg flex items-center justify-center shrink-0"><AlertTriangle size={22}/></div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Cảnh báo sắp hết</p>
                        <h3 className="text-xl font-bold text-orange-600">{lowStockCount} SKU</h3>
                    </div>
                </div>
            </div>

            {/* Các Tab điều hướng chức năng */}
            <div className="flex border-b border-gray-200">
                <button 
                    onClick={() => setActiveTab('inventory')}
                    className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'inventory' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Danh sách Tồn kho SKU
                </button>
                <button 
                    onClick={() => setActiveTab('history')}
                    className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Lịch sử Giao dịch Kho
                </button>
            </div>

            {/* NỘI DUNG TAB 1: DANH SÁCH TỒN KHO */}
            {activeTab === 'inventory' && (
                <div className="space-y-4">
                    {/* Bộ lọc tìm kiếm & Cảnh báo */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text" placeholder="Tìm theo tên sản phẩm hoặc mã SKU..." 
                                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:border-blue-500 outline-none text-sm bg-white"
                            />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-md border border-gray-200 text-sm font-medium text-gray-700 select-none shrink-0">
                            <input 
                                type="checkbox" checked={filterLowStock} onChange={(e) => setFilterLowStock(e.target.checked)}
                                className="w-4 h-4 text-orange-600 rounded border-gray-300"
                            />
                            Chỉ hiện SKU sắp hết hàng
                        </label>
                    </div>

                    {/* Bảng dữ liệu tồn kho */}
                    <div className="overflow-x-auto rounded-lg border border-gray-100">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-600 text-sm border-b border-gray-100">
                                    <th className="p-4 font-semibold w-20">Ảnh</th>
                                    <th className="p-4 font-semibold">Sản phẩm & Biến thể</th>
                                    <th className="p-4 font-semibold w-36">Mã SKU</th>
                                    <th className="p-4 font-semibold text-center">Tồn thực tế</th>
                                    <th className="p-4 font-semibold text-center">Đang giữ (Giỏ/Đơn)</th>
                                    <th className="p-4 font-semibold text-center">Khả dụng (Có thể bán)</th>
                                    <th className="p-4 font-semibold text-center w-40">Thao tác kho</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {filteredItems.map((item, index) => {
                                    const stock = item.quantity ?? item.stock ?? 0;
                                    const reserved = item.reservedQuantity ?? 0;
                                    const available = item.availableQuantity ?? (stock - reserved);
                                    const isLowStock = stock <= (item.minStockAlert || 5);

                                    return (
                                        <tr key={item.id || index} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="p-3">
                                                <div className="w-12 h-12 bg-white rounded border border-gray-200 p-1">
                                                    <img src={item.imageUrl || item.productImageUrl || 'https://placehold.co/100'} alt="" className="w-full h-full object-contain" />
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="font-semibold text-gray-800 line-clamp-1">{item.productName || 'Sản phẩm'}</div>
                                                <div className="text-xs text-blue-600 font-medium mt-0.5">{item.variantName || item.variantSku || 'Mặc định'}</div>
                                            </td>
                                            <td className="p-3 font-mono text-xs text-gray-600">{item.variantSku || item.sku || 'N/A'}</td>
                                            <td className="p-3 text-center">
                                                <span className={`font-bold px-2.5 py-1 rounded-full text-xs ${isLowStock ? 'bg-orange-100 text-orange-700 animate-pulse' : 'bg-gray-100 text-gray-700'}`}>
                                                    {stock}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center text-indigo-600 font-semibold">{reserved}</td>
                                            <td className="p-3 text-center">
                                                <span className={`font-bold ${available > 0 ? 'text-emerald-600' : 'text-red-600'}`}>{available}</span>
                                            </td>
                                            <td className="p-3 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button 
                                                        onClick={() => handleOpenModal(item, 'IMPORT')}
                                                        className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-md font-medium text-xs flex items-center gap-1 transition-colors"
                                                        title="Nhập kho"
                                                    >
                                                        <ArrowDownLeft size={14}/> Nhập
                                                    </button>
                                                    <button 
                                                        onClick={() => handleOpenModal(item, 'EXPORT')}
                                                        className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md font-medium text-xs flex items-center gap-1 transition-colors"
                                                        title="Xuất kho"
                                                    >
                                                        <ArrowUpRight size={14}/> Xuất
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredItems.length === 0 && (
                                    <tr><td colSpan="7" className="text-center py-12 text-gray-500">Không tìm thấy dữ liệu tồn kho phù hợp.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* NỘI DUNG TAB 2: LỊCH SỬ GIAO DỊCH KHO */}
            {activeTab === 'history' && (
                <div className="overflow-x-auto rounded-lg border border-gray-100">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-600 text-sm border-b border-gray-100">
                                <th className="p-4 font-semibold w-24">Mã GD</th>
                                <th className="p-4 font-semibold text-center">Loại giao dịch</th>
                                <th className="p-4 font-semibold">Sản phẩm / SKU</th>
                                <th className="p-4 font-semibold text-center">Số lượng thay đổi</th>
                                <th className="p-4 font-semibold">Ghi chú / Đơn hàng</th>
                                <th className="p-4 font-semibold">Thời gian</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {history.map((tx, idx) => (
                                <tr key={tx.id || idx} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 font-mono text-xs text-gray-500">#{tx.id || idx + 1}</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${
                                            tx.type === 'IMPORT' ? 'bg-emerald-100 text-emerald-700' :
                                            tx.type === 'EXPORT' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {tx.type === 'IMPORT' ? 'Nhập kho' : tx.type === 'EXPORT' ? 'Xuất kho' : (tx.type || 'Điều chỉnh')}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-semibold text-gray-800">{tx.productName || 'Sản phẩm'}</div>
                                        <div className="text-xs text-gray-500">SKU: {tx.sku || 'N/A'}</div>
                                    </td>
                                    <td className="p-4 text-center font-bold">
                                        <span className={tx.type === 'IMPORT' ? 'text-emerald-600' : 'text-red-600'}>
                                            {tx.type === 'IMPORT' ? `+${tx.quantity}` : `-${tx.quantity}`}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-600 text-xs">{tx.note || 'Không có ghi chú'}</td>
                                    <td className="p-4 text-gray-500 text-xs">{tx.createdAt ? new Date(tx.createdAt).toLocaleString('vi-VN') : 'N/A'}</td>
                                </tr>
                            ))}
                            {history.length === 0 && (
                                <tr><td colSpan="6" className="text-center py-12 text-gray-500">Chưa có lịch sử giao dịch kho nào.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL NHẬP / XUẤT KHO THỦ CÔNG */}
            {isModalOpen && selectedVariant && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
                        <div className={`p-5 flex justify-between items-center text-white ${actionType === 'IMPORT' ? 'bg-emerald-600' : 'bg-red-600'}`}>
                            <h3 className="font-bold flex items-center gap-2">
                                {actionType === 'IMPORT' ? <ArrowDownLeft size={20}/> : <ArrowUpRight size={20}/>}
                                {actionType === 'IMPORT' ? 'Phiếu Nhập Kho' : 'Phiếu Xuất Kho'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white"><X size={20}/></button>
                        </div>
                        
                        <form onSubmit={handleSubmitInventory} className="p-5 space-y-4">
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <p className="text-xs text-gray-500">Sản phẩm</p>
                                <p className="font-bold text-gray-800 text-sm">{selectedVariant.productName}</p>
                                <p className="text-xs text-blue-600 font-medium mt-0.5">Phân loại: {selectedVariant.variantName || 'Mặc định'} | SKU: {selectedVariant.variantSku || selectedVariant.sku}</p>
                                <p className="text-xs text-gray-500 mt-2">Tồn kho hiện tại: <b className="text-gray-800">{selectedVariant.quantity ?? selectedVariant.stock}</b></p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng {actionType === 'IMPORT' ? 'nhập thêm' : 'xuất ra'} *</label>
                                <input 
                                    required type="number" min="1" 
                                    value={quantity} onChange={(e) => setQuantity(e.target.value)}
                                    placeholder="Nhập số lượng..." 
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none font-bold"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Lý do / Ghi chú</label>
                                <textarea 
                                    rows="2" 
                                    value={note} onChange={(e) => setNote(e.target.value)}
                                    placeholder="VD: Nhập hàng đợt 1 từ nhà cung cấp..."
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none resize-none"
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">Hủy</button>
                                <button 
                                    type="submit" disabled={isSubmitting}
                                    className={`px-5 py-2 text-white rounded-lg text-sm font-bold shadow-md transition-colors disabled:opacity-50 ${actionType === 'IMPORT' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
                                >
                                    {isSubmitting ? 'Đang xử lý...' : 'Xác nhận'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminInventory;