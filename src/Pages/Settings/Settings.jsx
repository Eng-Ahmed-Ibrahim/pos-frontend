import { useState, useEffect } from 'react';
import { CiSettings } from "react-icons/ci";
import { LiaFileInvoiceSolid } from "react-icons/lia";
import './styles.css';
import { apiFetch } from "@/Components/apiFetch";
const SERVER_BASE = import.meta.env.VITE_SERVER_BASE
import Swal from "sweetalert2";

function Settings() {
  // 1. حالة الألسنة النشطة
  const [activeTab, setActiveTab] = useState('general');

  // 2. تخزين قيم الإعدادات (Key-Value)
  const [settings, setSettings] = useState({
    system_name: '',
    system_logo: '',
    invoice_phone: '',
    invoice_address: '',
    invoice_logo: '',
    invoice_tax_number: '',
  });

  const [uploadedFiles, setUploadedFiles] = useState({
    system_logo: null,
    invoice_logo: null,
  });


  useEffect(() => {
    apiFetch('settings')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === 'object') {
          setSettings((prev) => ({ ...prev, ...data.settings }));
        }
      })
      .catch((err) => console.error("خطأ أثناء جلب الإعدادات:", err));
  }, []);

  const handleInputChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogoChange = (key, e) => {
    const file = e.target.files[0];
    if (file) {
      // حفظ الملف الفعلي لإرساله للباك اند
      setUploadedFiles((prev) => ({ ...prev, [key]: file }));
      // عرض مؤقت محلي للصورة في المتصفح فقط
      handleInputChange(key, URL.createObjectURL(file));
    }
  };

  // 4. دالة الإرسال والحفظ الديناميكي
  const handleSubmit = async (e) => {
    e.preventDefault();

    // نستخدم FormData لكي يقبل الباك اند النصوص والملفات معاً
    const formData = new FormData();

    // نمر على كل المفاتيح (Keys) الموجودة في الـ State ديناميكياً ونضيفها
    Object.keys(settings).forEach((key) => {
      // نستثني ملفات اللوجو من النصوص لأننا سنرسلها كملفات حقيقية بالأسفل
      if (key !== 'system_logo' && key !== 'invoice_logo') {
        formData.append(key, settings[key] || '');
      }
    });

    // إضافة الملفات الفعلية للـ FormData إذا قام المستخدم برفع ملف جديد
    if (uploadedFiles.system_logo) {
      formData.append('system_logo', uploadedFiles.system_logo);
    }
    if (uploadedFiles.invoice_logo) {
      formData.append('invoice_logo', uploadedFiles.invoice_logo);
    }

    try {
      const response = await apiFetch('settings/update', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          toast: true,
          position: "top-start",
          icon: "success",
          title: result.message || 'تم حفظ الإعدادات بنجاح!',
          showConfirmButton: false,
          timer: 3000,
        });
      } else {
        Swal.fire({
          toast: true,
          position: "top-start",
          icon: "error",
          title: 'حدث خطأ أثناء حفظ البيانات، يرجى التحقق من المدخلات.',
          showConfirmButton: false,
          timer: 3000,
        });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      Swal.fire({
        toast: true,
        position: "top-start",
        icon: "error",
        title: 'فشل الاتصال بالخادم الرئيسي (Server Error)',
        showConfirmButton: false,
        timer: 3000,
      });
    }
  };

  // الألسنة المتاحة
  const tabs = [
    { id: 'general', label: 'الإعدادات العامة', icon: <CiSettings fontSize={22} /> },
    { id: 'invoice', label: 'إعدادات الفاتورة', icon: <LiaFileInvoiceSolid fontSize={22} /> },
  ];

  return (
    <>
      {/* الحاوية الرئيسية بتوجيه عربي (RTL) */}
      <div className="container py-5" dir="rtl">
        <div className="card custom-settings-card">

          {/* رأس الصفحة */}
          <div className="p-4 border-bottom bg-white">
            <h2 className="fw-bold mb-1" style={{ color: '#333', fontSize: '1.6rem' }}>إعدادات النظام</h2>
            <p className="text-muted small mb-0">تعديل وتخصيص كافة إعدادات الهوية والفواتير الخاصة بموقعك.</p>
          </div>

          <div className="row g-0">

            {/* القائمة الجانبية للألسنة */}
            <div className="col-12 col-md-3 sidebar-tabs p-3">
              <div className="d-flex flex-row flex-md-column overflow-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`custom-tab-btn text-nowrap ${activeTab === tab.id ? 'active-tab' : ''}`}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* محتوى الإعدادات والنموذج */}
            <div className="col-12 col-md-9 p-4 p-md-5 bg-white">
              <form onSubmit={handleSubmit} className="d-flex flex-column justify-content-between h-100">

                <div>
                  {/* --- لسان 1: الإعدادات العامة --- */}
                  {activeTab === 'general' && (
                    <div className="animate-fade-in">
                      <h4 className="fw-bold mb-4" style={{ color: '#8B5E3C', fontSize: '1.2rem' }}>العلامة التجارية والنظام</h4>

                      {/* اسم النظام */}
                      <div className="mb-4 d-flex flex-column">
                        <label className="custom-form-label">اسم الموقع / السيستم</label>
                        <input
                          type="text"
                          className="form-control custom-input"
                          value={settings.system_name}
                          onChange={(e) => handleInputChange('system_name', e.target.value)}
                          placeholder="مثال: متجري الذكي"
                        />
                      </div>

                      {/* لوجو السيستم */}
                      <div className="mb-3 d-flex flex-column">
                        <label className="custom-form-label">شعار النظام الرئيسي</label>
                        <div className="logo-upload-box">
                          <div className="logo-preview">
                            {settings.system_logo ? (
                              <img src={SERVER_BASE + '/' + settings.system_logo} alt="Logo" className="img-fluid h-100 object-fit-contain" />
                            ) : (
                              <span className="text-muted" style={{ fontSize: '10px' }}>لا يوجد</span>
                            )}
                          </div>
                          <div>
                            <label className="btn btn-sm btn-outline-secondary px-3 py-2" style={{ borderRadius: '8px', fontSize: '0.8rem' }}>
                              اختر شعار حديث
                              <input type="file" accept="image/*" hidden onChange={(e) => handleLogoChange('system_logo', e)} />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* --- لسان 2: إعدادات الفاتورة --- */}
                  {activeTab === 'invoice' && (
                    <div className="animate-fade-in">
                      <h4 className="fw-bold mb-4" style={{ color: '#8B5E3C', fontSize: '1.2rem' }}>بيانات وتصميم الفاتورة</h4>

                      <div className="row">
                        {/* رقم الهاتف */}
                        <div className="col-md-6 mb-4 d-flex flex-column">
                          <label className="custom-form-label">رقم الهاتف </label>
                          <input
                            type="text"
                            className="form-control custom-input text-end"
                            value={settings.invoice_phone}
                            onChange={(e) => handleInputChange('invoice_phone', e.target.value)}
                          />
                        </div>


                      </div>

                      {/* العنوان */}
                      <div className="mb-4 d-flex flex-column">
                        <label className="custom-form-label">العنوان   </label>
                        <input
                          type="text"
                          className="form-control custom-input"
                          value={settings.invoice_address}
                          onChange={(e) => handleInputChange('invoice_address', e.target.value)}
                        />
                      </div>

                      {/* لوجو الفاتورة */}
                      <div className="mb-3 d-flex flex-column">
                        <label className="custom-form-label">لوجو الفاتورة </label>
                        <div className="logo-upload-box">
                          <div className="logo-preview">
                            {settings.invoice_logo ? (
                              <img src={SERVER_BASE + '/' + settings.invoice_logo} alt="Invoice Logo" className="img-fluid h-100 object-fit-contain" />
                            ) : (
                              <span className="text-muted" style={{ fontSize: '10px' }}>لا يوجد</span>
                            )}
                          </div>
                          <div>
                            <label className="btn btn-sm btn-outline-secondary px-3 py-2" style={{ borderRadius: '8px', fontSize: '0.8rem' }}>
                              رفع شعار الفاتورة
                              <input type="file" accept="image/*" hidden onChange={(e) => handleLogoChange('invoice_logo', e)} />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* زر الحفظ السفلي */}
                <div className="d-flex justify-content-end mt-5 pt-3 border-top">
                  <button type="submit" className="btn btn-save-custom">
                    حفظ التغييرات
                  </button>
                </div>

              </form>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default Settings;