import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setAdminToken } from "../api.js";
import { CATEGORIES } from "../categories.js";
import { Mail, MessageCircle } from "lucide-react";

const EMPTY = {
  title: "",
  sku: "",
  price: "",
  discount: 0,
  stock: 1,
  images: "",
  type: "Stitched/Ready to Wear",
  fabric: "Cotton",
  dupatta: "Cotton",
  colorsText: "",
  sizesText: "Free Size",
  categories: [],
  soldOut: false,
  isNew: true,
  description: "",
  careGuide: "Dry wash only.",
  shipping:
    "Free shipping all over India. Dispatched in 3-5 days.",
  variantStockText: "",
};

const tagCategories = CATEGORIES.filter(
  (c) => c.type === "tag"
);

const SIZE_OPTIONS = [
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
  "Unstitched",
  "Custom",
];

const COLOR_PALETTE = [
  ["Black", "#111111"],
  ["White", "#f5f5f5"],
  ["Red", "#a51b2b"],
  ["Maroon", "#7a1f2b"],
  ["Pink", "#e91e63"],
  ["Orange", "#e08a1e"],
  ["Yellow", "#e6c62f"],
  ["Green", "#237a50"],
  ["Blue", "#1c4e9e"],
  ["Navy", "#16213e"],
  ["Purple", "#6b3f92"],
  ["Beige", "#e7d9c2"],
  ["Cream", "#f4ede1"],
  ["Grey", "#8a8a8a"],
];

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [tableSearch, setTableSearch] = useState({
    products: "",
    orders: "",
    customers: "",
  });

  const [pages, setPages] = useState({
    products: 1,
    orders: 1,
    customers: 1,
  });

  const [productSearch, setProductSearch] =
    useState("");

  const [expandedOrder, setExpandedOrder] =
    useState(null);

  const [colorRows, setColorRows] = useState([]);
  const [variantRows, setVariantRows] = useState([]);

 const [manualOrder, setManualOrder] = useState({
  name: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  pinCode: "",
  productId: "",
  title: "",
  price: "",
  color: "",
  size: "",
  quantity: 1,
  paymentMethod: "Whatsapp",
  source: "Whatsapp"
});

  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] =
    useState(null);

  const [error, setError] = useState("");

  const navigate = useNavigate();


  // ============================================================
  // LOAD PRODUCTS
  // ============================================================

  function loadProducts() {
    api
      .get("/products")
      .then((res) => {
        setProducts(res.data);
      })
      .catch((err) => {
        setError(
          err.response?.data?.message ||
            "Unable to load products"
        );
      });
  }


  // ============================================================
  // LOAD ADMIN DATA
  // ============================================================

  function loadAdminData() {
    Promise.all([
      api.get("/admin/orders"),
      api.get("/admin/customers"),
    ])
      .then(
        ([
          ordersResponse,
          customersResponse,
        ]) => {
          setOrders(ordersResponse.data);
          setCustomers(
            customersResponse.data
          );
        }
      )
      .catch((err) => {
        setError(
          err.response?.data?.message ||
            "Unable to load admin data"
        );
      });
  }


  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    const token =
      localStorage.getItem(
        "kcs_admin_token"
      );

    if (!token) {
      navigate("/admin");
      return;
    }

    api.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${token}`;

    loadProducts();
    loadAdminData();

    // eslint-disable-next-line
  }, []);


  // ============================================================
  // LOGOUT
  // ============================================================

  function logout() {
    setAdminToken(null);
    navigate("/admin");
  }


  // ============================================================
  // CATEGORY TOGGLE
  // ============================================================

  function toggleCategory(slug) {
    setForm((f) => ({
      ...f,

      categories: f.categories.includes(
        slug
      )
        ? f.categories.filter(
            (s) => s !== slug
          )
        : [...f.categories, slug],
    }));
  }


  // ============================================================
  // EDIT PRODUCT
  // ============================================================

  function editProduct(p) {
    setEditingId(p._id);

    setForm({
      title: p.title,
      sku: p.sku,
      price: p.price,
      discount: p.discount || 0,
      stock: p.stock ?? 1,
      images: (p.images || []).join(
        ", "
      ),
      type: p.type,
      fabric: p.fabric,
      dupatta: p.dupatta,
      colorsText: "",
      sizesText: (p.sizes || []).join(
        ", "
      ),
      categories: p.categories || [],
      soldOut: p.soldOut,
      isNew: p.isNew,
      description: p.description,
      careGuide: p.careGuide,
      shipping: p.shipping,
      variantStockText: "",
    });

    setColorRows(
      (p.colors || []).map((color) => ({
        name: color.name,
        hex: color.hex,
        stock: color.stock ?? 1,
        images: (
          color.images || []
        ).join(", "),
      }))
    );

    setVariantRows(
      p.variantStock || []
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }


  // ============================================================
  // DELETE PRODUCT
  // ============================================================

  async function deleteProduct(id) {
    if (
      !window.confirm(
        "Delete this product?"
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/products/${id}`
      );

      loadProducts();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete product"
      );
    }
  }


  // ============================================================
  // UPDATE ORDER
  // ============================================================

  async function updateOrder(
    order,
    field,
    value
  ) {
    try {
      const response =
        await api.patch(
          `/admin/orders/${order._id}`,
          {
            [field]: value,
          }
        );

      setOrders((current) =>
        current.map((item) =>
          item._id === order._id
            ? response.data
            : item
        )
      );

      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update order"
      );
    }
  }


  // ============================================================
  // CREATE MANUAL / OFFLINE ORDER
  // ============================================================

  async function createManualOrder(
    event
  ) {
    event.preventDefault();

    try {
      setError("");

      await api.post(
        "/admin/orders",
        {
          customer: {
            name:
              manualOrder.name,
            phone:
              manualOrder.phone,
            email:
              manualOrder.email,
            address:
              manualOrder.address,
            city:
              manualOrder.city,
            state:
              manualOrder.state,
            pinCode:
              manualOrder.pinCode,
          },

          source:
            manualOrder.source,

          paymentMethod:
            manualOrder.paymentMethod,

          items: [
            {
              productId:
                manualOrder.productId ||
                undefined,

              title:
                manualOrder.title,

              price:
                manualOrder.price,

              quantity:
                manualOrder.quantity,
              color:
                manualOrder.color ||
                undefined,
              size:
                manualOrder.size ||
                undefined,
            },
          ],
        }
      );

      setManualOrder({
        name: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        state: "",
        pinCode: "",
        title: "",
        price: "",
        color: "",
        size: "",
        quantity: 1,
        paymentMethod:
          "whatsapp",
        source: "whatsapp",
        productId: "",
      });

      setProductSearch("");

      loadAdminData();
      loadProducts();

    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to create offline order"
      );
    }
  }


  // ============================================================
  // PAGINATION
  // ============================================================

  function paged(items, key) {
    const search =
      tableSearch[key]
        .trim()
        .toLowerCase();

    const filtered = items.filter(
      (item) =>
        JSON.stringify(item)
          .toLowerCase()
          .includes(search)
    );

    const pageCount = Math.max(
      1,
      Math.ceil(
        filtered.length / 20
      )
    );

    const page = Math.min(
      pages[key],
      pageCount
    );

    return {
      rows: filtered.slice(
        (page - 1) * 20,
        page * 20
      ),
      pageCount,
      page,
    };
  }


  // ============================================================
  // TABLE SEARCH
  // ============================================================

  function setTableSearchValue(
    key,
    value
  ) {
    setTableSearch((current) => ({
      ...current,
      [key]: value,
    }));

    setPages((current) => ({
      ...current,
      [key]: 1,
    }));
  }


  // ============================================================
  // WHATSAPP MESSAGE
  // ============================================================

  function getOrderMessage(order) {
    const orderId =
      order._id
        .slice(-8)
        .toUpperCase();

    const items = (
      order.items || []
    )
      .map(
        (item) =>
          `- ${item.title} x${item.quantity}` +
          `${
            item.size
              ? ` | Size: ${item.size}`
              : ""
          }` +
          `${
            item.color
              ? ` | Shade: ${item.color}`
              : ""
          }` +
          ` | Rs. ${Number(
            item.price
          ).toLocaleString(
            "en-IN"
          )}`
      )
      .join("\n");

    const address =
      order.shippingAddress ||
      {};

    return `Hello ${
      order.customer?.name ||
      address.name ||
      "Customer"
    },

Order update from Kashmir Cloth Stores
Order ID: #${orderId}
Status: ${order.status}
Payment: ${order.paymentMethod}

Order summary:
${items}

Total: Rs. ${Number(
      order.total
    ).toLocaleString("en-IN")}

Delivery address: ${
      address.address || ""
    }, ${
      address.city || ""
    }, ${
      address.state || ""
    } - ${
      address.pinCode || ""
    }

${
  order.trackingNumber
    ? `Tracking: ${
        order.carrier ||
        "Shipment"
      } ${
        order.trackingNumber
      }\n`
    : ""
}
Thank you for shopping with Kashmir Cloth Stores.`;
  }


  // ============================================================
  // OPEN WHATSAPP
  // ============================================================

  function openWhatsApp(order) {
    const phone = String(
      order.shippingAddress
        ?.phone ||
        order.customer?.phone ||
        ""
    ).replace(
      /[^0-9]/g,
      ""
    );

    if (!phone) {
      setError(
        "This order has no customer phone number"
      );

      return;
    }

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(
        getOrderMessage(order)
      )}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

