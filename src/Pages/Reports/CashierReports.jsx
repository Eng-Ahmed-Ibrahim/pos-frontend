import { useEffect, useState } from "react";
import Select from "react-select";
import { apiFetch } from "@/Components/apiFetch";

function CashierReports() {
    const [sales, setSales] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const today = new Date().toISOString().split("T")[0];

    const [filters, setFilters] = useState({
        user_id: "",
        from: today,
        to: today,
    });

    const [cashiers, setCashiers] = useState([]);
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const filterParamters = `user_id=${filters.user_id}&to=${filters.to}&from=${filters.from}`
            const response = await apiFetch(`cashier-reports?${filterParamters}`);
            const data = await response.json();
            setSales(data.data.sales);
            setTotalPrice(data.data.total_price)
            setCashiers(data.data.cashiers)
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="container py-4">
            <h3 className="mb-3"> تقارير مبيعات الكاشير</h3>
            <div className="row mb-4">

                <div className="col-lg-4 col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                        <i className="bi bi-person-badge me-1"></i>
                        الكاشير
                    </label>

                    <Select
                        isClearable
                        isSearchable
                        placeholder="ابحث عن كاشير..."
                        options={cashiers.map(user => ({
                            value: user.id,
                            label: user.name
                        }))}
                        value={
                            cashiers
                                .map(user => ({
                                    value: user.id,
                                    label: user.name
                                }))
                                .find(option => option.value == filters.user_id) || null
                        }
                        onChange={(selected) =>
                            setFilters({
                                ...filters,
                                user_id: selected?.value || ""
                            })
                        }
                    />
                </div>

                <div className="col-md-3 mb-3">
                    <label className="form-label">
                        من
                    </label>

                    <input
                        type="date"
                        className="form-control"
                        value={filters.from}
                        onChange={(e) =>
                            setFilters({
                                ...filters,
                                from: e.target.value
                            })
                        }
                    />
                </div>

                <div className="col-md-3 mb-3">
                    <label className="form-label">
                        إلى
                    </label>

                    <input
                        type="date"
                        className="form-control"
                        value={filters.to}
                        onChange={(e) =>
                            setFilters({
                                ...filters,
                                to: e.target.value
                            })
                        }
                    />
                </div>

                <div
                    className="col-md-2 d-flex align-items-end mb-3"
                >

                    <button
                        className="btn btn-primary w-100 d-flex justify-center"
                        onClick={fetchData}
                    >
                        بحث
                    </button>

                </div>

            </div>
            <div
                style={{
                    display: "flex",
                    gap: "20px",
                    marginBottom: "25px",
                    flexWrap: "wrap",
                }}
            >
                <div
                    style={{
                        background: "#fff",
                        borderRadius: "12px",
                        padding: "20px",
                        minWidth: "250px",
                        boxShadow: "0 2px 10px rgba(0,0,0,.08)",
                        borderLeft: "5px solid #198754",
                    }}
                >
                    <div
                        style={{
                            fontSize: "14px",
                            color: "#6c757d",
                            marginBottom: "8px",
                        }}
                    >
                        إجمالي المبيعات
                    </div>

                    <div
                        style={{
                            fontSize: "30px",
                            fontWeight: "bold",
                            color: "#198754",
                        }}
                    >
                        {Number(totalPrice).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}{" "}
                        جنيه
                    </div>
                </div>
            </div>
            <div className="table-wrapper">
                <table className="styled-table">
                    <thead>
                        <tr>
                            <th>رقم الفاتورة</th>
                            <th>الكاشير</th>
                            <th>المنتجات</th>
                            <th>الملبغ</th>
                            <th>المدفوع</th>
                            <th>التاريخ</th>
                        </tr>
                    </thead>

                    <tbody>
                        {sales.map((sale) => (
                            <tr key={sale.id}>
                                <td>{sale.id}</td>

                                <td>{sale.user?.name ?? "Unknown"}</td>

                                <td>
                                    {sale.items.map((item) => (
                                        <div key={item.id}>
                                            {item.product.name}
                                            {" "}
                                            ({item.quantity} × {item.price})
                                        </div>
                                    ))}
                                </td>

                                <td>{sale.total}</td>

                                <td>{sale.amount_paid ?? "-"}</td>

                                <td>
                                    {new Date(sale.created_at).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default CashierReports;