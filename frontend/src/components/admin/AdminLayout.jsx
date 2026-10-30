import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, Package, ShoppingCart, Warehouse, LogOut, Menu, 
    Users, Ticket, Tags, Truck, CreditCard, ShieldCheck, Briefcase, 
    Wrench, Image, FileText, BarChart3, UserCog, Settings, Hexagon
} from 'lucide-react';
import ThemeToggle from '../ThemeToggle';

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // State quản lý việc đóng/mở sidebar
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
        navigate('/admin/login');
    };

    const menuGroups = [
        {
            title: 'TỔNG QUAN',
            items: [
                { path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Bảng điều khiển' }
            ]
        },
        {
            title: 'KINH DOANH',
            items: [
                { path: '/admin/products', icon: <Package size={20} />, label: 'Quản lý sản phẩm' },
                { path: '/admin/categories', icon: <Tags size={20} />, label: 'Danh mục & Thương hiệu' },
                { path: '/admin/orders', icon: <ShoppingCart size={20} />, label: 'Quản lý đơn hàng' },
                { path: '/admin/customers', icon: <Users size={20} />, label: 'Quản lý khách hàng' },
                { path: '/admin/promotions', icon: <Ticket size={20} />, label: 'Khuyến mãi & Mã giảm' },
            ]
        },
        {
            title: 'VẬN HÀNH',
            items: [
                { path: '/admin/inventory', icon: <Warehouse size={20} />, label: 'Quản lý kho' },
                { path: '/admin/delivery', icon: <Truck size={20} />, label: 'Giao hàng' },
                { path: '/admin/payments', icon: <CreditCard size={20} />, label: 'Thanh toán' },
                { path: '/admin/warranty', icon: <ShieldCheck size={20} />, label: 'Bảo hành' },
            ]
        },
        {
            title: 'DỊCH VỤ & NỘI DUNG',
            items: [
                { path: '/admin/b2b', icon: <Briefcase size={20} />, label: 'Khách doanh nghiệp' },
                { path: '/admin/tech-services', icon: <Wrench size={20} />, label: 'Dịch vụ kỹ thuật' },
                { path: '/admin/banners', icon: <Image size={20} />, label: 'Banner & Giao diện' },
                { path: '/admin/blogs', icon: <FileText size={20} />, label: 'Tin tức & Blog' },
            ]
        },
        {
            title: 'HỆ THỐNG',
            items: [
                { path: '/admin/reports', icon: <BarChart3 size={20} />, label: 'Báo cáo doanh thu' },
                { path: '/admin/staff', icon: <UserCog size={20} />, label: 'Nhân viên & Phân quyền' },
                { path: '/admin/settings', icon: <Settings size={20} />, label: 'Cài đặt hệ thống' },
            ]
        }
    ];

    const getCurrentPageLabel = () => {
        for (const group of menuGroups) {
            const item = group.items.find(i => location.pathname.startsWith(i.path));
            if (item) return item.label;
        }
        return 'Bảng điều khiển';
    };

    return (
        // Sử dụng h-screen và overflow-hidden ở wrapper ngoài cùng để cô lập thanh cuộn
        <div className="h-screen w-full bg-slate-50 flex overflow-hidden font-sans">
            
            {/* SIDEBAR */}
            <aside 
                className={`bg-[#0f172a] border-r border-slate-800 flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out relative z-20 shadow-2xl ${
                    isSidebarOpen ? 'w-64' : 'w-20'
                }`}
            >
                {/* Khu vực Logo */}
                <div className="h-16 flex items-center justify-center border-b border-slate-800/80 shrink-0 px-4">
                    <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
                        {/* Placeholder hình ảnh Logo - Bạn có thể thay src bằng logo thật sau này */}
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
                            {/* <img src="/path/to/your/logo.png" alt="Logo" className="w-full h-full object-contain" /> */}
                            <Hexagon size={24} className="text-white fill-white/20" />
                        </div>
                        
                        <span className={`text-lg font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 transition-all duration-300 ${
                            isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5 hidden'
                        }`}>
                            HUNGHUY
                        </span>
                    </div>
                </div>
                
                {/* Khung cuộn riêng của Menu */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-700/50 hover:[&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-track]:bg-transparent">
                    {menuGroups.map((group, idx) => (
                        <div key={idx} className="mb-6">
                            {/* Group Title (Hiển thị text hoặc dấu chấm nhỏ khi thu gọn) */}
                            <div className="px-5 mb-2 h-4 flex items-center">
                                {isSidebarOpen ? (
                                    <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                        {group.title}
                                    </h3>
                                ) : (
                                    <div className="w-4 h-[2px] bg-slate-700 mx-auto rounded-full"></div>
                                )}
                            </div>

                            <ul className="space-y-1 px-3">
                                {group.items.map((item) => {
                                    const isActive = location.pathname.startsWith(item.path);
                                    
                                    return (
                                        <li key={item.path}>
                                            <Link
                                                to={item.path}
                                                title={!isSidebarOpen ? item.label : ""}
                                                className={`group relative flex items-center py-2.5 px-3 rounded-xl transition-all duration-300 overflow-hidden ${
                                                    isActive
                                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/20'
                                                        : 'text-slate-400 hover:text-white'
                                                }`}
                                            >
                                                {/* Background trượt khi Hover */}
                                                {!isActive && (
                                                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out z-0"></div>
                                                )}
                                                
                                                {/* Vạch kẻ dọc mọc lên khi Hover */}
                                                {!isActive && (
                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-blue-400 rounded-r-md transition-all duration-300 group-hover:h-1/2 z-10"></div>
                                                )}

                                                <div className={`relative z-10 flex items-center justify-center shrink-0 transition-all duration-300 ${isSidebarOpen ? 'mr-3' : 'mx-auto'}`}>
                                                    {item.icon}
                                                </div>

                                                <span className={`relative z-10 text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                                                    isSidebarOpen ? 'opacity-100 translate-x-0 w-auto' : 'opacity-0 -translate-x-4 w-0 hidden'
                                                }`}>
                                                    {item.label}
                                                </span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Nút Đăng xuất */}
                <div className="p-4 border-t border-slate-800 shrink-0">
                    <button 
                        onClick={handleLogout} 
                        title={!isSidebarOpen ? "Đăng xuất" : ""}
                        className="group relative flex items-center w-full py-2.5 px-3 text-slate-400 hover:text-red-400 rounded-xl transition-all duration-300 overflow-hidden hover:bg-red-500/10"
                    >
                        <div className={`flex items-center justify-center shrink-0 transition-all duration-300 ${isSidebarOpen ? 'mr-3' : 'mx-auto'}`}>
                            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform duration-300" />
                        </div>
                        <span className={`text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                            isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 w-0 hidden'
                        }`}>
                            Đăng xuất
                        </span>
                    </button>
                </div>
            </aside>

            {/* KHU VỰC MAIN CONTENT */}
            <main className="flex-1 flex flex-col min-w-0 h-screen bg-slate-50 relative">
                
                {/* Header Topbar */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 z-10">
                    <div className="flex items-center gap-4">
                        {/* Nút 3 gạch có animation xoay/thu nhỏ nhẹ khi nhấn */}
                        <button 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-all duration-300 active:scale-95"
                        >
                            <Menu size={22} className={`transition-transform duration-500 ${isSidebarOpen ? 'rotate-0' : '-rotate-180'}`} />
                        </button>
                        <h2 className="text-lg font-bold text-slate-800">{getCurrentPageLabel()}</h2>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
                            <div className="w-9 h-9 bg-gradient-to-tr from-blue-100 to-blue-50 text-blue-600 border border-blue-200 rounded-full flex items-center justify-center font-bold shadow-sm">
                                A
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-sm font-bold text-slate-700 leading-none">Quản trị viên</p>
                                <p className="text-[11px] text-emerald-500 font-medium mt-1">Đang hoạt động</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Khu vực chứa nội dung các trang (Scroll độc lập) */}
                <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                    <Outlet />
                </div>
            </main>
            
        </div>
    );
};

export default AdminLayout;