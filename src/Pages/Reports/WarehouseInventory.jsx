
import { useState, useEffect } from 'react';
import { apiFetch } from "@/Components/apiFetch";
import * as XLSX from 'xlsx';

function WarehouseInventory() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  const monthName = new Date().toLocaleDateString("ar-EG", {
    month: "long",
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);

      const res = await apiFetch('warehouse-inventory');
      const json = await res.json();

      setData(json.data ?? json);
    } catch (err) {
      setError('حدث خطأ أثناء تحميل بيانات المخزون');
    } finally {
      setLoading(false);
    }
  };

  // Filter inventory
  useEffect(() => {
    const filtered = data.filter(item =>
      String(item?.product_barcode ?? '')
        .toLowerCase()
        .includes(searchValue.toLowerCase()) ||
      String(item?.product_name ?? '')
        .toLowerCase()
        .includes(searchValue.toLowerCase())
    );

    setFilteredData(filtered);
  }, [data, searchValue]);
  const handleExportPdf = async () => {
    try {
      const res = await apiFetch(
        `warehouse-inventory/pdf?search=${encodeURIComponent(searchValue)}`
      );

      if (!res.ok) {
        throw new Error('PDF export failed');
      }

      const blob = await res.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `جرد مخزون-${monthName}.pdf`;

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء تصدير PDF');
    }
  };
  // Export Excel
  const handleExportExcel = () => {
    const exportData = filteredData.map(item => ({
      'المنتج': item.product_name,
      'مرحّل من الشهر السابق': item.carried_forward,
      'مشتريات جديدة': item.new_purchases,
      'المخزون الحالي': item.current_stock,
      'قيمة المخزون': Number(item.current_stock_value || 0),
    }));

    // Calculate total inventory value
    const totalValue = filteredData.reduce(
      (sum, item) =>
        sum + Number(item.current_stock_value || 0),
      0
    );

    // Add total row
    exportData.push({
      'المنتج': 'الإجمالي الكلي',
      'مرحّل من الشهر السابق': '',
      'مشتريات جديدة': '',
      'المخزون الحالي': '',
      'قيمة المخزون': totalValue,
    });

    const ws = XLSX.utils.json_to_sheet(exportData);

    // Column widths
    ws['!cols'] = [
      { wch: 25 },
      { wch: 22 },
      { wch: 18 },
      { wch: 18 },
      { wch: 20 },
    ];

    // Format currency values
    const range = XLSX.utils.decode_range(ws['!ref']);

    for (let row = 1; row <= range.e.r; row++) {
      const cell = ws[XLSX.utils.encode_cell({
        r: row,
        c: 4
      })];

      if (cell) {
        cell.z = '#,##0.00';
      }
    }

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      wb,
      ws,
      `جرد ${monthName}`
    );

    XLSX.writeFile(
      wb,
      `جرد مخزون-${monthName}.xlsx`
    );
  };

  const toggleRow = (productId) => {
    setExpandedRow(prev =>
      prev === productId ? null : productId
    );
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        جاري تحميل البيانات...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div dir="rtl" className="p-6">

      <h2 className="text-xl font-bold mb-4 text-gray-800">
        جرد المخزون لشهر {monthName}
      </h2>

      <div className="my-2 flex gap-2">

        <input
          type="text"
          style={{ width: "300px" }}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="البحث باستخدام اسم المنتج او الباركود"
        />

        <button
          onClick={handleExportExcel}
          className="btn"
          style={{
            backgroundColor: 'green',
            color: '#fff'
          }}
        >
          اكسيل
        </button>
        <button
          onClick={handleExportPdf}
          className="btn"
          style={{
            backgroundColor: '#b91c1c',
            color: '#fff'
          }}
        >
          PDF
        </button>

      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">

        <table className="min-w-full text-sm text-right">

          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">المنتج</th>
              <th className="px-4 py-3 font-medium">مرحّل من الشهر السابق</th>
              <th className="px-4 py-3 font-medium">مشتريات جديدة</th>
              <th className="px-4 py-3 font-medium">المخزون الحالي</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">

            {filteredData.map((item) => (
              <>
                <tr
                  key={item.product_id}
                  className="hover:bg-gray-50"
                >

                  <td className="px-4 py-3 font-medium text-gray-800">
                    {item.product_name}
                  </td>

                  <td className="px-4 py-3">
                    {item.carried_forward}
                  </td>

                  <td className="px-4 py-3">
                    {item.new_purchases}
                  </td>

                  <td
                    className="px-4 py-3 font-semibold"
                    style={{ color: '#8B5E3C' }}
                  >
                    {item.current_stock}
                  </td>

                  <td className="px-4 py-3">

                    <button
                      onClick={() => toggleRow(item.product_id)}
                      className="text-xs px-3 py-1 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
                    >
                      {expandedRow === item.product_id
                        ? 'إخفاء الدفعات'
                        : 'عرض الدفعات'}
                    </button>

                  </td>
                </tr>

                {expandedRow === item.product_id && (
                  <tr key={`${item.product_id}-batches`}>

                    <td colSpan={5} className="bg-gray-50 px-4 py-3">

                      <div className="text-xs text-gray-500 mb-2">
                        دفعات مرحّلة من فترات سابقة (
                        {item.carried_batches?.length ?? 0}
                        )
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

                          {(item.carried_batches ?? []).map((batch, idx) => (
                            <tr key={idx}>
                              <td className="px-3 py-2">
                                {batch.purchase_date}
                              </td>

                              <td className="px-3 py-2">
                                {batch.original_qty}
                              </td>

                              <td className="px-3 py-2">
                                {batch.remaining}
                              </td>

                              <td className="px-3 py-2">
                                {batch.expire_date}
                              </td>
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

      {filteredData.length === 0 && (
        <div className="text-center text-gray-400 py-10">
          لا توجد بيانات مخزون
        </div>
      )}

    </div>
  );
}

export default WarehouseInventory;
