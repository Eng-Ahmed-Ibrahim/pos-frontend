import { useState, useEffect } from 'react'
import { apiFetch } from "@/Components/apiFetch";

function WarehouseInventory() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [searchValue, setSearchValue] = useState("")
  const [filteredData, setFilteredData] = useState([]);
  useEffect(() => {
    fetchInventory();
  }, []);


  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('warehouse-inventory'); // عدّل المسار حسب الـ route عندك
      const json = await res.json();
      setData(json.data ?? json);
    } catch (err) {
      setError('حدث خطأ أثناء تحميل بيانات المخزون');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const filteredData = data.filter(
      item => item?.product_barcode.toString().includes(searchValue) ||
        item?.product_name.toLowerCase().includes(searchValue?.toLowerCase())
    )
    setFilteredData(filteredData)

  }, [data, searchValue])

  const toggleRow = (productId) => {
    setExpandedRow(prev => (prev === productId ? null : productId));
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">جاري تحميل البيانات...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }
  const monthName = new Date().toLocaleDateString("ar-EG", {
    month: "long",
  });


  return (
    <div dir="rtl" className="p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        جرد المخزون لشهر {monthName}
      </h2>
      <div className='my-2'>
        <input type="text" style={{ width: "300px" }}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder='البحث باستخدام اسم المنتج او الباركود' />
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full text-sm text-right">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">المنتج</th>
              <th className="px-4 py-3 font-medium">مرحّل من الشهر السابق</th>
              <th className="px-4 py-3 font-medium">مشتريات جديدة</th>
              <th className="px-4 py-3 font-medium">إجمالي المتاح</th>
              <th className="px-4 py-3 font-medium">المباع</th>
              <th className="px-4 py-3 font-medium">المخزون الحالي</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredData.map((item) => (
              <>
                <tr key={item.product_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{item.product_name}</td>
                  <td className="px-4 py-3">{item.carried_forward}</td>
                  <td className="px-4 py-3">{item.new_purchases}</td>
                  <td className="px-4 py-3">{item.total_available}</td>
                  <td className="px-4 py-3 text-red-600">{item.sold}</td>
                  <td className="px-4 py-3 font-semibold" style={{ color: '#8B5E3C' }}>
                    {item.current_stock}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleRow(item.product_id)}
                      className="text-xs px-3 py-1 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
                    >
                      {expandedRow === item.product_id ? 'إخفاء الدفعات' : 'عرض الدفعات'}
                    </button>
                  </td>
                </tr>

                {expandedRow === item.product_id && (
                  <tr>
                    <td colSpan={7} className="bg-gray-50 px-4 py-3">
                      <div className="text-xs text-gray-500 mb-2">
                        دفعات مرحّلة من فترات سابقة ({item.carried_batches.length})
                      </div>
                      <table className="w-full text-xs border border-gray-200 rounded overflow-hidden">
                        <thead className="bg-gray-100 text-gray-600">
                          <tr>
                            <th className="px-3 py-2">تاريخ الشراء</th>
                            <th className="px-3 py-2">الكمية الأصلية</th>
                            <th className="px-3 py-2">المتبقي</th>
                            <th className="px-3 py-2">تاريخ الانتهاء</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {item.carried_batches.map((batch, idx) => (
                            <tr key={idx}>
                              <td className="px-3 py-2">{batch.purchase_date}</td>
                              <td className="px-3 py-2">{batch.original_qty}</td>
                              <td className="px-3 py-2">{batch.remaining}</td>
                              <td className="px-3 py-2">{batch.expire_date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {data.length === 0 && (
        <div className="text-center text-gray-400 py-10">لا توجد بيانات مخزون</div>
      )}
    </div>
  );
}

export default WarehouseInventory