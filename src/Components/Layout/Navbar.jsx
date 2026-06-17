import { useState } from 'react'

function Navbar() {
  const [count, setCount] = useState(0)

  return (
    <>
            <div className="topbar">
            <div className="page-title" id="page-title">Admin</div>
            <div className="topbar-actions" id="topbar-actions">

                {/* <button className="btn btn-primary">
                    ＋ اضافة فاتورة
                </button> */}
            </div>
        </div>
    </>
  )
}

export default Navbar