// ============================================================
// SEND EMAIL VIA GMAIL COMPOSE
// ============================================================

function sendStructuredEmail(order) {
  const email =
    order.shippingAddress?.email ||
    order.customer?.email;

  if (!email) {
    setError("This order has no customer email address");
    return;
  }

  const orderId = order._id
    .slice(-8)
    .toUpperCase();

  const subject =
    `Kashmir Cloth Stores order #${orderId} update`;

  const body = getOrderMessage(order);

  const gmailUrl =
    `https://mail.google.com/mail/?view=cm&fs=1` +
    `&to=${encodeURIComponent(email)}` +
    `&su=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`;

  window.open(
    gmailUrl,
    "_blank",
    "noopener,noreferrer"
  );
}
  // ============================================================
  // DELETE ORDER
  // ============================================================

  async function deleteOrder(order) {
    if (
      !window.confirm(
        `Delete order #${order._id
          .slice(-8)
          .toUpperCase()}? Stock will be restored.`
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/admin/orders/${order._id}`
      );

      setOrders((current) =>
        current.filter(
          (item) =>
            item._id !== order._id
        )
      );

      setExpandedOrder(null);

    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete order"
      );
    }
  }


  // ============================================================
  // RESET PRODUCT FORM
  // ============================================================

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY);
    setColorRows([]);
    setVariantRows([]);
  }


  // ============================================================
  // UPDATE VARIANT ROW
  // ============================================================

  function updateVariantRow(
    index,
    field,
    value
  ) {
    setVariantRows((rows) => {
      const next = rows.map(
        (row, rowIndex) =>
          rowIndex === index
            ? {
                ...row,
                [field]: value,
              }
            : row
      );

      const keys = next.map(
        (row) =>
          `${String(
            row.color
          )
            .trim()
            .toLowerCase()}::${String(
            row.size
          )
            .trim()
            .toLowerCase()}`
      );

      if (
        keys[index] !== "::" &&
        keys.filter(
          (key) =>
            key === keys[index]
        ).length > 1
      ) {
        setError(
          "That color and size combination already exists. Edit its quantity instead."
        );

        return rows;
      }

      setError("");

      return next;
    });
  }


  // ============================================================
  // ADD VARIANT ROW
  // ============================================================

  function addVariantRow() {
    const color =
      colorRows[0]?.name || "";

    if (!color) {
      setError(
        "Add a color before adding its size quantity."
      );

      return;
    }

    if (
      variantRows.some(
        (variant) =>
          variant.size ===
            SIZE_OPTIONS[0] &&
          variant.color === color
      )
    ) {
      setError(
        "That color and size combination already exists. Edit its quantity instead."
      );

      return;
    }

    setVariantRows((rows) => [
      ...rows,
      {
        size:
          SIZE_OPTIONS[0],
        color,
        stock: 1,
      },
    ]);
  }


  // ============================================================
  // PRODUCT SUBMIT
  // ============================================================

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    // Prevent duplicate color + size
    const variantKeys = new Set();

    for (const variant of variantRows) {
      const key =
        `${String(
          variant.color
        )
          .trim()
          .toLowerCase()}::${String(
          variant.size
        )
          .trim()
          .toLowerCase()}`;

      if (
        !variant.color ||
        !variant.size ||
        variantKeys.has(key)
      ) {
        setError(
          "Each color and size combination must appear only once."
        );

        return;
      }

      variantKeys.add(key);
    }


    // Prevent duplicate colors
    const colorKeys = new Set();

    for (const color of colorRows) {
      const key =
        String(color.name)
          .trim()
          .toLowerCase();

      if (
        !key ||
        colorKeys.has(key)
      ) {
        setError(
          "Each color can be added only once."
        );

        return;
      }

      colorKeys.add(key);
    }


    const payload = {
      title: form.title,

      sku: form.sku,

      price:
        Number(form.price),

      discount:
        Number(form.discount) || 0,

      stock:
        Math.max(
          0,
          Number(form.stock) || 0
        ),

      images:
        form.images
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),

      type:
        form.type,

      fabric:
        form.fabric,

      dupatta:
        form.dupatta,

      colors:
        colorRows.map(
          (color) => ({
            ...color,

            stock:
              Math.max(
                0,
                Number(
                  color.stock
                ) || 0
              ),

            images:
              color.images
                .split(",")
                .map(
                  (image) =>
                    image.trim()
                )
                .filter(Boolean),
          })
        ),

      variantStock:
        variantRows
          .filter(
            (variant) =>
              variant.size &&
              variant.color
          )
          .map(
            (variant) => ({
              ...variant,

              stock:
                Math.max(
                  0,
                  Number(
                    variant.stock
                  ) || 0
                ),
            })
          ),

      sizes:
        variantRows.length
          ? [
              ...new Set(
                variantRows.map(
                  (variant) =>
                    variant.size
                )
              ),
            ]
          : form.sizesText
              .split(",")
              .map(
                (s) =>
                  s.trim()
              )
              .filter(Boolean),

      categories:
        form.categories,

      soldOut:
        form.soldOut,

      isNew:
        form.isNew,

      description:
        form.description,

      careGuide:
        form.careGuide,

      shipping:
        form.shipping,
    };


    try {
      if (editingId) {
        await api.put(
          `/products/${editingId}`,
          payload
        );
      } else {
        await api.post(
          "/products",
          payload
        );
      }

      resetForm();
      loadProducts();

    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Something went wrong"
      );
    }
  }


  // ============================================================
  // UI
  // ============================================================

  return (
    <main className="admin-dashboard">

      {/* ======================================================
          HEADER
      ======================================================= */}

      <div className="admin-head">
        <h2>
          Admin Panel — Products
        </h2>

        <button
          onClick={logout}
        >
          Logout
        </button>
      </div>


      {/* ======================================================
          PRODUCT FORM
      ======================================================= */}

      <form
        className="admin-form"
        onSubmit={handleSubmit}
      >
        <h3>
          {editingId
            ? "Edit Product"
            : "Add New Product"}
        </h3>

        {error && (
          <p className="error">
            {error}
          </p>
        )}

        <div className="admin-grid">

          <label>
            Title

            <input
              value={form.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  title:
                    e.target.value,
                })
              }
              required
            />
          </label>


          <label>
            SKU / Code

            <input
              value={form.sku}
              onChange={(e) =>
                setForm({
                  ...form,
                  sku:
                    e.target.value,
                })
              }
              required
            />
          </label>


          <label>
            Price (Rs.)

            <input
              type="number"
              value={form.price}
              onChange={(e) =>
                setForm({
                  ...form,
                  price:
                    e.target.value,
                })
              }
              required
            />
          </label>


          <label>
            Product stock

            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) =>
                setForm({
                  ...form,
                  stock:
                    e.target.value,
                })
              }
              required
            />
          </label>


          <label>
            Discount (%)

            <input
              type="number"
              min="0"
              max="99"
              value={form.discount}
              onChange={(e) =>
                setForm({
                  ...form,
                  discount:
                    e.target.value,
                })
              }
            />
          </label>


          <label>
            Type

            <input
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type:
                    e.target.value,
                })
              }
            />
          </label>


          <label>
            Fabric

            <input
              value={form.fabric}
              onChange={(e) =>
                setForm({
                  ...form,
                  fabric:
                    e.target.value,
                })
              }
            />
          </label>


          <label>
            Dupatta

            <input
              value={form.dupatta}
              onChange={(e) =>
                setForm({
                  ...form,
                  dupatta:
                    e.target.value,
                })
              }
            />
          </label>


          <label className="span-2">
            Image URLs
            (comma separated)

            <input
              value={form.images}
              onChange={(e) =>
                setForm({
                  ...form,
                  images:
                    e.target.value,
                })
              }
              placeholder="https://... , https://..."
            />
          </label>


          {/* COLORS */}

          <label className="span-2">

            Colors and shade photos

            <div className="palette-picker">

              {COLOR_PALETTE.map(
                ([name, hex]) => (
                  <button
                    type="button"
                    key={name}
                    title={`Add ${name}`}
                    className="palette-swatch"
                    style={{
                      background:
                        hex,
                    }}
                    onClick={() =>
                      setColorRows(
                        (rows) =>
                          rows.some(
                            (row) =>
                              row.name ===
                              name
                          )
                            ? rows
                            : [
                                ...rows,
                                {
                                  name,
                                  hex,
                                  stock: 1,
                                  images:
                                    "",
                                },
                              ]
                      )
                    }
                  />
                )
              )}

            </div>


            <div className="variant-editor">

              {colorRows.map(
                (
                  color,
                  index
                ) => (

                  <div
                    className="variant-editor-row"
                    key={`${color.name}-${index}`}
                  >

                    <select
                      value={
                        color.name
                      }
                      onChange={(e) => {
                        const [
                          name,
                          hex,
                        ] =
                          COLOR_PALETTE.find(
                            (item) =>
                              item[0] ===
                              e.target
                                .value
                          ) ||
                          [
                            e.target.value,
                            color.hex,
                          ];

                        setColorRows(
                          (rows) =>
                            rows.map(
                              (
                                row,
                                i
                              ) =>
                                i === index
                                  ? {
                                      ...row,
                                      name,
                                      hex,
                                    }
                                  : row
                            )
                        );
                      }}
                    >
                      {COLOR_PALETTE.map(
                        ([name]) => (
                          <option
                            key={name}
                          >
                            {name}
                          </option>
                        )
                      )}
                    </select>


                    <input
                      type="color"
                      value={
                        color.hex
                      }
                      aria-label={`${color.name} color`}
                      onChange={(e) =>
                        setColorRows(
                          (rows) =>
                            rows.map(
                              (
                                row,
                                i
                              ) =>
                                i === index
                                  ? {
                                      ...row,
                                      hex:
                                        e.target
                                          .value,
                                    }
                                  : row
                            )
                        )
                      }
                    />


                    <input
                      type="number"
                      min="0"
                      value={
                        color.stock
                      }
                      placeholder="Stock"
                      onChange={(e) =>
                        setColorRows(
                          (rows) =>
                            rows.map(
                              (
                                row,
                                i
                              ) =>
                                i === index
                                  ? {
                                      ...row,
                                      stock:
                                        e.target
                                          .value,
                                    }
                                  : row
                            )
                        )
                      }
                    />


                    <input
                      value={
                        color.images
                      }
                      placeholder="Shade photo URL(s), comma separated"
                      onChange={(e) =>
                        setColorRows(
                          (rows) =>
                            rows.map(
                              (
                                row,
                                i
                              ) =>
                                i === index
                                  ? {
                                      ...row,
                                      images:
                                        e.target
                                          .value,
                                    }
                                  : row
                            )
                        )
                      }
                    />


                    <button
                      type="button"
                      onClick={() =>
                        setColorRows(
                          (rows) =>
                            rows.filter(
                              (_, i) =>
                                i !==
                                index
                            )
                        )
                      }
                    >
                      Remove
                    </button>

                  </div>

                )
              )}

            </div>

          </label>


          {/* VARIANTS */}

          <label className="span-2">

            Size-wise quantity by color

            <div className="variant-editor">

              {variantRows.map(
                (
                  variant,
                  index
                ) => (

                  <div
                    className="variant-editor-row"
                    key={`${variant.size}-${variant.color}-${index}`}
                  >

                    <select
                      value={
                        variant.size
                      }
                      onChange={(e) =>
                        updateVariantRow(
                          index,
                          "size",
                          e.target.value
                        )
                      }
                    >
                      {SIZE_OPTIONS.map(
                        (size) => (
                          <option
                            key={size}
                          >
                            {size}
                          </option>
                        )
                      )}
                    </select>


                    <select
                      value={
                        variant.color
                      }
                      onChange={(e) =>
                        updateVariantRow(
                          index,
                          "color",
                          e.target.value
                        )
                      }
                    >
                      <option value="">
                        Color
                      </option>

                      {colorRows.map(
                        (color) => (
                          <option
                            key={
                              color.name
                            }
                          >
                            {
                              color.name
                            }
                          </option>
                        )
                      )}

                    </select>


                    <input
                      type="number"
                      min="0"
                      value={
                        variant.stock
                      }
                      placeholder="Quantity"
                      onChange={(e) =>
                        setVariantRows(
                          (rows) =>
                            rows.map(
                              (
                                row,
                                i
                              ) =>
                                i === index
                                  ? {
                                      ...row,
                                      stock:
                                        e.target
                                          .value,
                                    }
                                  : row
                            )
                        )
                      }
                    />


                    <button
                      type="button"
                      onClick={() =>
                        setVariantRows(
                          (rows) =>
                            rows.filter(
                              (_, i) =>
                                i !==
                                index
                            )
                        )
                      }
                    >
                      Remove
                    </button>

                  </div>

                )
              )}


              <button
                type="button"
                className="add-variant-button"
                onClick={
                  addVariantRow
                }
              >
                + Add size and color
                quantity
              </button>

            </div>

          </label>


          <label className="span-2">
            Description

            <textarea
              value={
                form.description
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  description:
                    e.target.value,
                })
              }
            />
          </label>


          <label className="span-2">
            Care Guide

            <textarea
              value={
                form.careGuide
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  careGuide:
                    e.target.value,
                })
              }
            />
          </label>


          <div className="span-2 checkbox-row">

            <label>
              <input
                type="checkbox"
                checked={
                  form.soldOut
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    soldOut:
                      e.target.checked,
                  })
                }
              />

              Sold Out
            </label>


            <label>
              <input
                type="checkbox"
                checked={
                  form.isNew
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    isNew:
                      e.target.checked,
                  })
                }
              />

              Mark as New
            </label>

          </div>


          {/* CATEGORIES */}

          <div className="span-2">

            <h4>
              Categories
              (a product can be in
              more than one)
            </h4>

            <div className="category-checkboxes">

              {tagCategories.map(
                (c) => (
                  <label
                    key={c.slug}
                  >
                    <input
                      type="checkbox"
                      checked={form.categories.includes(
                        c.tag
                      )}
                      onChange={() =>
                        toggleCategory(
                          c.tag
                        )
                      }
                    />

                    {c.label}
                  </label>
                )
              )}

            </div>

          </div>

        </div>


        <div className="admin-form-actions">

          <button type="submit">
            {editingId
              ? "Save Changes"
              : "Add Product"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
            >
              Cancel Edit
            </button>
          )}

        </div>

      </form>


      {/* ======================================================
          PRODUCTS
      ======================================================= */}

      <h3>
        All Products ({
          products.length
        })
      </h3>

      <input
        className="admin-search"
        placeholder="Search products by title or SKU"
        value={
          tableSearch.products
        }
        onChange={(event) =>
          setTableSearchValue(
            "products",
            event.target.value
          )
        }
      />


      <table className="admin-table">

        <thead>
          <tr>
            <th>Image</th>
            <th>Title</th>
            <th>SKU</th>
            <th>Price</th>
            <th>Categories</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>


        <tbody>

          {paged(
            products,
            "products"
          ).rows.map((p) => (

            <tr
              key={p._id}
            >

              <td>
                <img
                  className="admin-thumb"
                  src={
                    p.images?.[0]
                  }
                  alt=""
                />
              </td>

              <td>
                {p.title}
              </td>

              <td>
                {p.sku}
              </td>

              <td>
                Rs. {p.price}
              </td>

              <td>
                {(
                  p.categories ||
                  []
                ).join(", ")}
              </td>

              <td>
                {p.soldOut
                  ? "Sold Out"
                  : "In Stock"}
              </td>

              <td>

                <button
                  onClick={() =>
                    editProduct(p)
                  }
                >
                  Edit
                </button>

                <button
                  onClick={() =>
                    deleteProduct(
                      p._id
                    )
                  }
                >
                  Delete
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>


      <Pagination
        {...paged(
          products,
          "products"
        )}
        onChange={(value) =>
          setPages(
            (current) => ({
              ...current,
              products:
                value,
            })
          )
        }
      />


      {/* ======================================================
          MANUAL ORDER
      ======================================================= */}

      <section className="admin-section">

        <h3>
          Add WhatsApp / Instagram
          order
        </h3>


        <form
          className="admin-form manual-order-form"
          onSubmit={
            createManualOrder
          }
        >

          <div className="admin-grid">

            {[
              [
                "name",
                "Customer name",
              ],
              [
                "phone",
                "Phone number",
              ],
              [
                "email",
                "Email (optional)",
              ],
              [
                "address",
                "Address",
              ],
              [
                "city",
                "City",
              ],
              [
                "state",
                "State",
              ],
              [
                "pinCode",
                "PIN code",
              ],
            ].map(
              ([field, label]) => (

                <label
                  key={field}
                >
                  {label}

                  <input
                    required={
                      field !==
                      "email"
                    }
                    type={
                      field ===
                      "email"
                        ? "email"
                        : field ===
                          "phone"
                        ? "tel"
                        : "text"
                    }
                    value={
                      manualOrder[
                        field
                      ]
                    }
                    onChange={(
                      event
                    ) =>
                      setManualOrder(
                        {
                          ...manualOrder,
                          [field]:
                            event.target
                              .value,
                        }
                      )
                    }
                  />

                </label>

              )
            )}


            <label className="span-2">

              Search product

              <input
                value={
                  productSearch
                }
                placeholder="Type product name or SKU"
                onChange={(event) =>
                  setProductSearch(
                    event.target.value
                  )
                }
              />

            </label>


            <label>

              Product

              <select
                required
                value={
                  manualOrder.productId ||
                  ""
                }
                onChange={(event) => {
                  const product =
                    products.find(
                      (item) =>
                        item._id ===
                        event.target.value
                    );

                  setManualOrder({
                    ...manualOrder,
                    productId:
                      product?._id || "",
                    title:
                      product?.title || "",
                    price:
                      product
                        ? product.salePrice ??
                          product.price
                        : "",
                    color: "",
                    size: "",
                    quantity: 1,
                  });
                }}
              >
                <option value="">
                  Select product
                </option>

                {products
                  .filter(
                    (product) =>
                      `${product.title} ${product.sku}`
                        .toLowerCase()
                        .includes(
                          productSearch.toLowerCase()
                        )
                  )
                  .slice(0, 20)
                  .map((product) => (
                    <option
                      key={product._id}
                      value={product._id}
                    >
                      {product.title} (SKU{" "}
                      {product.sku})
                    </option>
                  ))}
              </select>

            </label>


            <label>

              Color

              <select
                required
                disabled={!manualOrder.productId}
                value={manualOrder.color || ""}
                onChange={(event) =>
                  setManualOrder({
                    ...manualOrder,
                    color: event.target.value,
                    size: "",
                    quantity: 1,
                  })
                }
              >
                <option value="">
                  {!manualOrder.productId
                    ? "Select product first"
                    : "Select color"}
                </option>

                {(() => {
                  const product =
                    products.find(
                      (item) =>
                        item._id ===
                        manualOrder.productId
                    );

                  const variants =
                    product?.variantStock || [];

                  const variantColors = [
                    ...new Set(
                      variants
                        .filter(
                          (variant) =>
                            variant.color &&
                            Number(variant.stock) > 0
                        )
                        .map(
                          (variant) => variant.color
                        )
                    ),
                  ];

                  const productColors =
                    (product?.colors || [])
                      .map(
                        (color) =>
                          color?.name || color
                      )
                      .filter(Boolean);

                  const colors =
                    variantColors.length
                      ? variantColors
                      : [
                          ...new Set(
                            productColors
                          ),
                        ];

                  return colors.map((color) => (
                    <option
                      key={color}
                      value={color}
                    >
                      {color}
                    </option>
                  ));
                })()}
              </select>

            </label>


            <label>

              Size

              <select
                required
                disabled={
                  !manualOrder.productId ||
                  !manualOrder.color
                }
                value={manualOrder.size || ""}
                onChange={(event) => {
                  const product =
                    products.find(
                      (item) =>
                        item._id ===
                        manualOrder.productId
                    );

                  const variant =
                    (
                      product?.variantStock ||
                      []
                    ).find(
                      (item) =>
                        item.color ===
                          manualOrder.color &&
                        item.size ===
                          event.target.value
                    );

                  setManualOrder({
                    ...manualOrder,
                    size: event.target.value,
                    quantity: Math.min(
                      Number(
                        manualOrder.quantity
                      ) || 1,
                      Number(variant?.stock) || 1
                    ),
                  });
                }}
              >
                <option value="">
                  {!manualOrder.productId
                    ? "Select product first"
                    : !manualOrder.color
                    ? "Select color first"
                    : "Select size"}
                </option>

                {(() => {
                  const product =
                    products.find(
                      (item) =>
                        item._id ===
                        manualOrder.productId
                    );

                  return (
                    product?.variantStock || []
                  )
                    .filter(
                      (variant) =>
                        variant.color ===
                          manualOrder.color &&
                        variant.size &&
                        Number(variant.stock) > 0
                    )
                    .map((variant) => (
                      <option
                        key={`${variant.color}-${variant.size}`}
                        value={variant.size}
                      >
                        {variant.size} —{" "}
                        {variant.stock} available
                      </option>
                    ));
                })()}
              </select>

            </label>


            <label>

              Quantity

              <input
                required
                type="number"
                min="1"
                max={(() => {
                  const product =
                    products.find(
                      (item) =>
                        item._id ===
                        manualOrder.productId
                    );

                  const variant =
                    (
                      product?.variantStock ||
                      []
                    ).find(
                      (item) =>
                        item.color ===
                          manualOrder.color &&
                        item.size ===
                          manualOrder.size
                    );

                  return Number(variant?.stock) > 0
                    ? Number(variant.stock)
                    : undefined;
                })()}
                disabled={
                  !manualOrder.productId ||
                  !manualOrder.color ||
                  !manualOrder.size
                }
                value={manualOrder.quantity}
                onChange={(event) => {
                  const product =
                    products.find(
                      (item) =>
                        item._id ===
                        manualOrder.productId
                    );

                  const variant =
                    (
                      product?.variantStock ||
                      []
                    ).find(
                      (item) =>
                        item.color ===
                          manualOrder.color &&
                        item.size ===
                          manualOrder.size
                    );

                  const maxStock =
                    Number(variant?.stock) || 1;

                  const value = Math.max(
                    1,
                    Math.min(
                      maxStock,
                      Number(
                        event.target.value
                      ) || 1
                    )
                  );

                  setManualOrder({
                    ...manualOrder,
                    quantity: value,
                  });
                }}
              />

            </label>


            <label>

              Order source

              <select
                value={
                  manualOrder.source
                }
                onChange={(event) =>
                  setManualOrder({
                    ...manualOrder,
                    source:
                      event.target
                        .value,
                  })
                }
              >

                <option value="whatsapp">
                  WhatsApp
                </option>

                <option value="instagram">
                  Instagram
                </option>

                <option value="admin">
                  Other / admin
                </option>

              </select>

            </label>


            <label>

              Payment received

              <select
                value={
                  manualOrder.paymentMethod
                }
                onChange={(event) =>
                  setManualOrder({
                    ...manualOrder,
                    paymentMethod:
                      event.target
                        .value,
                  })
                }
              >

                <option value="whatsapp">
                  WhatsApp payment
                </option>

                <option value="instagram">
                  Instagram payment
                </option>

                <option value="phonepe-manual">
                  PhonePe
                </option>

                <option value="razorpay-manual">
                  Razorpay
                </option>

                <option value="cod">
                  Cash on delivery
                </option>

              </select>

            </label>

          </div>


          <button type="submit">
            Save offline order
          </button>

        </form>

      </section>


      {/* ======================================================
          ORDERS
      ======================================================= */}

      <section className="admin-section">

        <h3>
          Orders ({
            orders.length
          })
        </h3>


        <input
          className="admin-search"
          placeholder="Search orders by ID, customer, phone or status"
          value={
            tableSearch.orders
          }
          onChange={(event) =>
            setTableSearchValue(
              "orders",
              event.target.value
            )
          }
        />


        <div className="admin-table-scroll">

          <table className="admin-table">

            <thead>

              <tr>
                <th>
                  Order
                </th>

                <th>
                  Customer
                </th>

                <th>
                  Total
                </th>

                <th>
                  Status
                </th>

                <th>
                  Shipment tracking
                </th>

                <th>
                  Contact
                </th>

                <th>
                  Update
                </th>
              </tr>

            </thead>


            <tbody>

              {paged(
                orders,
                "orders"
              ).rows.map(
                (order) => (

                  <React.Fragment
                    key={
                      order._id
                    }
                  >

                    <tr
                      className="order-click-row"
                      onClick={() =>
                        setExpandedOrder(
                          expandedOrder ===
                            order._id
                            ? null
                            : order._id
                        )
                      }
                    >

                      <td>

                        #
                        {order._id
                          .slice(
                            -8
                          )
                          .toUpperCase()}

                        <small>
                          {new Date(
                            order.createdAt
                          ).toLocaleDateString(
                            "en-IN"
                          )}
                        </small>

                      </td>


                      <td>

                        {
                          order
                            .shippingAddress
                            ?.name ||
                          order
                            .customer
                            ?.name
                        }

                        <small>

                          {
                            order
                              .shippingAddress
                              ?.phone ||
                            order
                              .customer
                              ?.phone
                          }

                          <br />

                          {
                            order
                              .shippingAddress
                              ?.email ||
                            order
                              .customer
                              ?.email
                          }

                        </small>

                      </td>


                      <td>

                        Rs.{" "}
                        {Number(
                          order.total ||
                            0
                        ).toLocaleString(
                          "en-IN"
                        )}

                      </td>


                      <td>

                        <select
                          value={
                            order.status
                          }
                          onClick={(
                            event
                          ) =>
                            event.stopPropagation()
                          }
                          onChange={(
                            event
                          ) =>
                            updateOrder(
                              order,
                              "status",
                              event.target
                                .value
                            )
                          }
                        >

                          {[
                            "pending",
                            "paid",
                            "processing",
                            "shipped",
                            "delivered",
                            "cancelled",
                          ].map(
                            (
                              status
                            ) => (

                              <option
                                key={
                                  status
                                }
                              >
                                {
                                  status
                                }
                              </option>

                            )
                          )}

                        </select>

                      </td>


                      <td>

                        <input
                          className="tracking-input"
                          defaultValue={
                            order.trackingNumber ||
                            ""
                          }
                          placeholder="Tracking number"
                          onClick={(
                            event
                          ) =>
                            event.stopPropagation()
                          }
                          onBlur={(
                            event
                          ) =>
                            updateOrder(
                              order,
                              "trackingNumber",
                              event.target
                                .value
                            )
                          }
                        />


                        <input
                          className="tracking-input"
                          defaultValue={
                            order.carrier ||
                            ""
                          }
                          placeholder="Carrier"
                          onClick={(
                            event
                          ) =>
                            event.stopPropagation()
                          }
                          onBlur={(
                            event
                          ) =>
                            updateOrder(
                              order,
                              "carrier",
                              event.target
                                .value
                            )
                          }
                        />

                      </td>


                      {/* ==================================================
                          CONTACT BUTTONS
                      =================================================== */}

                      <td
                        className="order-contact-actions"
                        onClick={(event) =>
                          event.stopPropagation()
                        }
                      >

                        <button
                          type="button"
                          className="contact-button whatsapp-button"
                          title="Send order details on WhatsApp"
                          aria-label="Send order details on WhatsApp"
                          onClick={() =>
                            openWhatsApp(
                              order
                            )
                          }
                        >
                          <MessageCircle
                            size={16}
                          />

                          WhatsApp
                        </button>


                        <button
                          type="button"
                          className="contact-button email-button"
                          title="Send structured HTML order email"
                          aria-label="Send structured HTML order email"
                          onClick={() =>
                            sendStructuredEmail(
                              order
                            )
                          }
                        >
                          <Mail
                            size={16}
                          />

                          Email
                        </button>

                      </td>


                      <td>
                        {order.paymentMethod}
                      </td>

                    </tr>


                    {/* ==================================================
                        EXPANDED ORDER
                    =================================================== */}

                    {expandedOrder ===
                      order._id && (

                      <tr className="order-detail-row">

                        <td
                          colSpan="7"
                        >

                          <div className="order-detail-panel">

                            <div className="order-detail-items">

                              <h4>
                                Products in this order
                              </h4>


                              {(
                                order.items ||
                                []
                              ).map(
                                (
                                  item,
                                  index
                                ) => (

                                  <div
                                    className="order-item-detail"
                                    key={`${item.productId}-${index}`}
                                  >

                                    {item.image && (
                                      <img
                                        src={
                                          item.image
                                        }
                                        alt=""
                                      />
                                    )}


                                    <div>

                                      <strong>
                                        {
                                          item.title
                                        }
                                      </strong>


                                      <span>
                                        Qty:{" "}
                                        {
                                          item.quantity
                                        }

                                        {
                                          item.size &&
                                          ` | Size: ${item.size}`
                                        }

                                        {
                                          item.color &&
                                          ` | Shade: ${item.color}`
                                        }
                                      </span>


                                      <b>
                                        Rs.{" "}
                                        {(
                                          Number(
                                            item.price ||
                                              0
                                          ) *
                                          Number(
                                            item.quantity ||
                                              0
                                          )
                                        ).toLocaleString(
                                          "en-IN"
                                        )}
                                      </b>

                                    </div>

                                  </div>

                                )
                              )}

                            </div>


                            {/* ==================================================
                                ORDER META
                            =================================================== */}

                            <div className="order-detail-meta">

                              <p>

                                <strong>
                                  Billing /
                                  delivery
                                </strong>

                                <br />

                                {
                                  order
                                    .shippingAddress
                                    ?.name
                                }

                                <br />

                                {
                                  order
                                    .shippingAddress
                                    ?.phone
                                }

                                <br />

                                {
                                  order
                                    .shippingAddress
                                    ?.email
                                }

                                <br />

                                {
                                  order
                                    .shippingAddress
                                    ?.address
                                }

                                ,{" "}

                                {
                                  order
                                    .shippingAddress
                                    ?.city
                                }

                                ,{" "}

                                {
                                  order
                                    .shippingAddress
                                    ?.state
                                }

                                {" - "}

                                {
                                  order
                                    .shippingAddress
                                    ?.pinCode
                                }

                              </p>


                              {/* ==================================================
                                  ORDER ACTIONS
                              =================================================== */}

                              <div className="order-detail-actions">

                                <button
                                  type="button"
                                  onClick={(
                                    event
                                  ) => {
                                    event.stopPropagation();

                                    sendStructuredEmail(
                                      order
                                    );
                                  }}
                                >

                                  <Mail
                                    size={15}
                                  />

                                  Send structured
                                  email

                                </button>


                                <button
                                  type="button"
                                  onClick={(
                                    event
                                  ) => {
                                    event.stopPropagation();

                                    openWhatsApp(
                                      order
                                    );
                                  }}
                                >

                                  <MessageCircle
                                    size={15}
                                  />

                                  WhatsApp

                                </button>


                                <button
                                  type="button"
                                  className="danger-button"
                                  onClick={(
                                    event
                                  ) => {
                                    event.stopPropagation();

                                    deleteOrder(
                                      order
                                    );
                                  }}
                                >
                                  Delete order
                                </button>

                              </div>

                            </div>

                          </div>

                        </td>

                      </tr>

                    )}

                  </React.Fragment>

                )
              )}

            </tbody>

          </table>


          <Pagination
            {...paged(
              orders,
              "orders"
            )}
            onChange={(value) =>
              setPages(
                (current) => ({
                  ...current,
                  orders:
                    value,
                })
              )
            }
          />

        </div>

      </section>


      {/* ======================================================
          CUSTOMERS
      ======================================================= */}

      <section className="admin-section">

        <h3>
          Customers ({
            customers.length
          })
        </h3>


        <input
          className="admin-search"
          placeholder="Search customers by name, email or phone"
          value={
            tableSearch.customers
          }
          onChange={(event) =>
            setTableSearchValue(
              "customers",
              event.target.value
            )
          }
        />


        <div className="admin-table-scroll">

          <table className="admin-table">

            <thead>

              <tr>
                <th>
                  Name
                </th>

                <th>
                  Email
                </th>

                <th>
                  Marketing consent
                </th>

                <th>
                  Joined
                </th>
              </tr>

            </thead>


            <tbody>

              {paged(
                customers,
                "customers"
              ).rows.map(
                (customer) => (

                  <tr
                    key={
                      customer._id
                    }
                  >

                    <td>
                      {
                        customer.name
                      }
                    </td>

                    <td>

                      {
                        customer.phone
                      }

                      <small>
                        {
                          customer.email
                        }
                      </small>

                    </td>

                    <td>
                      {
                        customer.marketingConsent
                          ? "Opted in"
                          : "Not opted in"
                      }
                    </td>

                    <td>
                      {new Date(
                        customer.createdAt
                      ).toLocaleDateString(
                        "en-IN"
                      )}
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>


          <Pagination
            {...paged(
              customers,
              "customers"
            )}
            onChange={(value) =>
              setPages(
                (current) => ({
                  ...current,
                  customers:
                    value,
                })
              )
            }
          />

        </div>

      </section>

    </main>
  );
}


// ============================================================
// PAGINATION
// ============================================================

function Pagination({
  page,
  pageCount,
  onChange,
}) {
  if (pageCount <= 1) {
    return null;
  }

  return (
    <div className="admin-pagination">

      <button
        type="button"
        disabled={page === 1}
        onClick={() =>
          onChange(page - 1)
        }
      >
        Previous
      </button>


      <span>
        Page {page} of{" "}
        {pageCount}
      </span>


      <button
        type="button"
        disabled={
          page === pageCount
        }
        onClick={() =>
          onChange(page + 1)
        }
      >
        Next
      </button>

    </div>
  );
}