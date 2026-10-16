import { useEffect } from 'react';
import { ShieldCheck, Users, Lightbulb, CheckCircle, Monitor, HardDrive, Network, Settings, Building2 } from 'lucide-react';

const About = () => {
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const coreValues = [
        { title: 'HƯỚNG ĐẾN KHÁCH HÀNG', desc: 'Đem đến trải nghiệm tốt nhất cho khách hàng.', icon: <ShieldCheck size={32} className="text-blue-600" /> },
        { title: 'ĐẦU TƯ CON NGƯỜI', desc: 'Con người là giá trị lớn nhất của công ty.', icon: <Users size={32} className="text-blue-600" /> },
        { title: 'ĐỔI MỚI VÀ SÁNG TẠO', desc: 'Đem đến lợi thế cạnh tranh cho công ty.', icon: <Lightbulb size={32} className="text-blue-600" /> },
        { title: 'TRUNG THỰC LIÊM CHÍNH', desc: 'Luôn luôn minh bạch trong kinh doanh.', icon: <CheckCircle size={32} className="text-blue-600" /> },
    ];

    const services = [
        { title: 'Thiết bị Máy tính & Laptop', icon: <Monitor size={24} /> },
        { title: 'Máy chủ (Server)', icon: <HardDrive size={24} /> },
        { title: 'Thiết bị & Hạ tầng mạng', icon: <Network size={24} /> },
        { title: 'Dịch vụ Bảo trì CNTT', icon: <Settings size={24} /> },
    ];

    return (
        <div className="bg-slate-50 pb-20">
            {/* Hero Section có Background Image */}
            <div 
                className="relative bg-slate-900 text-white py-32 overflow-hidden bg-cover bg-center"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80')" }}
            >
                {/* Lớp phủ màu đen mờ để làm nổi bật chữ */}
                <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"></div>
                <div className="absolute inset-0 bg-blue-600/20 blur-3xl rounded-full scale-150 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                
                <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-black mb-6 drop-shadow-lg">CÔNG TY CỔ PHẦN CÔNG NGHỆ HÙNG HUY</h1>
                    <p className="text-xl md:text-2xl text-blue-300 font-medium italic mb-8 drop-shadow">
                        "Cải thiện chất lượng cuộc sống bằng công nghệ"
                    </p>
                    <p className="text-slate-200 font-semibold tracking-widest uppercase bg-white/10 w-fit mx-auto px-6 py-2 rounded-full backdrop-blur-md border border-white/20">
                        Profit <span className="text-blue-400 mx-2">#</span> Professional <span className="text-blue-400 mx-2">#</span> Pioneer
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-20">
                {/* Giới thiệu chung (Có ảnh minh họa bên cạnh) */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 md:p-12 mb-12 flex flex-col lg:flex-row gap-10 items-center">
                    <div className="lg:w-1/2">
                        <img 
                            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80" 
                            alt="Văn phòng Hùng Huy" 
                            className="w-full h-[400px] object-cover rounded-2xl shadow-md"
                        />
                    </div>
                    <div className="lg:w-1/2">
                        <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                            <Building2 className="text-blue-600" /> Về Chúng Tôi
                        </h2>
                        <p className="text-slate-600 leading-relaxed mb-6 text-justify">
                            Công ty Cổ Phần Công Nghệ Hùng Huy luôn cam kết đem lại những sản phẩm công nghệ tiên tiến, chất lượng cao của các hãng sản xuất hàng đầu trên thế giới. Chúng tôi luôn hướng đến việc cung cấp những giải pháp công nghệ toàn diện nhằm nâng cao chất lượng vận hành doanh nghiệp và đời sống.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {services.map((srv, idx) => (
                                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3 hover:bg-blue-50 hover:border-blue-100 transition-colors">
                                    <div className="w-10 h-10 bg-white rounded-full flex-shrink-0 flex items-center justify-center text-blue-600 shadow-sm">
                                        {srv.icon}
                                    </div>
                                    <span className="font-semibold text-slate-800 text-xs sm:text-sm">{srv.title}</span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 text-sm text-slate-700 bg-blue-50/50 p-5 rounded-xl border border-blue-100/50">
                            <p><strong>Trụ sở:</strong> 4 Đường Lô C, KP3, P. Tam Bình, TP. Thủ Đức, TP. HCM</p>
                            <p><strong>Điện thoại:</strong> 0336868880 - 0913767797</p>
                            <p><strong>Email:</strong> hotro@hunghuy.net</p>
                        </div>
                    </div>
                </div>

                {/* Giá trị cốt lõi */}
                <div className="mb-16">
                    <h2 className="text-2xl font-black text-slate-900 mb-8 text-center uppercase">Giá trị cốt lõi</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {coreValues.map((val, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                                <div className="flex justify-center mb-5 group-hover:scale-110 transition-transform duration-300">{val.icon}</div>
                                <h3 className="font-bold text-slate-900 mb-3">{val.title}</h3>
                                <p className="text-sm text-slate-500">{val.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Năng lực & Nhân sự (Có ảnh cho từng khối) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Block Đội ngũ */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow">
                        <img 
                            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80" 
                            alt="Đội ngũ nhân sự" 
                            className="w-full h-56 object-cover"
                        />
                        <div className="p-8">
                            <h2 className="text-xl font-black text-slate-900 mb-4">Đội ngũ chuyên nghiệp</h2>
                            <p className="text-slate-600 leading-relaxed">
                                "Tài sản quý giá nhất của đơn vị chính là nguồn nhân lực". Hùng Huy hiện sở hữu đội ngũ 15 thành viên cơ hữu được đào tạo bài bản, bao gồm Ban giám đốc, chuyên gia kỹ thuật, quản trị dự án, và lập trình viên. Chúng tôi luôn sẵn sàng hỗ trợ, thiết kế, triển khai dự án công nghệ một cách khoa học và chặt chẽ nhất.
                            </p>
                        </div>
                    </div>

                    {/* Block Bảo hành */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow">
                        <img 
                            src="https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80" 
                            alt="Cam kết dịch vụ" 
                            className="w-full h-56 object-cover"
                        />
                        <div className="p-8">
                            <h2 className="text-xl font-black text-slate-900 mb-4">Cam kết dịch vụ & Bảo hành</h2>
                            <p className="text-slate-600 leading-relaxed">
                                Là đối tác chiến lược của các hãng công nghệ hàng đầu thế giới (Dell, HP, ASUS, Cisco,...), chúng tôi chịu trách nhiệm bảo hành toàn bộ thiết bị theo đúng tiêu chuẩn nhà sản xuất. Hùng Huy cam kết thời gian xử lý bảo hành sản phẩm nhanh chóng trong vòng <strong>7 ngày làm việc</strong>, đảm bảo hệ thống của khách hàng luôn vận hành ổn định.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;