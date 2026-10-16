import { ArrowRight } from 'lucide-react';

const HeroBanner = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Cột trái (Chiếm 2 phần) - Banner Sinh Viên */}
            <div className="md:col-span-2 relative bg-[#eef2ff] rounded-xl overflow-hidden flex items-center min-h-[350px]">
                {/* Background Decor */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#eef2ff] via-[#eef2ff]/90 to-transparent z-10"></div>
                <img 
                    src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80" 
                    alt="Laptop sinh viên" 
                    className="absolute right-0 top-0 h-full w-2/3 object-cover z-0"
                />
                
                {/* Nội dung */}
                <div className="relative z-20 p-8 md:p-12 max-w-lg">
                    <p className="text-blue-600 font-bold tracking-widest text-sm mb-3 uppercase">Back to school 2026</p>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-4">
                        CÔNG NGHỆ<br/>CHO SINH VIÊN
                    </h1>
                    <p className="text-gray-600 text-lg mb-8">Laptop học tập — Giá hợp lý — Hiệu năng đủ dùng</p>
                    
                    <div className="flex gap-4">
                        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2">
                            Xem laptop sinh viên <ArrowRight size={18}/>
                        </button>
                        <button className="bg-white text-gray-800 border border-gray-200 px-6 py-3 rounded-lg font-bold hover:bg-gray-50 transition">
                            Khám phá ưu đãi
                        </button>
                    </div>
                </div>
            </div>

            {/* Cột phải (Chiếm 1 phần) - 2 Banner nhỏ */}
            <div className="flex flex-col gap-4">
                {/* Banner nhỏ 1 */}
                <div className="flex-1 relative bg-gray-900 rounded-xl overflow-hidden p-6 flex flex-col justify-center group cursor-pointer">
                    <img src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity" alt="Laptop IT"/>
                    <div className="relative z-10">
                        <p className="text-blue-400 text-xs font-bold mb-1 uppercase">Ưu đãi ngành CNTT</p>
                        <h3 className="text-white text-2xl font-bold mb-1">Laptop IT</h3>
                        <p className="text-gray-300 text-sm mb-3">Máy mạnh cho lập trình & đồ án</p>
                        <span className="text-white text-sm font-semibold underline underline-offset-4 group-hover:text-blue-400 transition-colors">Xem ngay</span>
                    </div>
                </div>
                
                {/* Banner nhỏ 2 */}
                <div className="flex-1 relative bg-gray-200 rounded-xl overflow-hidden p-6 flex flex-col justify-center group cursor-pointer">
                    <img src="https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80" className="absolute right-0 bottom-0 w-1/2 object-contain group-hover:scale-105 transition-transform origin-bottom-right" alt="Phụ kiện"/>
                    <div className="relative z-10 max-w-[60%]">
                        <p className="text-gray-500 text-xs font-bold mb-1 uppercase">Mua kèm giá tốt</p>
                        <h3 className="text-gray-900 text-xl font-bold mb-1">Phụ kiện sinh viên</h3>
                        <p className="text-gray-600 text-sm mb-3">Chuột · Bàn phím · Tai nghe</p>
                        <span className="text-gray-900 text-sm font-semibold underline underline-offset-4 group-hover:text-blue-600 transition-colors">Xem ngay</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroBanner;