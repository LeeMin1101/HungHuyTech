import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../utils/axiosClient';
import { 
    Monitor, Laptop, Cpu, Headphones, Wifi, Server, Printer, MonitorPlay, Zap, 
    ArrowRight, ShieldCheck, ThumbsUp, Users, Lightbulb, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import HeroBanner from '../components/HeroBanner';
import ProductCard from '../components/ProductCard';
import BrandCarousel from '../components/BrandCarousel';

const Home = () => {
    const navigate = useNavigate();
    const [allProducts, setAllProducts] = useState([]);
    
    // State quản lý sản phẩm
    const [hotProducts, setHotProducts] = useState([]);
    const [laptopProducts, setLaptopProducts] = useState([]);
    const [pcProducts, setPcProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // State tab
    const [activeLaptopTab, setActiveLaptopTab] = useState('Laptop sinh viên');
    const [activePcTab, setActivePcTab] = useState('PC văn phòng');

    // === NEW: State quản lý hiệu ứng bay vào giỏ hàng ===
    const [flyingItems, setFlyingItems] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axiosClient.get('/products');
                const productData = response?.data?.content || response?.data || response || [];
                const productsArray = Array.isArray(productData) ? productData : [];
                
                setAllProducts(productsArray);
                setHotProducts(productsArray.filter(p => p.isFeatured).slice(0, 5));
                
                filterLaptopProducts(productsArray, 'Laptop sinh viên');
                filterPcProducts(productsArray, 'PC văn phòng');
                
            } catch (error) {
                console.error("Lỗi khi tải sản phẩm:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const filterLaptopProducts = (productsList, tabName) => {
        setActiveLaptopTab(tabName);
        let filtered = [];
        const laptops = productsList.filter(p => p.categoryName?.toLowerCase().includes('laptop') || p.name?.toLowerCase().includes('laptop'));

        switch(tabName) {
            case 'Laptop sinh viên':
            case 'Laptop văn phòng':
                filtered = laptops.filter(p => p.minPrice <= 20000000); 
                break;
            case 'Gaming':
                filtered = laptops.filter(p => p.name?.toLowerCase().includes('gaming') || p.categoryName?.toLowerCase().includes('gaming'));
                break;
            case 'Đồ họa':
                filtered = laptops.filter(p => p.minPrice > 20000000); 
                break;
            case 'ASUS': case 'ACER': case 'LENOVO': case 'DELL': case 'HP':
                const searchBrand = tabName.toLowerCase();
                filtered = laptops.filter(p => p.brandName?.toLowerCase().includes(searchBrand) || p.name?.toLowerCase().includes(searchBrand));
                break;
            default: filtered = laptops;
        }
        setLaptopProducts(filtered.slice(0, 10));
    };

    const filterPcProducts = (productsList, tabName) => {
        setActivePcTab(tabName);
        let filtered = [];
        const pcsAndMonitors = productsList.filter(p => 
            p.categoryName?.toLowerCase().includes('pc') || p.categoryName?.toLowerCase().includes('màn hình') ||
            p.name?.toLowerCase().includes('pc') || p.name?.toLowerCase().includes('màn hình')
        );

        if(tabName.includes('PC')) {
            filtered = pcsAndMonitors.filter(p => p.categoryName?.toLowerCase().includes('pc') || p.name?.toLowerCase().includes('pc'));
        } else if (tabName.includes('Màn hình')) {
            filtered = pcsAndMonitors.filter(p => p.categoryName?.toLowerCase().includes('màn hình') || p.name?.toLowerCase().includes('màn hình'));
        }
        setPcProducts(filtered.slice(0, 10));
    };

    const handleCategorySearch = (keyword) => navigate(`/search?q=${encodeURIComponent(keyword)}`);

    // === NEW: Hàm xử lý khi bấm nút thêm vào giỏ hàng ===
    const handleAddToCart = (e, product, imageRect) => {
        // 1. Tìm vị trí của icon giỏ hàng trên Header (Header phải có id="cart-icon")
        const cartIcon = document.getElementById('cart-icon'); 
        
        if (!cartIcon || !imageRect) return;

        const cartRect = cartIcon.getBoundingClientRect();

        // 2. Tạo object chứa thông tin ảnh bay
        const newItem = {
            id: new Date().getTime(), // ID duy nhất
            img: product.primaryImageUrl || 'https://via.placeholder.com/150', // Đổi field ảnh theo data của bạn
            startX: imageRect.left,
            startY: imageRect.top,
            endX: cartRect.left + (cartRect.width / 2) - 20, // -20 để căn giữa ảnh nhỏ
            endY: cartRect.top + (cartRect.height / 2) - 20,
            width: imageRect.width,
        };

        // 3. Thêm vào mảng để render
        setFlyingItems(prev => [...prev, newItem]);

        // 4. Xóa item khỏi mảng sau khi animation kết thúc (800ms)
        setTimeout(() => {
            setFlyingItems(prev => prev.filter(item => item.id !== newItem.id));
            // TODO: Chỗ này bạn có thể gọi API thêm vào giỏ hàng thật trong Database hoặc Redux/Context
            console.log("Đã thêm vào giỏ:", product.name);
        }, 800);
    };

    // --- CẤU HÌNH ANIMATION ---
    const fadeInUp = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    // --- DỮ LIỆU ---
    const categories = [
        { name: 'Laptop', icon: <Laptop strokeWidth={1.2} size={34} /> },
        { name: 'Máy chủ (Server)', icon: <Server strokeWidth={1.2} size={34} /> },
        { name: 'Thiết bị mạng', icon: <Wifi strokeWidth={1.2} size={34} /> },
        { name: 'Máy văn phòng', icon: <Printer strokeWidth={1.2} size={34} /> },
        { name: 'PC & Workstation', icon: <Monitor strokeWidth={1.2} size={34} /> },
        { name: 'Màn hình', icon: <MonitorPlay strokeWidth={1.2} size={34} /> },
        { name: 'Linh kiện', icon: <Cpu strokeWidth={1.2} size={34} /> },
        { name: 'Phụ kiện', icon: <Headphones strokeWidth={1.2} size={34} /> },
    ];

    const coreValues = [
        { title: 'HƯỚNG ĐẾN KHÁCH HÀNG', desc: 'Trải nghiệm công nghệ hoàn hảo', icon: <ThumbsUp size={30} className="text-blue-500" /> },
        { title: 'ĐẦU TƯ CON NGƯỜI', desc: 'Nền tảng của sự phát triển', icon: <Users size={30} className="text-blue-500" /> },
        { title: 'ĐỔI MỚI VÀ SÁNG TẠO', desc: 'Dẫn đầu xu hướng công nghệ', icon: <Lightbulb size={30} className="text-blue-500" /> },
        { title: 'TRUNG THỰC LIÊM CHÍNH', desc: 'Minh bạch trong mọi giao dịch', icon: <CheckCircle size={30} className="text-blue-500" /> },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen font-sans text-slate-800 selection:bg-blue-200 selection:text-blue-900 overflow-hidden relative">
            
            {/* HERO BANNER */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="max-w-[1400px] mx-auto px-4 pt-6 mb-12">
                <HeroBanner />
            </motion.div>

            {/* DANH MỤC SẢN PHẨM */}
            <motion.section variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="max-w-7xl mx-auto px-4 mb-16">
                <motion.div variants={fadeInUp} className="text-center mb-10">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">DANH MỤC SẢN PHẨM</h2>
                    <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-cyan-400 mx-auto mt-4 rounded-full"></div>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
                    {categories.map((cat, index) => (
                        <motion.div variants={fadeInUp} key={index} onClick={() => handleCategorySearch(cat.name)} className="flex flex-col items-center justify-center cursor-pointer group">
                            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-slate-400 mb-4 transition-all duration-500 shadow-sm border border-slate-100 group-hover:shadow-[0_8px_25px_rgba(37,99,235,0.15)] group-hover:-translate-y-2 group-hover:text-blue-600 group-hover:border-blue-100 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <span className="relative z-10">{cat.icon}</span>
                            </div>
                            <span className="text-sm font-semibold text-slate-600 group-hover:text-blue-600 transition-colors text-center">{cat.name}</span>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* ƯU ĐÃI GIỚI HẠN */}
            <motion.section variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="max-w-7xl mx-auto px-4 mb-16">
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-indigo-50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-100/60 to-blue-50/50 rounded-full blur-3xl -z-10 transform translate-x-1/3 -translate-y-1/3 group-hover:scale-110 transition-transform duration-1000"></div>
                    
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 relative z-10">
                        <div>
                            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 flex items-center gap-2 tracking-tight">
                                <Zap className="text-indigo-500" fill="currentColor" size={32}/> ƯU ĐÃI NỔI BẬT
                            </h2>
                            <p className="text-slate-500 mt-2 font-medium">Sản phẩm công nghệ tiên tiến với mức giá tốt nhất</p>
                        </div>
                    </div>

                    {hotProducts.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5 relative z-10">
                            {hotProducts.map((product, index) => (
                                // Truyền hàm handleAddToCart xuống ProductCard
                                <ProductCard key={`hot-${product.id}`} product={product} index={index} onAddToCart={handleAddToCart} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-slate-500">Đang cập nhật các ưu đãi mới nhất.</p>
                        </div>
                    )}
                </div>
            </motion.section>

            {/* SẢN PHẨM LAPTOP */}
            <motion.section variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="max-w-7xl mx-auto px-4 mb-20">
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-slate-200 pb-4 gap-4">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">LAPTOP CHÍNH HÃNG</h2>
                    
                    <div className="flex gap-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
                        {['Laptop sinh viên', 'Laptop văn phòng', 'Gaming', 'Đồ họa', 'ASUS', 'DELL', 'HP'].map((tab) => (
                            <button 
                                key={tab} 
                                onClick={() => filterLaptopProducts(allProducts, tab)}
                                className={`text-base font-bold transition-colors relative pb-3 ${activeLaptopTab === tab ? 'text-blue-600' : 'text-slate-400 hover:text-slate-700'}`}
                            >
                                {tab}
                                {activeLaptopTab === tab && (
                                    <motion.div layoutId="activeLaptopTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {laptopProducts.length > 0 ? (
                    <motion.div layout className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
                        {laptopProducts.map((product, index) => (
                            // Truyền hàm handleAddToCart xuống ProductCard
                            <ProductCard key={`lap-${product.id}`} product={product} index={index} onAddToCart={handleAddToCart} /> 
                        ))}
                    </motion.div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <p className="text-slate-400 font-medium">Đang cập nhật sản phẩm.</p>
                    </div>
                )}
            </motion.section>

            {/* SẢN PHẨM PC & MÀN HÌNH */}
            <motion.section variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="max-w-7xl mx-auto px-4 mb-24">
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-slate-200 pb-4 gap-4">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">PC & MÀN HÌNH</h2>
                    
                    <div className="flex gap-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
                        {['PC văn phòng', 'PC gaming', 'PC đồ họa', 'Màn hình 24"', 'Màn hình 27"', 'Màn hình gaming'].map((tab) => (
                            <button 
                                key={tab} 
                                onClick={() => filterPcProducts(allProducts, tab)}
                                className={`text-base font-bold transition-colors relative pb-3 ${activePcTab === tab ? 'text-blue-600' : 'text-slate-400 hover:text-slate-700'}`}
                            >
                                {tab}
                                {activePcTab === tab && (
                                    <motion.div layoutId="activePcTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {pcProducts.length > 0 ? (
                    <motion.div layout className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
                        {pcProducts.map((product, index) => (
                             // Truyền hàm handleAddToCart xuống ProductCard
                            <ProductCard key={`pc-${product.id}`} product={product} index={index} onAddToCart={handleAddToCart} /> 
                        ))}
                    </motion.div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <p className="text-slate-400 font-medium">Đang cập nhật sản phẩm.</p>
                    </div>
                )}
            </motion.section>

             {/* B2B ENTERPRISE SOLUTIONS */}
             <motion.section variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="bg-white py-24 mb-20 relative overflow-hidden border-y border-slate-200/60 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.03)]">
                {/* Họa tiết lưới công nghệ (Tech Grid) mờ nhạt làm nền */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-bl from-blue-50/80 to-transparent rounded-bl-[100%] z-0 pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-16 relative z-10">
                    {/* TEXT B2B */}
                    <div className="lg:w-1/2">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-bold tracking-widest uppercase text-xs mb-6 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                            Hùng Huy Enterprise
                        </div>

                        <h2 className="text-4xl lg:text-5xl font-black mb-6 leading-tight tracking-tight text-slate-900">
                            GIẢI PHÁP CÔNG NGHỆ <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">CHO DOANH NGHIỆP</span>
                        </h2>

                        <p className="text-slate-600 text-lg mb-10 leading-relaxed font-medium">
                            Đồng hành cùng sự phát triển của doanh nghiệp, Hùng Huy cung cấp giải pháp toàn diện về tư vấn, cung cấp và triển khai Server, Hạ tầng mạng, Hệ thống phòng máy và Dịch vụ bảo trì CNTT chuyên nghiệp.
                        </p>

                        <div className="grid grid-cols-2 gap-y-5 gap-x-6 mb-10">
                            {['Server & Lưu trữ', 'Hạ tầng mạng', 'Phòng máy tính', 'Thiết bị văn phòng', 'Giải pháp an ninh', 'Bảo trì hệ thống'].map((service, idx) => (
                                <div key={idx} className="flex items-center gap-3 group cursor-default">
                                    <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:border-blue-400 group-hover:bg-blue-50 group-hover:shadow-[0_0_10px_rgba(59,130,246,0.2)] transition-all shrink-0">
                                        <CheckCircle size={14} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                                    </div>
                                    <span className="text-slate-700 font-semibold text-sm group-hover:text-blue-700 transition-colors">{service}</span>
                                </div>
                            ))}
                        </div>

                        <Link to="/lien-he-b2b" className="group inline-flex items-center gap-3 bg-slate-900 text-white font-bold py-4 px-8 rounded-full hover:bg-blue-600 transition-all duration-300 shadow-lg hover:shadow-blue-600/40">
                            ĐĂNG KÝ TƯ VẤN DỰ ÁN <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {/* ẢNH B2B */}
                    <div className="lg:w-1/2 w-full mt-10 lg:mt-0">
                        <div className="relative max-w-lg mx-auto">
                            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-200 to-cyan-100 rounded-[2.5rem] transform rotate-3 -z-10 transition-transform duration-700"></div>
                            
                            <div className="rounded-[2rem] overflow-hidden shadow-2xl bg-white p-2 border border-white relative z-10 group cursor-pointer">
                                <img 
                                    src="public/about.png" 
                                    alt="Hồ sơ năng lực Công ty Hùng Huy" 
                                    className="w-full h-auto object-cover rounded-[1.5rem] group-hover:scale-[1.03] transition-transform duration-700 ease-out" 
                                />
                                <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/10 transition-colors duration-700 rounded-[1.5rem] pointer-events-none"></div>
                            </div>

                            <div className="absolute -bottom-6 -left-4 md:-left-8 bg-white py-3 px-6 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4 hover:-translate-y-2 transition-transform duration-500 z-20">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 text-white rounded-full flex items-center justify-center shadow-inner">
                                    <ShieldCheck size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Đối tác tin cậy</p>
                                    <p className="text-slate-900 font-black text-base md:text-lg">B2B Solutions</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* GIÁ TRỊ CỐT LÕI */}
            <motion.section variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="bg-white py-20 border-y border-slate-200/60 shadow-sm relative z-10">
                {/* ... (Giữ nguyên như code cũ) ... */}
            </motion.section>

            {/* ĐỐI TÁC CHIẾN LƯỢC */}
            <section className="py-12 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">ĐỐI TÁC CÔNG NGHỆ HÀNG ĐẦU</h3>
                    <BrandCarousel />
                </div>
            </section>

            {/* === RENDER CÁC HÌNH ẢNH ĐANG BAY CHỒNG LÊN UI === */}
            <AnimatePresence>
                {flyingItems.map(item => (
                    <motion.img
                        key={item.id}
                        src={item.img}
                        initial={{ 
                            x: item.startX, 
                            y: item.startY, 
                            scale: 1, 
                            opacity: 0.8,
                            width: item.width // Lấy đúng kích thước ảnh gốc
                        }}
                        animate={{ 
                            x: item.endX, 
                            y: item.endY, 
                            scale: 0.1, // Thu nhỏ khi bay vào giỏ
                            opacity: 0 
                        }}
                        transition={{ 
                            duration: 0.8, 
                            type: 'spring', // Giúp bay mượt và có độ nảy nhẹ
                            bounce: 0.2
                        }}
                        style={{
                            position: 'fixed', // Fixed để bay xuyên qua các phần tử overflow
                            zIndex: 9999,
                            pointerEvents: 'none', // Không chặn thao tác chuột
                            objectFit: 'cover',
                            borderRadius: '8px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                        }}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

export default Home;