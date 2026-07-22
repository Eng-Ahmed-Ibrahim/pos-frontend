import React, { useState } from "react";
import { DatePicker, Button, Table, Card, Spin, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { apiFetch } from "@/Components/apiFetch";

const { RangePicker } = DatePicker;

// apiFetch بيرجع native fetch Response، لازم نعمل .json() عليها الأول
async function toJson(res) {
  const body = await res.json();
  return body?.data !== undefined ? body.data : body;
}

export default function FinancialReport() {
  const [range, setRange] = useState([dayjs().startOf("month"), dayjs()]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);

  const fetchReport = async () => {
    if (!range || range.length !== 2) {
      message.warning("اختار الفترة الأول");
      return;
    }

    const start_at = range[0].format("YYYY-MM-DD");
    const end_at = range[1].format("YYYY-MM-DD");

    setLoading(true);
    try {
      const [summaryRes, productsRes] = await Promise.all([
        apiFetch(`reports/financial?start_at=${start_at}&end_at=${end_at}`),
        apiFetch(`reports/financial/products?start_at=${start_at}&end_at=${end_at}`),
      ]);

      const summaryData = await toJson(summaryRes);
      const productsData = await toJson(productsRes);

      setSummary(summaryData);
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (err) {
      message.error("حصل خطأ في تحميل التقرير");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "المنتج",
      dataIndex: "product_name",
      key: "product_name",
    },
    {
      title: "الكمية أول الفترة",
      dataIndex: "start_qty",
      key: "start_qty",
      align: "center",
    },
    {
      title: "قيمة أول الفترة",
      dataIndex: "start_value",
      key: "start_value",
      align: "center",
      render: (v) => `${Number(v).toLocaleString()} ج.م`,
    },
    {
      title: "الكمية آخر الفترة",
      dataIndex: "end_qty",
      key: "end_qty",
      align: "center",
    },
    {
      title: "قيمة آخر الفترة",
      dataIndex: "end_value",
      key: "end_value",
      align: "center",
      render: (v) => `${Number(v).toLocaleString()} ج.م`,
    },

  ];

  return (
    <div className="p-6" dir="rtl">
      <h1 className="text-2xl font-bold mb-4">التقارير المالية</h1>

      {/* فلتر التاريخ */}
      <Card className="mb-10 ">
        <div className="flex items-center gap-3 flex-wrap">
          <RangePicker
            value={range}
            onChange={setRange}
            format="YYYY-MM-DD"
            allowClear={false}
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={fetchReport}
            loading={loading}
          >
            عرض التقرير
          </Button>
        </div>
      </Card>

      <Spin spinning={loading}>
        {/* جدول الإحصائيات (أفقي) */}
        {summary && (
          <Card className="mb-6">
            <Table
              rowKey="key"
              pagination={false}
              scroll={{ x: "max-content" }}
              columns={[
                {
                  title: `قيمة البضاعة أول الفترة`,
                  dataIndex: "start_value",
                  key: "start_value",
                  align: "center",
                  render: (v) => (
                    <span className="font-semibold">
                      {Number(v).toLocaleString()} ج.م
                    </span>
                  ),
                },
                {
                  title: `قيمة البضاعة آخر الفترة `,
                  dataIndex: "end_value",
                  key: "end_value",
                  align: "center",
                  render: (v) => (
                    <span className="font-semibold">
                      {Number(v).toLocaleString()} ج.م
                    </span>
                  ),
                },
                // {
                //   title: "التغيير الصافي",
                //   dataIndex: "value_change",
                //   key: "value_change",
                //   align: "center",
                //   render: (v) => (
                //     <span
                //       className={
                //         v >= 0
                //           ? "text-green-600 font-semibold"
                //           : "text-red-600 font-semibold"
                //       }
                //     >
                //       {v >= 0 ? "+" : ""}
                //       {Number(v).toLocaleString()} ج.م
                //     </span>
                //   ),
                // },
                {
                  title: "قيمة المشتريات خلال الفترة",
                  dataIndex: "purchases_value",
                  key: "purchases_value",
                  align: "center",
                  render: (v) => `${Number(v).toLocaleString()} ج.م`,
                },
                {
                  title: "قيمة المرتجعات",
                  dataIndex: "purchase_returns_value",
                  key: "purchase_returns_value",
                  align: "center",
                  render: (v) => `${Number(v).toLocaleString()} ج.م`,
                },
                {
                  title: "قيمة الهالك",
                  dataIndex: "waste_value",
                  key: "waste_value",
                  align: "center",
                  render: (v) => `${Number(v).toLocaleString()} ج.م`,
                },
                {
                  title: "تكلفة البضاعة المباعة",
                  dataIndex: "sold_cost_value",
                  key: "sold_cost_value",
                  align: "center",
                  render: (v) => `${Number(v).toLocaleString()} ج.م`,
                },
              ]}
              dataSource={[{ key: "summary_row", ...summary }]}
            />
          </Card>
        )}

        {/* جدول المنتجات */}
        <Card title="تفصيل قيمة المنتجات">
          <Table
            columns={columns}
            dataSource={products}
            rowKey="product_id"
            pagination={{ pageSize: 15 }}
            locale={{ emptyText: "اختار الفترة واضغط عرض التقرير" }}
          />
        </Card>
      </Spin>
    </div>
  );
}