import { useState } from 'react'


function Dashboard() {
    const [count, setCount] = useState(0)

    return (
        <>
            <div className="page active" id="page-dashboard">
                <div className="stats-grid">
                    <div className="stat-card blue">
                        <div className="stat-icon">💰</div>
                        <div className="stat-label">إجمالي المبيعات اليوم</div>
                        <div className="stat-value">25,450 ج.م</div>
                    </div>

                    <div className="stat-card green">
                        <div className="stat-icon">🧾</div>
                        <div className="stat-label">عدد الفواتير </div>
                        <div className="stat-value">187</div>
                    </div>

                    <div className="stat-card amber">
                        <div className="stat-icon">📦</div>
                        <div className="stat-label">عدد المنتجات</div>
                        <div className="stat-value">1,254</div>
                    </div>

                    <div className="stat-card purple">
                        <div className="stat-icon">⚠️</div>
                        <div className="stat-label">منتجات قاربت النفاد</div>
                        <div className="stat-value">18</div>
                    </div>
                </div>

            </div>

        </>
    )
}

export default Dashboard
