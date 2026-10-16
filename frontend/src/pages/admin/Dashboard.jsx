import { useState, useEffect } from 'react';
import { 
    DollarSign, ShoppingCart, Package, Users, Award, 
    TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, 
    Percent, Search, AlertTriangle, ShoppingBag 
} from 'lucide-react';
import { 
    LineChart, Line, BarChart, Bar, XAxis, YAxis, 
    CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import axiosClient from '../../utils/axiosClient';

const Dashboard = () => {
    // State cho bộ lọc thời gian
    const [timeRange, setTimeRange] = useState('month'); // today, week, month, year, custom
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    // State dữ liệu
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Gọi API lấy dữ liệu Dashboard
    const fetchDashboardData = async () => {
        // Nếu chọn custom mà chưa nhập đủ ngày thì bỏ qua
        if (timeRange === 'custom' && (!startDate || !endDate)) return;

        setLoading(true);
        try {
            let url = `/admin/dashboard?timeRange=${timeRange}`;
            if (timeRange === 'custom') {
                url += `&startDate=${startDate}&endDate=${endDate}`;
            }
            
            const res = await axiosClient.get(url);
            setData(res?.data?.data || res?.data);
        } catch (error) {
            console.error('Lỗi tải dữ liệu dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    // Gọi lại API khi bộ lọc thay đổi
    useEffect(() => {
        if (timeRange !== 'custom') {
            fetchDashboardData();
        }
    }, [timeRange]);

    const handleCustomFilter = () => {
        if (startDate && endDate) {
            fetchDashboardData();
        } else {
            alert('Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc');
        }
    };

    // Format tiền VNĐ
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
    };

    if (loading || !data) {
        return (
            <div className="flex justify-center items-center h-[70vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const { kpis = {}, revenueChart = [], topCustomers = [], topProducts = [] } = data;

    return (
        <div className="space-y-6">
            {/* Header & Bộ lọc */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Tổng quan hệ thống</h1>
                    <p className="text-gray-500 text-sm mt-1">Báo cáo hoạt động kinh doanh của HungHuyTech</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    {/* Các nút bộ lọc nhanh */}
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button onClick={() => setTimeRange('today')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${timeRange === 'today' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Hôm nay</button>
                        <button onClick={() => setTimeRange('week')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${timeRange === 'week' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Tuần này</button>
                        <button onClick={() => setTimeRange('month')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${timeRange === 'month' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Tháng này</button>
                        <button onClick={() => setTimeRange('year')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${timeRange === 'year' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Năm nay</button>
                        <button onClick={() => setTimeRange('custom')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${timeRange === 'custom' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Tùy chỉnh</button>
                    </div>

                    {/* Bộ lọc tùy chỉnh ngày (Chỉ hiện khi chọn Custom) */}
                    {timeRange === 'custom' && (
                        <div className="flex items-center gap-2">
                            <input 
                                type="date" 
                                className="text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                            <span className="text-gray-500">-</span>
                            <input 
                                type="date" 
                                className="text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                            <button onClick={handleCustomFilter} className="bg-blue-600 text-white p-1.5 rounded-md hover:bg-blue-700 transition-colors">
                                <Search size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Thẻ chỉ số (KPI Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* 1. Doanh thu & Tỷ lệ */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600"><DollarSign size={20} /></div>
                        <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-full flex items-center gap-1">
                            <Percent size={12}/> Tỷ lệ chuyển đổi: <span className="text-blue-600">{kpis.conversionRate || 0}%</span>
                        </span>
                    </div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Tổng Doanh Thu</p>
                    <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(kpis.totalRevenue)}</h3>
                </div>

                {/* 2. Đơn hàng (Tổng, Chờ, Hoàn thành, Hủy) */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600"><ShoppingCart size={20} /></div>
                        <span className="text-xs font-semibold bg-red-50 text-red-600 px-2 py-1 rounded-full">
                            Tỷ lệ hủy: {kpis.cancellationRate || 0}%
                        </span>
                    </div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Tổng Đơn Hàng</p>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">{kpis.totalOrders || 0}</h3>
                    
                    <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-3">
                        <div className="text-center" title="Chờ xử lý">
                            <div className="flex items-center justify-center gap-1 text-yellow-600 mb-1"><Clock size={14}/></div>
                            <p className="text-sm font-bold text-gray-700">{kpis.pendingOrders || 0}</p>
                        </div>
                        <div className="text-center border-l border-r border-gray-100" title="Hoàn thành">
                            <div className="flex items-center justify-center gap-1 text-green-600 mb-1"><CheckCircle size={14}/></div>
                            <p className="text-sm font-bold text-gray-700">{kpis.completedOrders || 0}</p>
                        </div>
                        <div className="text-center" title="Đã hủy">
                            <div className="flex items-center justify-center gap-1 text-red-500 mb-1"><XCircle size={14}/></div>
                            <p className="text-sm font-bold text-gray-700">{kpis.cancelledOrders || 0}</p>
                        </div>
                    </div>
                </div>

                {/* 3. Khách hàng (Tổng & Mới) */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600"><Users size={20} /></div>
                        <span className="text-xs font-semibold bg-green-50 text-green-600 px-2 py-1 rounded-full flex items-center gap-1">
                            <TrendingUp size={12}/> +{kpis.newCustomers || 0} Mới
                        </span>
                    </div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Tổng Khách Hàng</p>
                    <h3 className="text-2xl font-bold text-gray-800">{kpis.totalCustomers || 0}</h3>
                </div>

                {/* 4. Cảnh báo tồn kho */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-600"><Package size={20} /></div>
                        {kpis.lowStockCount > 0 && (
                            <span className="text-xs font-semibold bg-red-100 text-red-600 px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
                                <AlertTriangle size={12}/> Chú ý
                            </span>
                        )}
                    </div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Sản phẩm sắp hết hàng</p>
                    <h3 className="text-2xl font-bold text-orange-600">{kpis.lowStockCount || 0} <span className="text-sm font-normal text-gray-500">mã SP</span></h3>
                </div>

            </div>

            {/* Khu vực Biểu đồ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Biểu đồ Doanh thu (Chiếm 2 cột) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">Biểu đồ Doanh thu</h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueChart} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(value) => `${value / 1000000}M`} />
                                <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                <Legend />
                                <Line type="monotone" name="Doanh thu (VNĐ)" dataKey="revenue" stroke="#2563eb" strokeWidth={3} dot={{r: 4, fill: '#2563eb'}} activeDot={{r: 6}} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Biểu đồ Đơn hàng (Chiếm 1 cột) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">Lượng đơn hàng</h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueChart} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                                <Bar dataKey="orders" name="Số đơn hàng" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Các Bảng dữ liệu (Top Sản phẩm & Top Khách hàng) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Bảng Top 10 Sản phẩm bán chạy */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex items-center gap-2 bg-slate-50/50">
                        <ShoppingBag className="text-blue-500" size={20} />
                        <h2 className="text-base font-bold text-gray-800">Top 10 Sản phẩm bán chạy</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white text-gray-500 text-xs border-b border-gray-100">
                                    <th className="p-4 font-medium w-12 text-center">#</th>
                                    <th className="p-4 font-medium">Sản phẩm</th>
                                    <th className="p-4 font-medium text-center">Đã bán</th>
                                    <th className="p-4 font-medium text-right pr-6">Doanh thu</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                                {topProducts.length > 0 ? topProducts.map((product, index) => (
                                    <tr key={product.id || index} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 text-center font-medium text-gray-400">{index + 1}</td>
                                        <td className="p-4 font-medium text-gray-800 line-clamp-2">{product.name}</td>
                                        <td className="p-4 text-center text-blue-600 font-semibold">{product.sold}</td>
                                        <td className="p-4 text-right pr-6 font-bold text-gray-700">{formatCurrency(product.revenue)}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="4" className="p-8 text-center text-gray-500">Chưa có dữ liệu</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Bảng Xếp hạng Thành viên VIP */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex items-center gap-2 bg-slate-50/50">
                        <Award className="text-yellow-500" size={20} />
                        <h2 className="text-base font-bold text-gray-800">Top Khách hàng VIP</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white text-gray-500 text-xs border-b border-gray-100">
                                    <th className="p-4 font-medium w-12 text-center">#</th>
                                    <th className="p-4 font-medium">Khách hàng</th>
                                    <th className="p-4 font-medium text-center">Số đơn</th>
                                    <th className="p-4 font-medium text-right pr-6">Tổng chi tiêu</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                                {topCustomers.length > 0 ? topCustomers.map((customer, index) => (
                                    <tr key={customer.id || index} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 text-center">
                                            {index === 0 && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 text-yellow-600 font-bold text-xs">1</span>}
                                            {index === 1 && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-500 font-bold text-xs">2</span>}
                                            {index === 2 && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-bold text-xs">3</span>}
                                            {index > 2 && <span className="font-medium text-gray-400">{index + 1}</span>}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-gray-800">{customer.name}</div>
                                            <div className="text-xs text-gray-500">{customer.phone}</div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs font-semibold">{customer.orders}</span>
                                        </td>
                                        <td className="p-4 text-right pr-6 font-bold text-emerald-600">{formatCurrency(customer.totalSpent)}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="4" className="p-8 text-center text-gray-500">Chưa có dữ liệu</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;