import { useState } from 'react';
import { Search, ShieldCheck, Clock, Wrench, CheckCircle, Package, AlertCircle, Calendar } from 'lucide-react';
import axiosClient from '../utils/axiosClient';

const WarrantyTracking = () => {
    const [searchCode, setSearchCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [warrantyData, setWarrantyData] = useState(null);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchCode.trim()) {
            setError('Vui lòng nhập mã bảo hành hoặc số điện thoại');
            return;
        }

        setLoading(true);
        setError('');
        setWarrantyData(null);

        try {
            const response = await axiosClient.get(`/warranty/lookup`, {
                params: { keyword: searchCode } 
            });
            
            // Xử lý dữ liệu trả về: Kiểm tra nếu là mảng thì lấy phần tử đầu tiên [0]
            let rawData = response.data?.data || response.data?.content || response.data;
            
            if (Array.isArray(rawData)) {
                if (rawData.length > 0) {
                    setWarrantyData(rawData[0]); // Lấy đơn bảo hành đầu tiên tìm thấy
                } else {
                    setError('Không tìm thấy thông tin bảo hành cho mã này. Vui lòng kiểm tra lại!');
                }
            } else if (rawData) {
                setWarrantyData(rawData);
            } else {
                setError('Không tìm thấy thông tin bảo hành cho mã này. Vui lòng kiểm tra lại!');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Không tìm thấy thông tin bảo hành. Vui lòng kiểm tra lại!');
        } finally {
            setLoading(false);
        }
    };

    const statusSteps = [
        { key: 'PENDING', label: 'Đã tiếp nhận', icon: <Package size={24} /> },
        { key: 'PROCESSING', label: 'Đang kiểm tra', icon: <Search size={24} /> },
        { key: 'REPAIRED', label: 'Đã sửa xong', icon: <Wrench size={24} /> },
        { key: 'COMPLETED', label: 'Đã trả khách', icon: <CheckCircle size={24} /> },
    ];

    const getCurrentStepIndex = (status) => {
        if (status === 'REJECTED') return -1;
        return statusSteps.findIndex(step => step.key === status);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Đang cập nhật';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Header Section */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center p-4 bg-blue-100 rounded-full mb-2">
                        <ShieldCheck className="text-blue-600 w-12 h-12" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">Tra cứu trạng thái bảo hành</h1>
                    <p className="text-slate-500 max-w-xl mx-auto">
                        Nhập mã phiếu bảo hành hoặc số điện thoại của bạn để theo dõi tiến độ kiểm tra và sửa chữa thiết bị.
                    </p>
                </div>

                {/* Search Box */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 max-w-2xl mx-auto">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <input 
                                type="text" 
                                value={searchCode}
                                onChange={(e) => setSearchCode(e.target.value)}
                                placeholder="VD: WH... hoặc số điện thoại" 
                                className="w-full pl-4 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <Search size={20} />
                                    Tra cứu
                                </>
                            )}
                        </button>
                    </form>
                    {error && (
                        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-start gap-2 text-sm animate-in fade-in">
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                {/* Kết quả tra cứu */}
                {warrantyData && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-slate-800 text-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold">{warrantyData.productName}</h2>
                                <p className="text-slate-300 text-sm mt-1">Mã phiếu: <span className="font-semibold text-white">#{warrantyData.ticketCode}</span></p>
                            </div>
                            <div className="flex gap-4 text-sm">
                                <div className="flex items-center gap-1.5 text-slate-300">
                                    <Calendar size={16} />
                                    <span>Nhận: {formatDate(warrantyData.createdAt)}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-blue-300">
                                    <Clock size={16} />
                                    <span>Cập nhật: {formatDate(warrantyData.updatedAt || warrantyData.createdAt)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 md:p-8 space-y-8">
                            {warrantyData.status === 'REJECTED' ? (
                                <div className="p-6 bg-red-50 border border-red-100 rounded-xl text-center">
                                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                                    <h3 className="text-lg font-bold text-red-700">Từ chối bảo hành</h3>
                                    <p className="text-red-600 mt-2">Thiết bị của bạn không đủ điều kiện bảo hành. Vui lòng xem ghi chú hoặc liên hệ cửa hàng.</p>
                                </div>
                            ) : (
                                <div className="relative">
                                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full z-0"></div>
                                    <div 
                                        className="hidden md:block absolute top-1/2 left-0 h-1 bg-blue-500 -translate-y-1/2 rounded-full z-0 transition-all duration-700" 
                                        style={{ width: `${(getCurrentStepIndex(warrantyData.status) / (statusSteps.length - 1)) * 100}%` }}
                                    ></div>
                                    
                                    <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6 md:gap-0">
                                        {statusSteps.map((step, index) => {
                                            const isActive = index <= getCurrentStepIndex(warrantyData.status);
                                            const isCurrent = index === getCurrentStepIndex(warrantyData.status);
                                            
                                            return (
                                                <div key={step.key} className="flex md:flex-col items-center gap-4 md:gap-2 text-center">
                                                    <div className={`
                                                        w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 transition-colors duration-300
                                                        ${isActive ? 'bg-blue-600 border-blue-100 text-white' : 'bg-white border-slate-100 text-slate-300'}
                                                        ${isCurrent ? 'ring-4 ring-blue-500/20' : ''}
                                                    `}>
                                                        {step.icon}
                                                    </div>
                                                    <div>
                                                        <p className={`font-semibold ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>{step.label}</p>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-100">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Khách hàng</p>
                                    <p className="font-semibold text-slate-800">{warrantyData.customerName} - {warrantyData.customerPhone}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Tình trạng tiếp nhận</p>
                                    <p className="font-medium text-slate-800">{warrantyData.issueDescription}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-sm text-slate-500 mb-1">Ghi chú từ kỹ thuật viên</p>
                                    <div className="bg-white p-4 rounded-lg border border-yellow-200 text-yellow-800 text-sm">
                                        {warrantyData.technicianNote || 'Chưa có ghi chú / Đang chờ kỹ thuật viên kiểm tra.'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WarrantyTracking;