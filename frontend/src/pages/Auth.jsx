import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import axiosClient from "../utils/axiosClient";
import { FiStar, FiZap, FiCreditCard, FiAlertTriangle, FiAlertCircle } from "react-icons/fi";
import { Laptop, Cpu, Headphones, Smartphone, Monitor, Zap } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";

// Thay đổi CLIENT_ID bằng ID Google của bạn sau
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com";

const Auth = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);

    const [loginData, setLoginData] = useState({ username: "", password: "" });
    const [remember, setRemember] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);

    const [registerData, setRegisterData] = useState({
        fullName: "", username: "", email: "", phone: "", password: "", // Đổi name thành fullName
    });
    const [registerLoading, setRegisterLoading] = useState(false);
    const [registerError, setRegisterError] = useState("");
    const [registerFormErrors, setRegisterFormErrors] = useState({});

    useEffect(() => {
        const savedAccount = JSON.parse(localStorage.getItem("rememberAccount"));
        if (savedAccount) {
            setLoginData(savedAccount);
            setRemember(true);
        }
    }, []);

    // Xử lý Google Login
    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            setLoginLoading(true);
            const response = await axiosClient.post('/auth/google', {
                credential: credentialResponse.credential
            });

            if (response.success || response.data) {
                const token = response.data?.accessToken || response.accessToken;
                
                // Lấy thông tin user từ response
                const userData = response.data?.user || response.data?.userInfo || response.data || response.user;

                localStorage.setItem("accessToken", token);
                
                // Lưu thông tin user dưới dạng chuỗi JSON
                if (userData) {
                    localStorage.setItem("userInfo", JSON.stringify(userData));
                }
                
                setShowSuccess(true);
                setTimeout(() => {
                    navigate("/");
                }, 1800);
            }
        } catch (error) {
            console.error("Lỗi Google Login:", error);
            setLoginError("Đăng nhập Google thất bại. Vui lòng thử lại!");
            setLoginLoading(false);
        }
    };

    const handleLoginChange = (e) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
        if (loginError) setLoginError("");
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginLoading(true);
        setLoginError("");

        try {
            const response = await axiosClient.post('/auth/login', {
                email: loginData.username, 
                password: loginData.password,
            });

            if (response.success || response.data) {
                const token = response.data?.accessToken || response.accessToken;
                
                // Lấy thông tin user từ response
                const userData = response.data?.user || response.data?.userInfo || response.data || response.user;

                localStorage.setItem("accessToken", token);

                // Lưu thông tin user dưới dạng chuỗi JSON
                if (userData) {
                    localStorage.setItem("userInfo", JSON.stringify(userData));
                }

                if (remember) {
                    localStorage.setItem("rememberAccount", JSON.stringify({ username: loginData.username, password: loginData.password }));
                } else {
                    localStorage.removeItem("rememberAccount");
                }

                setShowSuccess(true);
                setTimeout(() => {
                    navigate("/");
                }, 1800);
            }
        } catch (error) {
            setLoginError(error.response?.data?.message || "Tài khoản hoặc mật khẩu không chính xác!");
            setLoginLoading(false);
        }
    };

    const handleRegisterChange = (e) => {
        setRegisterData({ ...registerData, [e.target.name]: e.target.value });
        if (registerFormErrors[e.target.name]) {
            setRegisterFormErrors({ ...registerFormErrors, [e.target.name]: "" });
        }
        if (registerError) setRegisterError("");
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        const errors = {};

        const usernameRegex = /^[a-zA-Z0-9]+$/;
        if (!usernameRegex.test(registerData.username)) {
            errors.username = "Chỉ được dùng chữ không dấu và số, không khoảng cách hay ký tự đặc biệt!";
        }

        const passwordRegex = /^[a-zA-Z0-9]+$/;
        if (registerData.password.length < 8) {
            errors.password = "Mật khẩu tối thiểu phải 8 ký tự!";
        } else if (!passwordRegex.test(registerData.password)) {
            errors.password = "Mật khẩu chỉ được chứa chữ và số!";
        }

        if (Object.keys(errors).length > 0) {
            setRegisterFormErrors(errors);
            return;
        }

        setRegisterLoading(true);

        try {
            await axiosClient.post('/auth/register', registerData);
            alert("Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.");
            
            setRegisterData({ fullName: "", username: "", email: "", phone: "", password: "" }); // Reset với fullName
            setIsLogin(true);
        } catch (error) {
            setRegisterError(error.response?.data?.message || "Đăng ký thất bại rồi!");
        } finally {
            setRegisterLoading(false);
        }
    };

    if (showSuccess) {
        return (
            <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
                <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
                    <motion.img 
                        src="/logo-chinh.png" 
                        className="h-24 mx-auto mb-6 drop-shadow-xl" 
                        animate={{ scale: [1, 1.1, 1] }} 
                        transition={{ duration: 1 }} 
                    />
                    <h1 className="text-4xl font-black mb-2 text-gray-900 uppercase tracking-wide">Welcome to HUNG HUY</h1>
                    <p className="text-blue-600 font-bold">Đang chuyển hướng...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden py-10">
                
                <Link to="/" className="absolute top-8 left-8 z-50 font-bold text-gray-500 hover:text-blue-600 transition-colors">
                    &larr; Về trang chủ
                </Link>
                <ThemeToggle className="absolute right-8 top-6 z-50" />

                <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
                <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-cyan-400/10 rounded-full blur-3xl animate-pulse pointer-events-none"></div>

                <div className="absolute inset-0 pointer-events-none overflow-hidden text-blue-500/10">
                    <span className="tech-icon"><Laptop size={48} /></span>
                    <span className="tech-icon"><Smartphone size={48} /></span>
                    <span className="tech-icon"><Cpu size={48} /></span>
                    <span className="tech-icon"><Monitor size={48} /></span>
                    <span className="tech-icon"><Headphones size={48} /></span>
                </div>

                <style>{`
                    .tech-icon { position:absolute; opacity:0.1; animation: floatTech 22s linear infinite; }
                    .tech-icon:nth-child(1){ left:10%; animation-duration:18s;}
                    .tech-icon:nth-child(2){ left:30%; animation-duration:24s;}
                    .tech-icon:nth-child(3){ left:50%; animation-duration:20s;}
                    .tech-icon:nth-child(4){ left:70%; animation-duration:26s;}
                    .tech-icon:nth-child(5){ left:85%; animation-duration:22s;}
                    @keyframes floatTech{ 0%{ transform:translateY(110vh) rotate(0deg); } 100%{ transform:translateY(-120vh) rotate(360deg); } }
                `}</style>

                <div className="relative z-10 w-full max-w-5xl mx-auto px-4">
                    <motion.div 
                        layout
                        className="flex flex-col lg:flex-row bg-white border border-gray-200 shadow-2xl rounded-3xl overflow-hidden min-h-[600px]"
                    >
                        
                        <motion.div 
                            layout 
                            className={`hidden lg:flex w-full lg:w-1/2 p-12 flex-col items-center justify-center bg-blue-50/50 transition-all duration-700 ${isLogin ? 'order-1 border-r border-gray-100' : 'order-2 border-l border-gray-100'}`}
                        >
                            <motion.img 
                                src="/logo-chinh.png" 
                                alt="Hung Huy Tech Logo" 
                                className="h-32 mb-8 drop-shadow-xl" 
                                animate={{ y: [0, -10, 0] }} 
                                transition={{ duration: 3, repeat: Infinity }} 
                            />
                            <div className="mt-4 space-y-4 text-gray-600 text-center font-bold tracking-wide">
                                <p className="flex items-center justify-center gap-3"><FiStar className="text-blue-600 text-lg" /> Sản phẩm chính hãng</p>
                                <p className="flex items-center justify-center gap-3"><FiZap className="text-blue-600 text-lg" /> Giao hàng siêu tốc</p>
                                <p className="flex items-center justify-center gap-3"><FiCreditCard className="text-blue-600 text-lg" /> Thanh toán an toàn</p>
                            </div>
                        </motion.div>

                        <motion.div 
                            layout 
                            className={`w-full lg:w-1/2 p-8 sm:p-12 relative flex items-center justify-center bg-white ${isLogin ? 'order-2' : 'order-1'}`}
                        >
                            <AnimatePresence mode="wait">
                                {isLogin ? (
                                    <motion.div 
                                        key="login"
                                        initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.4 }}
                                        className="w-full max-w-md"
                                    >
                                        <div className="text-center mb-6">
                                            <h2 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-wide">Đăng nhập</h2>
                                            <p className="text-gray-500 font-medium text-sm flex items-center justify-center gap-2">
                                                Hệ thống Thương Mại Điện Tử <Monitor size={16} className="text-blue-600" />
                                            </p>
                                        </div>

                                        {loginError && (
                                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-200 text-red-600 font-bold p-3 rounded-xl mb-4 text-sm flex items-center justify-center gap-2 shadow-sm">
                                                <FiAlertTriangle className="text-lg" /> {loginError}
                                            </motion.div>
                                        )}

                                        <form onSubmit={handleLogin} className="space-y-4">
                                            <input type="text" name="username" placeholder="Email / Tên đăng nhập" value={loginData.username} onChange={handleLoginChange} required className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-gray-900 px-4 py-3.5 rounded-xl outline-none placeholder-gray-400 transition-all shadow-sm" />
                                            <input type="password" name="password" placeholder="Mật khẩu" value={loginData.password} onChange={handleLoginChange} required className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-gray-900 px-4 py-3.5 rounded-xl outline-none placeholder-gray-400 transition-all shadow-sm" />

                                            <div className="flex justify-between text-sm text-gray-600 font-medium mt-2">
                                                <label className="flex items-center gap-2 cursor-pointer hover:text-gray-900 transition-colors">
                                                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="cursor-pointer accent-blue-600 w-4 h-4" /> Ghi nhớ tôi
                                                </label>
                                                <a href="/forgot-password" className="text-blue-600 hover:text-blue-700 transition-colors font-bold">Quên mật khẩu?</a>
                                            </div>

                                            <button type="submit" disabled={loginLoading} className="w-full py-3.5 rounded-xl font-black uppercase tracking-widest text-lg bg-blue-600 hover:bg-blue-700 text-white transition-all disabled:opacity-70 mt-4 shadow-lg hover:shadow-blue-500/30">
                                                {loginLoading ? "Đang xử lý..." : "Đăng nhập"}
                                            </button>
                                        </form>

                                        <div className="mt-6 flex flex-col items-center">
                                            <div className="w-full flex items-center gap-3 mb-4">
                                                <div className="flex-1 h-px bg-gray-200"></div>
                                                <span className="text-gray-400 text-sm font-bold uppercase tracking-wider">Hoặc</span>
                                                <div className="flex-1 h-px bg-gray-200"></div>
                                            </div>
                                            
                                            <div className="w-full flex justify-center drop-shadow-sm hover:drop-shadow-md transition-all">
                                                <GoogleLogin
                                                    onSuccess={handleGoogleSuccess}
                                                    onError={() => {
                                                        setLoginError("Lỗi kết nối Google. Vui lòng thử lại!");
                                                    }}
                                                    theme="outline"
                                                    size="large"
                                                    text="signin_with"
                                                    shape="rectangular"
                                                />
                                            </div>
                                        </div>

                                        <p className="text-center text-gray-500 font-medium text-sm mt-8">
                                            Chưa có tài khoản?{" "}
                                            <button onClick={() => setIsLogin(false)} className="text-blue-600 font-black hover:text-blue-700 transition hover:underline">
                                                Đăng ký ngay
                                            </button>
                                        </p>
                                    </motion.div>

                                ) : (
                                    <motion.div 
                                        key="register"
                                        initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} transition={{ duration: 0.4 }}
                                        className="w-full max-w-md"
                                    >
                                        <div className="text-center mb-6">
                                            <h2 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-wide">Tạo Tài Khoản</h2>
                                            <p className="text-gray-500 font-medium text-sm flex items-center justify-center gap-2">
                                                Mua sắm dễ dàng, nhận ngàn ưu đãi <Zap size={16} className="text-blue-600" />
                                            </p>
                                        </div>

                                        {registerError && (
                                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-200 text-red-600 text-sm font-bold p-3 flex items-center justify-center gap-2 rounded-xl mb-4 shadow-sm">
                                                <FiAlertTriangle className="text-lg" /> {registerError}
                                            </motion.div>
                                        )}

                                        <div className="mb-4 flex flex-col items-center">
                                            <div className="drop-shadow-sm hover:drop-shadow-md transition-all">
                                                <GoogleLogin
                                                    onSuccess={handleGoogleSuccess}
                                                    onError={() => {
                                                        setRegisterError("Lỗi kết nối Google. Vui lòng thử lại!");
                                                    }}
                                                    theme="outline"
                                                    size="large"
                                                    text="signup_with"
                                                    shape="rectangular"
                                                />
                                            </div>
                                            
                                            <div className="w-full flex items-center gap-3 mt-5 mb-2">
                                                <div className="flex-1 h-px bg-gray-200"></div>
                                                <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Đăng ký thủ công</span>
                                                <div className="flex-1 h-px bg-gray-200"></div>
                                            </div>
                                        </div>

                                        <form onSubmit={handleRegister} className="space-y-4">
                                            {/* Đổi thuộc tính name từ "name" sang "fullName" */}
                                            <input type="text" name="fullName" placeholder="Họ và tên" value={registerData.fullName} onChange={handleRegisterChange} required className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
                                            
                                            <div className="space-y-1">
                                                <input type="text" name="username" placeholder="Tên đăng nhập" value={registerData.username} onChange={handleRegisterChange} required className={`w-full px-4 py-3.5 rounded-xl bg-gray-50 border text-gray-900 placeholder-gray-400 focus:outline-none transition-all shadow-sm ${registerFormErrors.username ? "border-red-500 bg-red-50 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`} />
                                                {registerFormErrors.username && <p className="text-red-500 text-xs font-bold px-1 mt-1 flex items-center gap-1 animate-pulse"><FiAlertCircle /> {registerFormErrors.username}</p>}
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <input type="email" name="email" placeholder="Email" value={registerData.email} onChange={handleRegisterChange} required className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
                                                <input type="tel" name="phone" placeholder="Số điện thoại" value={registerData.phone} onChange={handleRegisterChange} required className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
                                            </div>

                                            <div className="space-y-1">
                                                <input type="password" name="password" placeholder="Mật khẩu" value={registerData.password} onChange={handleRegisterChange} required className={`w-full px-4 py-3.5 rounded-xl bg-gray-50 border text-gray-900 placeholder-gray-400 focus:outline-none transition-all shadow-sm ${registerFormErrors.password ? "border-red-500 bg-red-50 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`} />
                                                {registerFormErrors.password && <p className="text-red-500 text-xs font-bold px-1 mt-1 flex items-center gap-1 animate-pulse"><FiAlertCircle /> {registerFormErrors.password}</p>}
                                            </div>

                                            <button type="submit" disabled={registerLoading} className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-lg hover:opacity-90 transition disabled:opacity-70 mt-4 shadow-lg hover:shadow-blue-500/30">
                                                {registerLoading ? "Đang đăng ký..." : "Đăng ký tài khoản"}
                                            </button>
                                        </form>

                                        <p className="text-center text-gray-500 font-medium text-sm mt-6">
                                            Đã có tài khoản?{" "}
                                            <button onClick={() => setIsLogin(true)} className="text-blue-600 font-black hover:text-blue-700 transition hover:underline">
                                                Đăng nhập
                                            </button>
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                    </motion.div>
                </div>
            </div>
        </GoogleOAuthProvider>
    );
};

export default Auth;