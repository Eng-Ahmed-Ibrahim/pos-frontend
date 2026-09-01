import { useState } from 'react'
import { useAuth } from "@/context/AuthContext";

function Dashboard() {
    const [count, setCount] = useState(0)
    const { can, permissions, user } = useAuth(); // استخراج اسم المستخدم لو موجود



    return (
        <>
        </>
    )
}

export default Dashboard;