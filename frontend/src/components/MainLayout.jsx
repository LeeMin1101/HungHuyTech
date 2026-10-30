import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
    ShoppingCart, User, Search, MapPin, ShieldCheck, 
    FileText, ChevronDown, Phone, Mail, Truck, RotateCcw,
    Server, Wifi, Monitor, Laptop, Printer, Headphones
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext'; 
import ThemeToggle from './ThemeToggle';

const MainLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const isAuthenticated = !!localStorage.getItem('accessToken');
    const { getCartTotalItems } = useCart();
    const cartCount = getCartTotalItems();

    const [activeMenu, setActiveMenu] = useState(null);
    const [isScrolled, setIsScrolled] = useState(false);

    // Kiểm tra xem có đang ở trang chủ hay không
    const isHome = location.pathname === '/';
    // Navbar chỉ trong suốt khi ở trang chủ VÀ chưa cuộn chuột
    const isTransparent = isHome && !isScrolled;

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        // Chạy một lần khi mount để cập nhật đúng trạng thái nếu load lại trang ở giữa chừng
        handleScroll(); 
        
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        navigate('/login');
    };

    const menuVariants = {
        hidden: { opacity: 0, y: 15, scale: 0.98, transition: { duration: 0.2 } },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" } }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-blue-200 selection:text-blue-900">
            
            {/* HEADER WRAPPER - Dynamic Sticky/Fixed dựa trên trang hiện tại */}
            <header className={`${isHome ? 'fixed' : 'sticky'} top-0 left-0 w-full z-50 transition-all duration-500 ${isTransparent ? 'bg-transparent' : 'bg-white shadow-md'}`}>
                
                {/* TOP BAR - Trượt ẩn đi khi scroll */}
                <div className={`hidden md:block transition-all duration-500 overflow-hidden ${isScrolled ? 'max-h-0 opacity-0' : 'max-h-16 opacity-100'} ${isTransparent ? 'bg-black/10 backdrop-blur-sm border-b border-white/10 text-white/90' : 'bg-slate-900 text-slate-300'}`}>
                    <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center text-[13px]">
                        <div className="flex items-center space-x-3">
                            <span className={`flex items-center gap-1.5 ${isTransparent ? 'text-white' : 'text-white'}`}>
                                <Phone size={14} className={isTransparent ? 'text-cyan-300' : 'text-blue-400'}/> Hotline: <strong className={isTransparent ? 'text-cyan-300' : 'text-blue-400'}>0336868880 - 0913767797</strong>
                            </span>
                            <span className={isTransparent ? 'text-white/40' : 'text-slate-600'}>|</span>
                            <span className="flex items-center gap-1.5">
                                <Mail size={14}/> hotro@hunghuy.net
                            </span>
                        </div>
                        <div className="flex items-center space-x-6">
                            <Link to="/he-thong-cua-hang" className={`flex items-center gap-1.5 transition-colors ${isTransparent ? 'hover:text-cyan-300' : 'hover:text-white'}`}><MapPin size={14}/> Trụ sở chính</Link>
                            <Link to="/orders" className={`flex items-center gap-1.5 transition-colors ${isTransparent ? 'hover:text-cyan-300' : 'hover:text-white'}`}><FileText size={14}/> Tra cứu đơn hàng</Link>
                            <Link to="/tra-cuu-bao-hanh" className={`flex items-center gap-1.5 transition-colors ${isTransparent ? 'hover:text-cyan-300' : 'hover:text-white'}`}><ShieldCheck size={14}/> Tra cứu bảo hành</Link>
                            <Link to="/lien-he" className={`flex items-center gap-1 transition-colors font-semibold ${isTransparent ? 'text-cyan-300 hover:text-cyan-200' : 'text-blue-400 hover:text-blue-300'}`}>
                                <Headphones size={14}/> Liên hệ hỗ trợ
                            </Link>
                        </div>
                    </div>
                </div>

                {/* MAIN HEADER */}
                <div className={`max-w-7xl mx-auto px-4 transition-all duration-300 flex items-center justify-between gap-8 ${isScrolled ? 'py-3' : 'py-4'}`}>
                    <Link to="/" className="flex-shrink-0 flex items-center">
                        <img 
                            src="/logo-phu.png" 
                            alt="Hùng Huy Technology Logo" 
                            className={`w-auto object-contain transition-all duration-500 ${isScrolled ? 'h-10' : 'h-14'} ${isTransparent ? 'brightness-0 invert drop-shadow-md' : ''}`} 
                        />
                    </Link>
                    
                    {/* Thanh tìm kiếm Glassmorphism */}
                    <div className="flex-1 max-w-2xl relative group hidden sm:block">
                        <div className={`absolute -inset-0.5 rounded-full blur opacity-0 group-hover:opacity-20 transition duration-500 ${isTransparent ? 'bg-gradient-to-r from-white to-cyan-300' : 'bg-gradient-to-r from-blue-500 to-cyan-400'}`}></div>
                        <div className={`relative flex items-center w-full rounded-full overflow-hidden transition-all duration-300 border ${
                            isTransparent 
                            ? 'bg-white/10 border-white/20 backdrop-blur-md focus-within:bg-white/20 focus-within:border-white/40' 
                            : 'bg-slate-50 border-slate-200 focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                        }`}>
                            <input 
                                type="text" 
                                placeholder="Nhập tên sản phẩm, mã linh kiện, model máy chủ..." 
                                className={`w-full bg-transparent py-2.5 pl-5 pr-12 outline-none text-sm transition-colors ${
                                    isTransparent ? 'text-white placeholder:text-white/70' : 'text-slate-700'
                                }`}
                            />
                            <button className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                                isTransparent ? 'bg-white/90 text-slate-800 hover:bg-white' : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}>
                                <Search size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 md:space-x-6 flex-shrink-0">
                        <ThemeToggle transparent={isTransparent} />
                        {isAuthenticated ? (
                            <div className="relative group cursor-pointer flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                    isTransparent ? 'bg-white/20 text-white backdrop-blur-md hover:bg-white/30' : 'bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600'
                                }`}>
                                    <User size={20} />
                                </div>
                                <div className="text-left text-sm hidden md:block">
                                    <p className={`font-bold transition-colors ${isTransparent ? 'text-white' : 'text-slate-800 group-hover:text-blue-600'}`}>Tài khoản</p>
                                    <p className={`text-xs font-medium flex items-center ${isTransparent ? 'text-white/80' : 'text-slate-500'}`}>Hồ sơ cá nhân <ChevronDown size={12} className="ml-0.5"/></p>
                                </div>
                                
                                {/* Dropdown Menu luôn là nền trắng để dễ đọc */}
                                <div className="absolute top-full right-0 pt-4 w-48 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 origin-top">
                                    <div className="bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden">
                                        <Link to="/profile" className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors">
                                            <User size={16} /> Quản lý tài khoản
                                        </Link>
                                        <button onClick={handleLogout} className="w-full text-left flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors border-t border-slate-50">
                                            <RotateCcw size={16} /> Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Link 
                                to="/login" 
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 font-bold text-sm shadow-sm ${
                                    isTransparent ? 'bg-white/20 text-white hover:bg-white hover:text-slate-900 backdrop-blur-md' : 'bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white hover:shadow-md'
                                }`}
                            >
                                <User size={18} />
                                Đăng nhập
                            </Link>
                        )}

                        <Link to="/cart" id="cart-icon" className="flex items-center gap-3 group">
                            <div className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                isTransparent ? 'bg-white/20 text-white backdrop-blur-md group-hover:bg-white/30' : 'bg-blue-50 group-hover:bg-blue-600'
                            }`}>
                                <ShoppingCart size={20} className={isTransparent ? 'text-white' : 'text-blue-600 group-hover:text-white transition-colors'}/>
                                {cartCount > 0 && (
                                    <motion.span 
                                        initial={{ scale: 0 }} animate={{ scale: 1 }} 
                                        className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-md border-2 border-white"
                                    >
                                        {cartCount}
                                    </motion.span>
                                )}
                            </div>
                            <div className="text-left text-sm hidden md:block">
                                <p className={`font-bold transition-colors ${isTransparent ? 'text-white' : 'text-slate-800 group-hover:text-blue-600'}`}>Giỏ hàng</p>
                                <p className={`text-xs font-bold ${isTransparent ? 'text-cyan-300' : 'text-blue-600'}`}>{cartCount} sản phẩm</p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* BOTTOM MENU BAR */}
                <div className={`hidden lg:block relative transition-all duration-300 border-t backdrop-blur-md ${isTransparent ? 'border-white/20 bg-black/10 text-white' : 'border-slate-100 bg-white text-slate-700'}`}>
                    <div className="max-w-7xl mx-auto px-4 flex items-center gap-8 text-sm font-bold py-3 relative">
                        
                        <div 
                            className="relative cursor-pointer"
                            onMouseEnter={() => setActiveMenu('laptop')}
                            onMouseLeave={() => setActiveMenu(null)}
                        >
                            <Link to="/search?category=laptop" className={`flex items-center gap-2 py-2 transition-colors ${activeMenu === 'laptop' ? (isTransparent ? 'text-cyan-300' : 'text-blue-600') : (isTransparent ? 'hover:text-cyan-300' : 'hover:text-blue-600')}`}>
                                <Laptop size={18} /> Laptop & PC <ChevronDown size={14} className={`transition-transform duration-300 ${activeMenu === 'laptop' ? 'rotate-180' : ''}`}/>
                            </Link>
                            
                            <AnimatePresence>
                                {activeMenu === 'laptop' && (
                                    <motion.div 
                                        variants={menuVariants} initial="hidden" animate="visible" exit="hidden"
                                        className="absolute left-0 top-full mt-1 w-[800px] bg-white text-slate-800 border border-slate-100 shadow-2xl rounded-2xl z-50 flex overflow-hidden"
                                    >
                                        <div className="flex-1 p-8 grid grid-cols-2 gap-10">
                                            <div>
                                                <h3 className="text-blue-600 font-black uppercase text-xs tracking-widest mb-5">THƯƠNG HIỆU ĐỐI TÁC</h3>
                                                <ul className="space-y-4 font-semibold text-slate-600 text-sm">
                                                    <li><Link to="/search?category=laptop&brand=dell" className="hover:text-blue-600 flex items-center gap-2 transition-colors"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>Dell Technologies</Link></li>
                                                    <li><Link to="/search?category=laptop&brand=hp" className="hover:text-blue-600 flex items-center gap-2 transition-colors"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>HP (Hewlett-Packard)</Link></li>
                                                    <li><Link to="/search?category=laptop&brand=asus" className="hover:text-blue-600 flex items-center gap-2 transition-colors"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>ASUS</Link></li>
                                                    <li><Link to="/search?category=laptop&brand=acer" className="hover:text-blue-600 flex items-center gap-2 transition-colors"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>Acer</Link></li>
                                                    <li><Link to="/search?category=laptop&brand=lenovo" className="hover:text-blue-600 flex items-center gap-2 transition-colors"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>Lenovo</Link></li>
                                                    <li><Link to="/search?category=laptop&brand=msi" className="hover:text-blue-600 flex items-center gap-2 transition-colors"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>MSI</Link></li>
                                                </ul>
                                            </div>
                                            <div>
                                                <h3 className="text-blue-600 font-black uppercase text-xs tracking-widest mb-5">THEO NHU CẦU</h3>
                                                <ul className="space-y-4 font-semibold text-slate-600 text-sm">
                                                    <li><Link to="/search?category=laptop&type=van-phong" className="hover:text-blue-600 transition-colors">Laptop Doanh nghiệp - Văn phòng</Link></li>
                                                    <li><Link to="/search?category=laptop&type=gaming" className="hover:text-blue-600 transition-colors">Laptop Gaming đồ họa</Link></li>
                                                    <li><Link to="/search?category=pc&type=workstation" className="hover:text-blue-600 transition-colors">PC Workstation</Link></li>
                                                    <li><Link to="/search?category=pc&type=dong-bo" className="hover:text-blue-600 transition-colors">Máy tính đồng bộ</Link></li>
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="w-[300px] bg-slate-50 p-8 border-l border-slate-100 flex flex-col justify-center">
                                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 text-blue-600"><Monitor size={24}/></div>
                                            <h3 className="text-lg font-black text-slate-900 mb-2">Build PC Chuyên Nghiệp</h3>
                                            <p className="text-slate-500 text-sm font-medium mb-6">Lắp ráp PC theo yêu cầu doanh nghiệp và cá nhân với linh kiện chính hãng.</p>
                                            <Link to="/build-pc" className="bg-blue-600 text-white text-center py-2.5 rounded-full font-bold hover:bg-blue-700 transition-colors">Xây dựng cấu hình</Link>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <Link to="/search?category=server" className={`flex items-center gap-1.5 py-2 transition-colors ${isTransparent ? 'hover:text-cyan-300' : 'hover:text-blue-600'}`}><Server size={18} /> Máy chủ (Server)</Link>
                        <Link to="/search?category=thiet-bi-mang" className={`flex items-center gap-1.5 py-2 transition-colors ${isTransparent ? 'hover:text-cyan-300' : 'hover:text-blue-600'}`}><Wifi size={18} /> Thiết bị mạng</Link>
                        <Link to="/search?category=may-van-phong" className={`flex items-center gap-1.5 py-2 transition-colors ${isTransparent ? 'hover:text-cyan-300' : 'hover:text-blue-600'}`}><Printer size={18} /> Máy văn phòng</Link>
                        <Link to="/search?category=linh-kien" className={`py-2 transition-colors ${isTransparent ? 'hover:text-cyan-300' : 'hover:text-blue-600'}`}>Linh & Phụ kiện</Link>
                        <Link to="/search?category=smart-devices" className={`py-2 transition-colors ${isTransparent ? 'hover:text-cyan-300' : 'hover:text-blue-600'}`}>Thiết bị thông minh</Link>
                        
                        <div className="ml-auto flex items-center gap-3">
                            <Link to="/about" className={`px-4 py-2 rounded-full transition-colors flex items-center gap-2 ${
                                isTransparent ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white'
                            }`}>
                                Về chúng tôi
                            </Link>

                            <Link 
                                to="/lien-he" 
                                className={`relative flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all ${
                                    isTransparent ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-900 shadow-[0_0_15px_rgba(34,211,238,0.4)]' : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5'
                                }`}
                            >
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>
                                <Headphones size={16} /> Liên hệ
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow flex flex-col">
                <Outlet />
            </main>

            <footer className="bg-white border-t border-slate-200 mt-12 pt-10 pb-6 relative z-10">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-b border-slate-100 mb-10">
                        <div className="flex flex-col items-center text-center gap-3">
                            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center text-blue-600"><ShieldCheck size={28} /></div>
                            <span className="text-sm font-bold text-slate-700">100% Chính hãng</span>
                        </div>
                        <div className="flex flex-col items-center text-center gap-3">
                            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center text-blue-600"><Server size={28} /></div>
                            <span className="text-sm font-bold text-slate-700">Triển khai dự án</span>
                        </div>
                        <div className="flex flex-col items-center text-center gap-3">
                            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center text-blue-600"><Truck size={28} /></div>
                            <span className="text-sm font-bold text-slate-700">Giao hàng toàn quốc</span>
                        </div>
                        <div className="flex flex-col items-center text-center gap-3">
                            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center text-blue-600"><RotateCcw size={28} /></div>
                            <span className="text-sm font-bold text-slate-700">Bảo hành nhanh chóng</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-8">
                        <div className="lg:col-span-2">
                            <img 
                                src="/logo-chinh.png" 
                                alt="Hùng Huy Technology Logo" 
                                className="h-12 w-auto mb-6 object-contain origin-left" 
                            />
                            <p className="text-sm text-slate-600 mb-6 leading-relaxed font-medium">
                                Công ty Cổ Phần Công Nghệ Hùng Huy chuyên cung cấp các giải pháp, thiết bị công nghệ chính hãng: Laptop, Máy chủ (Server), Thiết bị mạng và Máy văn phòng.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><Phone size={16}/></div>
                                    <span><strong>0336868880</strong> - <strong>0913767797</strong></span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><Mail size={16}/></div>
                                    <span>hotro@hunghuy.net</span>
                                </div>
                                <div className="flex items-start gap-3 text-slate-600 text-sm font-medium">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0"><MapPin size={16}/></div>
                                    <span className="pt-1.5">4 Lô C, KP3, P. Tam Bình, TP. Thủ Đức, TP.HCM</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-black text-slate-900 uppercase text-sm mb-5 tracking-wider">SẢN PHẨM</h3>
                            <ul className="space-y-3 text-sm text-slate-600 font-medium">
                                <li><Link to="/search?category=laptop" className="hover:text-blue-600 transition-colors">Máy tính Laptop</Link></li>
                                <li><Link to="/search?category=server" className="hover:text-blue-600 transition-colors">Máy chủ (Server)</Link></li>
                                <li><Link to="/search?category=thiet-bi-mang" className="hover:text-blue-600 transition-colors">Thiết bị mạng</Link></li>
                                <li><Link to="/search?category=may-van-phong" className="hover:text-blue-600 transition-colors">Máy văn phòng</Link></li>
                                <li><Link to="/search?category=linh-kien" className="hover:text-blue-600 transition-colors">Linh kiện & Phụ kiện</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-black text-slate-900 uppercase text-sm mb-5 tracking-wider">DOANH NGHIỆP</h3>
                            <ul className="space-y-3 text-sm text-slate-600 font-medium">
                                <li><Link to="/giai-phap-server" className="hover:text-blue-600 transition-colors">Giải pháp Server</Link></li>
                                <li><Link to="/ha-tang-mang" className="hover:text-blue-600 transition-colors">Hạ tầng mạng Cisco/Aruba</Link></li>
                                <li><Link to="/phong-may" className="hover:text-blue-600 transition-colors">Hệ thống phòng máy</Link></li>
                                <li><Link to="/bao-tri" className="hover:text-blue-600 transition-colors">Bảo trì hệ thống CNTT</Link></li>
                            </ul>
                        </div>

                        <div className="lg:col-span-2">
                            <h3 className="font-black text-slate-900 uppercase text-sm mb-5 tracking-wider">HỖ TRỢ KHÁCH HÀNG</h3>
                            <ul className="space-y-3 text-sm text-slate-600 font-medium">
                                <li><Link to="/lien-he" className="text-blue-600 font-bold hover:underline">Gửi yêu cầu hỗ trợ / Tư vấn</Link></li>
                                <li><Link to="/chinh-sach-bao-hanh" className="hover:text-blue-600 transition-colors">Chính sách bảo hành</Link></li>
                                <li><Link to="/chinh-sach-giao-hang" className="hover:text-blue-600 transition-colors">Chính sách giao hàng</Link></li>
                                <li><Link to="/tra-cuu-bao-hanh" className="hover:text-blue-600 transition-colors">Trung tâm tiếp nhận bảo hành</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-slate-200 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-500">
                        <p>© 2026 Công Ty Cổ Phần Công Nghệ Hùng Huy. Giấy chứng nhận ĐKDN: 0316842958.</p>
                        <p>Thanh toán: Visa - Mastercard - QR - Chuyển khoản ngân hàng</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;