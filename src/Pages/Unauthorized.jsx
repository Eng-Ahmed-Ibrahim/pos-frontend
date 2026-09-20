import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="w-100 flex flex-col items-center justify-center min-h-screen px-4 text-center">
      {/* رقم 403 بتصميم بارز */}
      <div className="relative">
        <h1 className="text-9xl font-black text-slate-200 select-none">403</h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-red-500 bg-red-50 px-4 py-1 rounded-full border border-red-100 shadow-sm">
           403
          </span>
        </div>
      </div>

      <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mt-4 mb-2">
         لا تمتلك الصلاحية للوصول إلى هذه الصفحة
      </h2>

    </div>
  );
};

export default Unauthorized;