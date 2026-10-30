import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../utils/axiosClient';
import { 
    Monitor, Laptop, Cpu, Headphones, Wifi, Server, Printer, MonitorPlay, Zap, 
    ArrowRight, ShieldCheck, ThumbsUp, Users, Lightbulb, CheckCircle,
    Newspaper, Clock, ChevronRight, Image as ImageIcon, Play, Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import BrandCarousel from '../components/BrandCarousel';

// Component con phụ trợ để đếm ngược thời gian Deal Hot
const FlashSaleTimer = ({ endTime }) => {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        if (!endTime) return;
        const targetTime = new Date(endTime).getTime();

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const difference = targetTime - now;

            if (difference > 0) {
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);
                setTimeLeft({ hours, minutes, seconds });
            } else {
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [endTime]);

    return (
        <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-white">
            <span className="bg-slate-900 px-2.5 py-1 rounded-lg">{String(timeLeft.hours).padStart(2, '0')}</span> :
            <span className="bg-slate-900 px-2.5 py-1 rounded-lg">{String(timeLeft.minutes).padStart(2, '0')}</span> :
            <span className="bg-slate-900 px-2.5 py-1 rounded-lg">{String(timeLeft.seconds).padStart(2, '0')}</span>
        </div>
    );
};

const Home = () => {
    const navigate = useNavigate();
    
    const [allProducts, setAllProducts] = useState([]);
    const [hotProducts, setHotProducts] = useState([]);
    const [flashSaleProducts, setFlashSaleProducts] = useState([]); // State chứa sản phẩm Deal Hot / Flash Sale
    const [laptopProducts, setLaptopProducts] = useState([]);
    const [pcProducts, setPcProducts] = useState([]);
    const [latestBlogs, setLatestBlogs] = useState([]);
    const [promoBanners, setPromoBanners] = useState([]);
    
    // State quản lý Hero Video từ Admin
    const [heroVideo, setHeroVideo] = useState({
        videoUrl: 'https://cdn.pixabay.com/video/2020/08/13/47047-449410168_large.mp4', 
        title: 'KIẾN TẠO TƯƠNG LAI',
        highlight: 'SỨC MẠNH VƯỢT TRỘI',
        description: 'Khám phá kỷ nguyên công nghệ mới với các giải pháp máy tính hiệu năng cao từ Hùng Huy Enterprise. Thiết kế tinh tế, sức mạnh bứt phá.',
        targetLink: '/products'
    });
    
    const [loading, setLoading] = useState(true);
    const [activeLaptopTab, setActiveLaptopTab] = useState('Laptop sinh viên');
    const [activePcTab, setActivePcTab] = useState('PC văn phòng');
    const [flyingItems, setFlyingItems] = useState([]);

    useEffect(() => {
        const fetchHomeData = async () => {
            setLoading(true);
            try {
                const [productRes, blogRes, bannerRes, heroRes] = await Promise.all([
                    axiosClient.get('/products').catch(() => null),
                    axiosClient.get('/blogs').catch(() => null),
                    axiosClient.get('/banners').catch(() => null),
                    axiosClient.get('/banners/hero-video').catch(() => null)
                ]);
                
                if (productRes) {
                    const rawProductData = productRes?.data?.content || productRes?.data || productRes;
                    const productsArray = Array.isArray(rawProductData) ? rawProductData : [];
                    setAllProducts(productsArray);
                    
                    setHotProducts(productsArray.filter(p => p.isFeatured).slice(0, 5));
                    
                    // Lọc sản phẩm Flash Sale / Deal sốc từ Admin (isFlashSale === true)
                   const flashSales = productsArray.filter(p => p.isFlashSale === true);
                        setFlashSaleProducts(flashSales);

                    filterLaptopProducts(productsArray, 'Laptop sinh viên');
                    filterPcProducts(productsArray, 'PC văn phòng');
                }

                if (blogRes) {
                    const rawBlogData = blogRes?.data?.data || blogRes?.data?.content || blogRes?.data || blogRes;
                    const blogArray = Array.isArray(rawBlogData) ? rawBlogData : [];
                    const publishedBlogs = blogArray
                        .filter(b => b.status === 'PUBLISHED')
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                    setLatestBlogs(publishedBlogs.slice(0, 3));
                }

                if (bannerRes) {
                    const rawBannerData = bannerRes?.data?.data || bannerRes?.data || bannerRes;
                    const bannerArray = Array.isArray(rawBannerData) ? rawBannerData : [];
                    setPromoBanners(bannerArray);
                }

                const heroData = heroRes?.data?.data ?? heroRes?.data ?? heroRes;
                if (heroData && typeof heroData === 'object' && !Array.isArray(heroData)) {
                    const videoUrl = heroData.videoUrl?.trim() || heroData.imageUrl?.trim();
                    if (videoUrl) {
                        setHeroVideo(prev => ({
                            ...prev,
                            title: heroData.title || prev.title,
                            highlight: heroData.highlight || prev.highlight,
                            description: heroData.description || prev.description,
                            targetLink: heroData.targetLink || prev.targetLink,
                            videoUrl
                        }));
                    }
                }
                
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu trang chủ:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHomeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const handleAddToCart = (e, product, imageRect) => {
        const cartIcon = document.getElementById('cart-icon'); 
        if (!cartIcon || !imageRect) return;

        const cartRect = cartIcon.getBoundingClientRect();
        const newItem = {
            id: new Date().getTime(),
            img: product.primaryImageUrl || 'https://via.placeholder.com/150',
            startX: imageRect.left,
            startY: imageRect.top,
            endX: cartRect.left + (cartRect.width / 2) - 20,
            endY: cartRect.top + (cartRect.height / 2) - 20,
            width: imageRect.width,
        };

        setFlyingItems(prev => [...prev, newItem]);
        setTimeout(() => {
            setFlyingItems(prev => prev.filter(item => item.id !== newItem.id));
        }, 800);
    };

    const fadeInUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } };
    const staggerContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };

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
            
            {/* HERO VIDEO BANNER */}
            <section className="relative w-full min-h-[70vh] md:aspect-video bg-slate-950 flex flex-col justify-center overflow-hidden shadow-2xl mb-16">
                <video
                    key={heroVideo.videoUrl}
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 w-full h-full opacity-70 object-cover"
                >
                    <source src={heroVideo.videoUrl} />
                </video>

                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none"></div>

                <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 flex flex-col text-left pt-28 md:pt-40 pb-12">
                    <motion.div 
                        initial={{ opacity: 0, y: 40 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="max-w-2xl"
                    >
                        <span className="inline-block py-1 px-3.5 rounded-full bg-blue-500/10 border border-blue-400/20 backdrop-blur-md text-blue-300 font-semibold tracking-[0.2em] uppercase text-[10px] md:text-xs mb-4 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                            Công nghệ dẫn bước tương lai
                        </span>
                        
                        <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] mb-4 drop-shadow-xl">
                            {heroVideo.title} <br /> 
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 drop-shadow-none">
                                {heroVideo.highlight}
                            </span>
                        </h1>
                        
                        <p className="text-slate-200 text-sm md:text-lg mb-8 md:mb-10 font-medium leading-relaxed drop-shadow max-w-xl hidden sm:block">
                            {heroVideo.description}
                        </p>
                        
                        <div className="flex flex-row gap-3 md:gap-5">
                            <Link to={heroVideo.targetLink || '/products'} className="group bg-blue-600/90 hover:bg-blue-500 backdrop-blur-sm text-white px-5 md:px-8 py-3.5 md:py-4 rounded-full font-bold transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] flex items-center justify-center gap-2 md:gap-3 text-sm md:text-base border border-blue-400/30">
                                Khám phá ngay <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/lien-he" className="group bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 md:px-8 py-3.5 md:py-4 rounded-full font-bold transition-all duration-300 flex items-center justify-center gap-2 md:gap-3 text-sm md:text-base">
                                <Play size={18} className="fill-white/60 group-hover:fill-white transition-colors" /> 
                                <span className="hidden md:inline">Liên Hệ</span>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* DANH MỤC SẢN PHẨM */}
            <motion.section variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="max-w-7xl mx-auto px-4 mb-16 relative z-20">
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

            {/* FLASH SALE & DEAL SỐC KÈM ĐỒNG HỒ ĐẾM NGƯỢC (ĐÃ BỎ LOGO ẢNH, GIỮ NGUYÊN LOGIC) */}
            <motion.section variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="max-w-7xl mx-auto px-4 mb-16">
                <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-[2rem] p-6 md:p-8 shadow-xl relative overflow-hidden text-white">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-white/20 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-yellow-300">
                                <Flame size={28} className="animate-bounce" />
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2">
                                    FLASH SALE DEAL SỐC
                                </h2>
                                <p className="text-orange-100 text-xs md:text-sm mt-0.5">Sản phẩm giảm giá độc quyền giới hạn thời gian</p>
                            </div>
                        </div>

                        {/* Đồng hồ đếm ngược */}
                        <div className="flex items-center gap-3 bg-black/30 backdrop-blur-md px-4 py-2 rounded-xl w-max">
                            <Clock size={18} className="text-orange-300" />
                            <span className="text-xs font-semibold uppercase tracking-wider">Kết thúc sau:</span>
                            <FlashSaleTimer endTime={flashSaleProducts[0]?.flashSaleEnd || new Date().getTime() + 86400000} />
                        </div>
                    </div>

                    {/* Danh sách sản phẩm Flash Sale */}
                    {flashSaleProducts.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
                            {flashSaleProducts.map((product, index) => (
                                <ProductCard key={`flash-${product.id}`} product={product} index={index} onAddToCart={handleAddToCart} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-white/80 font-medium">Đang cập nhật các deal giảm giá mới.</div>
                    )}
                </div>
            </motion.section>

            {/* SẢN PHẨM LAPTOP */}
            <motion.section variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="max-w-7xl mx-auto px-4 mb-20">
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-slate-200 pb-4 gap-4">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">LAPTOP CHÍNH HÃNG</h2>
                    <div className="flex gap-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
                        {['Laptop sinh viên', 'Laptop văn phòng', 'Gaming', 'Đồ họa', 'ASUS', 'DELL', 'HP'].map((tab) => (
                            <button key={tab} onClick={() => filterLaptopProducts(allProducts, tab)} className={`text-base font-bold transition-colors relative pb-3 ${activeLaptopTab === tab ? 'text-blue-600' : 'text-slate-400 hover:text-slate-700'}`}>
                                {tab}
                                {activeLaptopTab === tab && ( <motion.div layoutId="activeLaptopTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" /> )}
                            </button>
                        ))}
                    </div>
                </div>

                {laptopProducts.length > 0 ? (
                    <motion.div layout className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
                        {laptopProducts.map((product, index) => (
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
                            <button key={tab} onClick={() => filterPcProducts(allProducts, tab)} className={`text-base font-bold transition-colors relative pb-3 ${activePcTab === tab ? 'text-blue-600' : 'text-slate-400 hover:text-slate-700'}`}>
                                {tab}
                                {activePcTab === tab && ( <motion.div layoutId="activePcTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" /> )}
                            </button>
                        ))}
                    </div>
                </div>

                {pcProducts.length > 0 ? (
                    <motion.div layout className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
                        {pcProducts.map((product, index) => (
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
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-bl from-blue-50/80 to-transparent rounded-bl-[100%] z-0 pointer-events-none"></div>
                
                <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-16 relative z-10">
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
                    <div className="lg:w-1/2 w-full mt-10 lg:mt-0">
                        <div className="relative max-w-lg mx-auto">
                            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-200 to-cyan-100 rounded-[2.5rem] transform rotate-3 -z-10 transition-transform duration-700"></div>
                            <div className="rounded-[2rem] overflow-hidden shadow-2xl bg-white p-2 border border-white relative z-10 group cursor-pointer">
                                <img src="/about.png" alt="Hồ sơ năng lực" className="w-full h-auto object-cover rounded-[1.5rem] group-hover:scale-[1.03] transition-transform duration-700 ease-out" />
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

            {/* TIN TỨC & CÔNG NGHỆ */}
            <motion.section variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="max-w-7xl mx-auto px-4 mb-24">
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-slate-200 pb-4 gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <Newspaper className="text-blue-600" size={32}/> TIN TỨC & CÔNG NGHỆ
                        </h2>
                        <p className="text-slate-500 mt-2 font-medium">Cập nhật xu hướng công nghệ mới nhất và các mẹo hay</p>
                    </div>
                    <Link to="/blog" className="group flex items-center gap-2 text-blue-600 font-bold hover:text-blue-800 transition-colors pb-1">
                        Xem tất cả <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
                    </Link>
                </div>
                {latestBlogs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {latestBlogs.map((blog) => (
                            <Link to={`/blog/${blog.slug}`} key={blog.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all group flex flex-col">
                                <div className="relative h-56 overflow-hidden bg-slate-100">
                                    {blog.thumbnail ? (
                                        <img src={blog.thumbnail} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={40}/></div>
                                    )}
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold text-blue-600 uppercase tracking-wider shadow-sm">{blog.category}</div>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-3 font-medium">
                                        <Clock size={14}/> {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">{blog.title}</h3>
                                    <p className="text-slate-600 text-sm line-clamp-3 mb-6 flex-1">{blog.summary || 'Không có mô tả tóm tắt cho bài viết này.'}</p>
                                    <span className="text-blue-600 text-sm font-bold flex items-center gap-1.5 group-hover:gap-2.5 transition-all mt-auto w-max">Đọc tiếp <ChevronRight size={16}/></span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm"><p className="text-slate-400 font-medium">Chưa có bài viết mới nào.</p></div>
                )}
            </motion.section>

            {/* GIÁ TRỊ CỐT LÕI */}
            <motion.section variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="bg-white py-20 border-y border-slate-200/60 shadow-sm relative z-10">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {coreValues.map((val, idx) => (
                            <motion.div variants={fadeInUp} key={idx} className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-slate-50 transition-colors">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600 shadow-inner">{val.icon}</div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">{val.title}</h3>
                                <p className="text-slate-700 dark:text-slate-300 font-medium">{val.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* ĐỐI TÁC CHIẾN LƯỢC */}
            <section className="py-12 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">ĐỐI TÁC CÔNG NGHỆ HÀNG ĐẦU</h3>
                    <BrandCarousel />
                </div>
            </section>

            {/* ANIMATION GIỎ HÀNG */}
            <AnimatePresence>
                {flyingItems.map(item => (
                    <motion.img
                        key={item.id} src={item.img}
                        initial={{ x: item.startX, y: item.startY, scale: 1, opacity: 0.8, width: item.width }}
                        animate={{ x: item.endX, y: item.endY, scale: 0.1, opacity: 0 }}
                        transition={{ duration: 0.8, type: 'spring', bounce: 0.2 }}
                        style={{ position: 'fixed', zIndex: 9999, pointerEvents: 'none', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

export default Home;