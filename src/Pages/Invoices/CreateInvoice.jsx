import { useState, useEffect, useRef } from 'react'
import './CreateInvoice.css'
import { apiFetch } from "@/Components/apiFetch";

// عدّل هذا الرابط حسب رابط الـ API لديك
const SERVER_BASE = import.meta.env.VITE_SERVER_BASE
const API_BASE = import.meta.env.VITE_API_URL;
function CreateInvoice() {
    const addSound = new Audio('/beep.mp3');
    const token = localStorage.getItem("token");
  // ---------- بيانات أساسية تُجلب من الخادم ----------
  const [categories, setCategories] = useState([])
  const [subCategories, setSubCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [products, setProducts] = useState([])

  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // ---------- بيانات الفاتورة (الهيدر) ----------
  const [supplierId, setSupplierId] = useState('')
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [image, setImage] = useState('')

  // ---------- أصناف الفاتورة ----------
  const [items, setItems] = useState([])

  // ---------- البحث عن منتج / السكانر ----------
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [itemPrice, setItemPrice] = useState('')
  const [itemExpireDate, setItemExpireDate] = useState(new Date().toISOString().slice(0, 10))

  const searchInputRef = useRef(null)
  const quantityInputRef = useRef(null)

  // ---------- نموذج إضافة منتج جديد ----------
  const [showNewProductForm, setShowNewProductForm] = useState(false)
  const [savingProduct, setSavingProduct] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: '',
    barcode: '',
    category_id: '',
    sub_category_id: '',
    price: '',
    stock: '',
    minimum_stock: '',
  })

  const [submitting, setSubmitting] = useState(false)

  // جلب البيانات الأساسية عند تحميل الصفحة، والتركيز على حقل البحث فورًا (جاهز للسكانر)
  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (!loadingData) {
      searchInputRef.current?.focus()
    }
  }, [loadingData])

  const fetchInitialData = async () => {
    setLoadingData(true)
    setError('')
    try {
      const res = await apiFetch(`purchase/create-page`,{
        method:"GET",
        headers: { Accept: "application/json","Authorization": `Bearer ${token}` },
      })
      const json = await res.json()
      if (json.status) {
        setCategories(json.data.categories || [])
        setSubCategories(json.data.sub_categories || [])
        setSuppliers(json.data.suppliers || [])
        setProducts(json.data.products || [])
      } else {
        setError('فشل تحميل بيانات الصفحة')
      }
    } catch (err) {
      setError('تعذر الاتصال بالخادم، تأكد من تشغيل السيرفر')
    } finally {
      setLoadingData(false)
    }
  }

  // نتائج البحث (بالاسم أو الباركود) - فلترة محلية من المنتجات المحملة
  const searchResults = (() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term || selectedProduct) return []
    return products.filter(
      (p) =>
        p.barcode?.toLowerCase().includes(term) ||
        p.name?.toLowerCase().includes(term)
    )
  })()

  const noResultsFound =
    searchTerm.trim() !== '' && !selectedProduct && searchResults.length === 0 && !showNewProductForm

  // مطابقة كاملة (تامة) للباركود - هي اللي بتفرق بين "بحث جزئي بالاسم" و "سكان باركود حقيقي"
  const findExactBarcodeMatch = (value) => {
    const term = value.trim()
    if (!term) return null
    return products.find((p) => p.barcode && p.barcode === term) || null
  }

  const resetSearchState = () => {
    setSearchTerm('')
    setSelectedProduct(null)
    setItemPrice('')
    setItemExpireDate(new Date().toISOString().slice(0, 10))

    setQuantity(1)
    setShowNewProductForm(false)
    requestAnimationFrame(() => searchInputRef.current?.focus())
  }

  // إضافة المنتج فعليًا لجدول الفاتورة (تُستخدم في الإضافة اليدوية وفي السكان التلقائي)
  const addItemToInvoice = (product, qty, price, expireDate) => {
    setError('')
    if (!product) return

    const quantityNum = Number(qty)
    const priceNum = Number(price)

    if (!quantityNum || quantityNum <= 0) {
      setError('الكمية غير صحيحة')
      return
    }
    if (price === '' || price === null || Number.isNaN(priceNum) || priceNum < 0) {
      setError('سعر الشراء غير صحيح')
      return
    }

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.product_id === product.id)
      if (existingIndex > -1) {
        const updated = [...prev]
        const newQty = updated[existingIndex].quantity + quantityNum
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          price: priceNum,
          expire_date: expireDate,
          subtotal: newQty * priceNum,
        }
        return updated
      }
      return [
        ...prev,
        {
          product_id: product.id,
          name: product.name,
          barcode: product.barcode,
          quantity: quantityNum,
          price: priceNum,
          expire_date: expireDate,
          subtotal: quantityNum * priceNum,
        },
      ]
    }) 
        addSound.play();

    setSuccessMsg(`تمت إضافة "${product.name}" للفاتورة`)
  }

  // أي تغيير في حقل البحث - هنا بيتم اكتشاف السكان التلقائي
  const handleSearchChange = (value) => {
    setSearchTerm(value)
    setError('')
    setShowNewProductForm(false)

    const exact = findExactBarcodeMatch(value)
    if (exact) {
      // باركود مطابق تمامًا = سكانر (أو كتابة باركود كامل يدويًا) => إضافة تلقائية فورًا
      addItemToInvoice(exact, 1, exact.purchase_price ?? exact.price ?? 0, itemExpireDate)
      resetSearchState()
      return
    }

    setSelectedProduct(null)
    setItemPrice('')

  }

  // دعم السكانرات اللي بترسل Enter بعد الباركود، وكذلك الإضافة بالكيبورد فقط
  const handleSearchKeyDown = (e) => {
    if (e.key !== 'Enter') return
    e.preventDefault()

    if (selectedProduct) {
      handleAddItem()
      return
    }

    const exact = findExactBarcodeMatch(searchTerm)
    if (exact) {
      addItemToInvoice(exact, 1, exact.purchase_price ?? exact.price ?? 0, itemExpireDate)
      resetSearchState()
      return
    }

    if (searchResults.length === 1) {
      handleSelectProduct(searchResults[0])
    }
  }

  const handleSelectProduct = (product) => {
    setSelectedProduct(product)
    setSearchTerm(product.name)
    setItemPrice(0)
    setQuantity(1)
    setShowNewProductForm(false)
    requestAnimationFrame(() => {
      quantityInputRef.current?.focus()
      quantityInputRef.current?.select()
    })
  }

  const handleClearSelection = () => {
    resetSearchState()
  }

  const handleStartNewProduct = () => {
    const term = searchTerm.trim()
    const looksLikeBarcode = /^[0-9]{4,}$/.test(term)
    setShowNewProductForm(true)
    setSelectedProduct(null)
    setNewProduct({
      name: looksLikeBarcode ? '' : term,
      barcode: looksLikeBarcode ? term : '',
      category_id: '',
      sub_category_id: '',
      price: '',
      purchase_price: '',
      stock: '',
      minimum_stock: '',
    })
  }

  const subCategoriesForCategory = (categoryId) =>
    subCategories.filter((s) => String(s.category_id) === String(categoryId))

  const handleSaveNewProduct = async () => {
    if (!newProduct.name.trim()) {
      setError('اسم المنتج مطلوب')
      return
    }
    setSavingProduct(true)
    setError('')
    try {
      // عدّل المسار "/products" إذا كان مختلفًا في الباك إند لديك
      const res = await apiFetch(`products`, {
        method: 'POST',
        headers: { Accept: "application/json","Content-Type": "application/json","Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          name: newProduct.name,
          barcode: newProduct.barcode || null,
          category_id: newProduct.category_id || null,
          sub_category_id: newProduct.sub_category_id || null,
          price: newProduct.price || 0,
          minimum_stock: newProduct.minimum_stock || 0,
        }),
      })
      const json = await res.json()
      if (json.status) {
        const created = json.data
        setProducts((prev) => [...prev, created])
        setSelectedProduct(created)
        setSearchTerm(created.name)
        setItemPrice(created.purchase_price ?? newProduct.purchase_price ?? '')
        setQuantity(1)
        setShowNewProductForm(false)
        setSuccessMsg('تم إضافة المنتج الجديد بنجاح، أكمل إضافته للفاتورة')
        requestAnimationFrame(() => {
          quantityInputRef.current?.focus()
          quantityInputRef.current?.select()
        })
      } else {
        setError(json.message || 'فشل إضافة المنتج')
      }
    } catch (err) {
      setError('حدث خطأ أثناء إضافة المنتج')
    } finally {
      setSavingProduct(false)
    }
  }

  const handleAddItem = () => {
    if (!selectedProduct) {
      setError('اختر منتجًا أولاً')
      return
    }
    addItemToInvoice(selectedProduct, quantity, itemPrice, itemExpireDate)
    resetSearchState()
  }

  const handleRemoveItem = (productId) => {
    setItems((prev) => prev.filter((i) => i.product_id !== productId))
    addSound.play()
  }

  // تعديل الكمية أو السعر مباشرة من الجدول بعد الإضافة (مفيد بعد السكان التلقائي)
  const handleUpdateItem = (productId, field, value) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.product_id !== productId) return item
        const numValue = Number(value)
        const updated = { ...item, [field]: Number.isNaN(numValue) ? 0 : numValue }
        updated.subtotal = updated.quantity * updated.price
        return updated
      })
    )
  }

  const totalAmount = items.reduce((sum, i) => sum + i.subtotal, 0)

  const handleSubmitPurchase = async () => {
    setError('');
    setSuccessMsg('');

    if (!supplierId) {
      setError('اختر المورد');
      return;
    }

    if (items.length === 0) {
      setError('أضف صنفًا واحدًا على الأقل للفاتورة');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();

      formData.append('supplier_id', supplierId);
      formData.append('date', purchaseDate);
      formData.append('invoice_number', invoiceNumber || '');

      if (image) {
        formData.append('image', image);
      }

      items.forEach((item, index) => {
        formData.append(`items[${index}][product_id]`, item.product_id);
        formData.append(`items[${index}][quantity]`, item.quantity);
        formData.append(`items[${index}][price]`, item.price);
        formData.append(`items[${index}][expire_date]`, item.expire_date);
      });

      const res = await apiFetch(`purchases`, {
        method: 'POST',
        body: formData,
        headers: { Accept: "application/json","Authorization": `Bearer ${token}` },
      });

      const json = await res.json();

      if (json.status) {
        setSuccessMsg('تم حفظ الفاتورة بنجاح');
        setItems([]);
        setSupplierId('');
        setImage(null);
        setInvoiceNumber('');
        setPurchaseDate(new Date().toISOString().slice(0, 10));
        resetSearchState();
      } else {
        setError(json.message || 'فشل حفظ الفاتورة');
      }
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء حفظ الفاتورة');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="invoice-page" dir="rtl">
        <p className="loading-text">جاري تحميل البيانات...</p>
      </div>
    )
  }

  return (
    <div className="invoice-page" dir="rtl">
      <div className="invoice-header">
        <h3>إضافة فاتورة شراء جديدة</h3>
        <p className="invoice-subtitle">اسكان الباركود أو اكتب اسم المنتج، وهيتم اختياره/إضافته تلقائيًا</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {/* بيانات الفاتورة */}
      <section className="card">
        <h4 className="card-title">بيانات الفاتورة</h4>
        <div className="form-row">
          <div className="field">
            <label>المورد</label>
            <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
              <option value="">-- اختر المورد --</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>تاريخ الفاتورة</label>
            <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
          </div>
          {/* <div className="field">
            <label>رقم الفاتورة (اختياري)</label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="رقم فاتورة المورد"
            />
          </div> */}
          <div className="field">
            <label > صوره الفاتورة </label>
            <input type="file" className="form-control" onChange={(e) => setImage(e.target.files[0])} />
          </div>
        </div>
      </section>

      {/* إضافة صنف */}
      <section className="card">
        <h4 className="card-title">إضافة منتج للفاتورة (سكان الباركود مباشر هنا)</h4>

        <div className="form-row">
          <div className="field search-field">
            <label>بحث بالاسم أو الباركود</label>
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="اسكان الباركود أو اكتب اسم المنتج..."
              autoComplete="off"
            />

            {searchResults.length > 0 && (
              <div className="dropdown">
                {searchResults.map((p) => (
                  <div key={p.id} className="dropdown-item" onClick={() => handleSelectProduct(p)}>
                    <span className="dropdown-item-name">{p.name}</span>
                    {p.barcode && <span className="dropdown-item-barcode">{p.barcode}</span>}
                  </div>
                ))}
              </div>
            )}

            {noResultsFound && (
              <div className="dropdown">
                <div className="no-result">
                  <span>لا يوجد منتج مطابق</span>
                  <button type="button" className="link-btn" onClick={handleStartNewProduct}>
                    + إضافة منتج جديد بهذا الاسم
                  </button>
                </div>
              </div>
            )}
          </div>

          {selectedProduct && (
            <>
              <div className="field small">
                <label>الكمية</label>
                <input
                  ref={quantityInputRef}
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddItem()
                    }
                  }}
                />
              </div>
              <div className="field small">
                <label>سعر الشراء</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddItem()
                    }
                  }}
                />
              </div>
              <div className="field small">
                <label> تاريخ الصلاحيه </label>

                <input
                  type="date"
                  value={itemExpireDate}
                  onChange={(e) => setItemExpireDate(e.target.value)}
                />
              </div>
              <div className="field action-field">
                <label>&nbsp;</label>
                <div className="btn-group">
                  <button type="button" className="btn btn-primary" onClick={handleAddItem}>
                    إضافة للفاتورة
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={handleClearSelection}>
                    إلغاء
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* نموذج منتج جديد */}
        {showNewProductForm && (
          <div className="new-product-box">
            <h5>بيانات المنتج الجديد</h5>
            <div className="form-row">
              <div className="field">
                <label>اسم المنتج *</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
              </div>
              <div className="field">
                <label>الباركود</label>
                <input
                  type="text"
                  value={newProduct.barcode}
                  onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="field">
                <label>القسم</label>
                <select
                  value={newProduct.category_id}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, category_id: e.target.value, sub_category_id: '' })
                  }
                >
                  <option value="">-- اختر القسم --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>القسم الفرعي</label>
                <select
                  value={newProduct.sub_category_id}
                  onChange={(e) => setNewProduct({ ...newProduct, sub_category_id: e.target.value })}
                  disabled={!newProduct.category_id}
                >
                  <option value="">-- اختر القسم الفرعي --</option>
                  {subCategoriesForCategory(newProduct.category_id).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">

              <div className="field small">
                <label>سعر البيع</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                />
              </div>

              <div className="field small">
                <label>حد أدنى للمخزون</label>
                <input
                  type="number"
                  min="0"
                  value={newProduct.minimum_stock}
                  onChange={(e) => setNewProduct({ ...newProduct, minimum_stock: e.target.value })}
                />
              </div>
            </div>

            <div className="btn-group">
              <button
                type="button"
                className="btn btn-primary"
                disabled={savingProduct}
                onClick={handleSaveNewProduct}
              >
                {savingProduct ? 'جارٍ الحفظ...' : 'حفظ المنتج والمتابعة'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowNewProductForm(false)}>
                إلغاء
              </button>
            </div>
          </div>
        )}
      </section>

      {/* جدول الأصناف */}
      <section className="card">
        <h4 className="card-title">أصناف الفاتورة ({items.length})</h4>

        {items.length === 0 ? (
          <p className="empty-text">لم تتم إضافة أي صنف بعد - اسكان أول باركود يبدأ الفاتورة</p>
        ) : (
          <table className="items-table">
            <thead>
              <tr>
                <th>المنتج</th>
                <th>الباركود</th>
                <th>الكمية</th>
                <th>السعر</th>
                <th>تاريخ الصلاحيه</th>
                <th>الإجمالي</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.product_id}>
                  <td>{i.name}</td>
                  <td className="muted">{i.barcode || '-'}</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={i.quantity}
                      onChange={(e) => handleUpdateItem(i.product_id, 'quantity', e.target.value)}
                      className="table-input"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={i.price}
                      onChange={(e) => handleUpdateItem(i.product_id, 'price', e.target.value)}
                      className="table-input"
                    />
                  </td>

                  <td>
                    <input
                      type="date"
                      value={i.expire_date || ''}
                      onChange={(e) => handleUpdateItem(i.product_id,'expire_date' ,e.target.value)}
                      className="table-input"
                    />
                  </td>
                  <td className="bold">{i.subtotal.toFixed(2)}</td>
                  <td>
                    <button type="button" className="btn btn-danger-text" onClick={() => handleRemoveItem(i.product_id)}>
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="4" className="bold">
                  الإجمالي الكلي
                </td>
                <td className="bold total-cell">{totalAmount.toFixed(2)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        )}
      </section>

      <div className="submit-bar">
        <button type="button" className="btn btn-primary btn-large" disabled={submitting} onClick={handleSubmitPurchase}>
          {submitting ? 'جارٍ حفظ الفاتورة...' : 'حفظ الفاتورة'}
        </button>
      </div>
    </div>
  )
}

export default CreateInvoice