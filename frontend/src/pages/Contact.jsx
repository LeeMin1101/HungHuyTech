import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, MapPin, Phone, Mail, CheckCircle2 } from 'lucide-react';

const Contact = () => {
    // State quản lý form
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        subject: 'Tư vấn giải pháp Doanh nghiệp', // Giá trị mặc định cho dropdown
        message: ''
    });

    // State quản lý trạng thái gửi (loading, success)
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Mô phỏng API gửi dữ liệu lên server (Dashboard Admin)
        // Sau này bạn sẽ thay bằng axiosClient.post('/contact', formData)
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
            
            // Tự động ẩn thông báo thành công sau 3 giây và reset form
            setTimeout(() => {
                setIsSuccess(false);
                setFormData({
                    fullName: '',
                    email: '',
                    phone: '',
                    subject: 'Tư vấn giải pháp Doanh nghiệp',
                    message: ''
                });
            }, 3000);
        }, 1500);
    };

    // Animation config
    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    return (
        <div className="bg-slate-50 min-h-screen py-12">
            <div className="max-w-4xl mx-auto px-4">
                
                {/* Header Section */}
                <motion.div 
                    initial="hidden" animate="visible" variants={fadeInUp}
                    className="text-center mb-10"
                >
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">
                        Cùng bắt đầu giải pháp của bạn.
                    </h1>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-slate-600 font-semibold text-lg">
                        <span className="flex items-center gap-2"><Phone size={18} className="text-blue-600"/> 0336868880 - 0913767797</span>
                        <span className="hidden md:inline text-slate-300">|</span>
                        <span className="flex items-center gap-2"><Mail size={18} className="text-blue-600"/> hotro@hunghuy.net</span>
                    </div>
                </motion.div>

                {/* Main Content Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
                    className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
                >
                    {/* Address Banner (Thay thế cho Google Maps) */}
                    <div className="w-full bg-gradient-to-br from-blue-50 to-slate-100/50 dark:from-slate-800 dark:to-slate-900 p-8 md:p-10 border-b border-slate-100 flex flex-col md:flex-row items-center md:items-start gap-5 text-center md:text-left">
                        <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center text-red-500 shrink-0">
                            <MapPin size={28} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">Trụ sở chính</h3>
                            <p className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 leading-tight">
                                Công ty Cổ phần Công nghệ Hùng Huy
                            </p>
                            <p className="text-slate-700 dark:text-slate-300 mt-2 font-medium">
                                4 Đường Lô C, Khu Phố 3, Phường Tam Bình, TP. Thủ Đức, TP. HCM
                            </p>
                        </div>
                    </div>

                    {/* Contact Form Section */}
                    <div className="p-8 md:p-12">
                        <div className="mb-8 text-center md:text-left">
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Gửi yêu cầu của bạn</h2>
                            <p className="text-slate-500 text-sm">Để lại nhu cầu của bạn. Đội ngũ tư vấn sẽ gọi điện hoặc gửi email để hỗ trợ ngay.</p>
                        </div>

                        {isSuccess ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center"
                            >
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-600">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-emerald-800 mb-2">Gửi yêu cầu thành công!</h3>
                                <p className="text-emerald-600 font-medium">Cảm ơn bạn. Hùng Huy sẽ liên hệ lại với bạn trong thời gian sớm nhất.</p>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Họ và tên */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="fullName" className="text-sm font-semibold text-slate-700">Họ và tên <span className="text-red-500">*</span></label>
                                        <input 
                                            type="text" 
                                            id="fullName" 
                                            name="fullName" 
                                            required
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            placeholder="VD: Nguyễn Văn A"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
                                        />
                                    </div>

                                    {/* Số điện thoại */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="phone" className="text-sm font-semibold text-slate-700">Số điện thoại <span className="text-red-500">*</span></label>
                                        <input 
                                            type="tel" 
                                            id="phone" 
                                            name="phone" 
                                            required
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="VD: 0912345678"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Email */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="email" className="text-sm font-semibold text-slate-700">Email <span className="text-red-500">*</span></label>
                                        <input 
                                            type="email" 
                                            id="email" 
                                            name="email" 
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="VD: email@doanhnghiep.com"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
                                        />
                                    </div>

                                    {/* Chủ đề / Nhu cầu */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="subject" className="text-sm font-semibold text-slate-700">Nhu cầu</label>
                                        <div className="relative">
                                            <select 
                                                id="subject" 
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 appearance-none outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-700"
                                            >
                                                <option value="Mua sắm cá nhân">Mua sắm cá nhân (Laptop, PC...)</option>
                                                <option value="Tư vấn giải pháp Doanh nghiệp">Tư vấn giải pháp Doanh nghiệp (B2B)</option>
                                                <option value="Hỗ trợ bảo hành / Kỹ thuật">Hỗ trợ bảo hành / Kỹ thuật</option>
                                                <option value="Hợp tác đối tác">Hợp tác đối tác</option>
                                                <option value="Khác">Khác</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Nội dung tin nhắn */}
                                <div className="space-y-1.5">
                                    <label htmlFor="message" className="text-sm font-semibold text-slate-700">Nội dung chi tiết</label>
                                    <textarea 
                                        id="message" 
                                        name="message" 
                                        rows="4"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Vui lòng mô tả chi tiết yêu cầu hoặc hệ thống bạn cần triển khai..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
                                    ></textarea>
                                </div>

                                {/* Nút Gửi */}
                                <div className="pt-2">
                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className={`flex items-center justify-center md:justify-start gap-2 w-full md:w-auto bg-blue-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-blue-600/30 ${isSubmitting ? 'opacity-75 cursor-wait' : 'hover:bg-blue-700 hover:-translate-y-0.5'}`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Đang gửi...
                                            </>
                                        ) : (
                                            <>
                                                Gửi yêu cầu <Send size={18} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Contact;