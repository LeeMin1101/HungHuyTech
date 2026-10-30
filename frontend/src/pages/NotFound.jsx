import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Home, SearchX } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-[url('/bg-404.png')] bg-cover bg-center bg-no-repeat px-6 py-12 font-sans relative">
            <ThemeToggle className="absolute right-5 top-5 z-20" />
            
            {/* Khối nội dung đã xóa background trắng, viền và bóng đổ. Chỉ giữ lại padding */}
            <div className="max-w-md w-full text-center relative z-10 p-6">
                
                {/* Biểu tượng lỗi chuyển sang dạng kính mờ (glassmorphism) để hợp với tech-background */}
                <div className="flex justify-center mb-8">
                    <div className="w-24 h-24 bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg animate-bounce border border-white/60">
                        <SearchX className="text-blue-600" size={48} />
                    </div>
                </div>

                {/* Tiêu đề lỗi: Thêm drop-shadow để nổi bật trên nền */}
                <h1 className="text-8xl md:text-9xl font-black text-slate-800 mb-4 tracking-tighter drop-shadow-md">
                    4<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">0</span>4
                </h1>
                
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3 drop-shadow-sm">
                    Ôi hỏng! Không tìm thấy trang.
                </h2>
                
                <p className="text-slate-600 mb-8 leading-relaxed font-medium drop-shadow-sm">
                    Có vẻ như bạn đã truy cập vào một đường dẫn không tồn tại, hoặc trang này đã bị xóa/di chuyển sang địa chỉ khác.
                </p>

                {/* Các nút hành động */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        // Nút quay lại dạng kính mờ hòa vào nền
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white/50 backdrop-blur-md border border-white/80 text-slate-700 font-bold rounded-xl hover:bg-white/80 hover:text-blue-700 transition-all duration-300 active:scale-95 shadow-sm"
                    >
                        <ArrowLeft size={20} />
                        Quay lại
                    </button>
                    
                    <Link
                        to="/" 
                        // Nút về trang chủ giữ nguyên gradient để tạo điểm nhấn (Call to action)
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/40 transition-all duration-300 active:scale-95"
                    >
                        <Home size={20} />
                        Về trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;