const COMPANY_LOGO_URL =
  "https://res.cloudinary.com/dvnwxbqqh/image/upload/v1788449875/IMG_20260903_210034_ru7fpz.png";

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function formatRs(value) {
  return `Rs. ${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function buildOrderEmailHtml(order) {
  const address = order.shippingAddress || {};
  const customerName =
    address.name ||
    order.customer?.name ||
    "Customer";

  const orderId = String(order._id || "")
    .slice(-8)
    .toUpperCase();

  const items = Array.isArray(order.items)
    ? order.items
    : [];

  // Calculate subtotal from actual order items
  const subtotal = items.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 0;

    return sum + price * quantity;
  }, 0);

  // Use actual values if your Order model has them
  const shipping =
    Number(
      order.shipping ??
      order.shippingCost ??
      0
    ) || 0;

  const taxes =
    Number(
      order.tax ??
      order.taxes ??
      0
    ) || 0;

  // Prefer the actual saved order total
  const savedTotal = Number(order.total);

  const calculatedTotal =
    subtotal + shipping + taxes;

  const finalTotal =
    Number.isFinite(savedTotal)
      ? savedTotal
      : calculatedTotal;

  const rows = items
    .map((item) => {
      const quantity =
        Math.max(
          0,
          Number(item.quantity) || 0
        );

      const price =
        Number(item.price) || 0;

      const lineTotal =
        price * quantity;

      const variant = [
        item.color
          ? escapeHtml(item.color)
          : "",
        item.size
          ? escapeHtml(item.size)
          : "",
      ]
        .filter(Boolean)
        .join(" • ");

      return `
        <tr>
          <td
            style="
              padding:18px 0;
              border-bottom:1px solid #eeeeee;
            "
          >
            <table
              width="100%"
              cellpadding="0"
              cellspacing="0"
              border="0"
            >
              <tr>

                <!-- PRODUCT IMAGE -->
                <td
                  width="72"
                  valign="top"
                >
                  <img
                    src="${escapeHtml(
                      item.image ||
                      "https://placehold.co/96x120?text=Product"
                    )}"
                    width="64"
                    height="80"
                    alt="${escapeHtml(
                      item.title || "Product"
                    )}"
                    style="
                      display:block;
                      width:64px;
                      height:80px;
                      object-fit:cover;
                      border-radius:7px;
                      background:#f7f7f7;
                      border:0;
                    "
                  >
                </td>

                <!-- PRODUCT DETAILS -->
                <td
                  valign="top"
                  style="padding-left:15px;"
                >
                  <p
                    style="
                      margin:0;
                      font-size:14px;
                      line-height:1.45;
                      color:#222222;
                      font-weight:700;
                    "
                  >
                    ${escapeHtml(
                      item.title || "Product"
                    )}
                  </p>

                  ${
                    variant
                      ? `
                        <p
                          style="
                            margin:5px 0 0;
                            font-size:13px;
                            line-height:1.4;
                            color:#777777;
                          "
                        >
                          ${variant}
                        </p>
                      `
                      : ""
                  }

                  <p
                    style="
                      margin:5px 0 0;
                      font-size:13px;
                      line-height:1.4;
                      color:#999999;
                    "
                  >
                    Qty ${quantity}
                  </p>
                </td>

                <!-- PRICE -->
                <td
                  width="95"
                  valign="top"
                  align="right"
                  style="padding-left:10px;"
                >
                  <p
                    style="
                      margin:0;
                      font-size:14px;
                      line-height:1.45;
                      color:#222222;
                      font-weight:600;
                      white-space:nowrap;
                    "
                  >
                    ${formatRs(lineTotal)}
                  </p>
                </td>

              </tr>
            </table>
          </td>
        </tr>
      `;
    })
    .join("");

  const safeAddress = [
    address.address,
    [
      address.city,
      address.state,
    ]
      .filter(Boolean)
      .join(", "),
    address.pinCode,
    "India",
  ]
    .filter(Boolean)
    .map(escapeHtml)
    .join("<br>");

  return `<!DOCTYPE html>
<html>

<head>
  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <title>
    Kashmir Cloth Stores - Order #${escapeHtml(orderId)}
  </title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f4f4f4;
    font-family:Arial,Helvetica,sans-serif;
    color:#222222;
  "
>

  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
      background:#f4f4f4;
      padding:28px 10px;
    "
  >

    <tr>

      <td align="center">

        <table
          width="600"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            max-width:600px;
            width:100%;
            background:#ffffff;
            border-radius:8px;
            overflow:hidden;
          "
        >

          <!-- =========================
               BRAND HEADER
          ========================== -->

          <tr>

            <td
              align="center"
              style="
                padding:34px 30px 20px;
              "
            >

              <img
                src="${COMPANY_LOGO_URL}"
                width="140"
                alt="Kashmir Cloth Stores"
                style="
                  display:block;
                  width:140px;
                  max-width:100%;
                  height:auto;
                  margin:0 auto 13px;
                  border:0;
                "
              >

              <h1
                style="
                  margin:0;
                  font-size:22px;
                  line-height:1.3;
                  font-weight:700;
                  letter-spacing:.2px;
                  color:#111111;
                "
              >
                Kashmir Cloth Stores
              </h1>

              <p
                style="
                  margin:8px 0 0;
                  font-size:12px;
                  line-height:1.4;
                  letter-spacing:1.8px;
                  color:#999999;
                "
              >
                ORDER #${escapeHtml(orderId)}
              </p>

            </td>

          </tr>


          <!-- =========================
               THANK YOU MESSAGE
          ========================== -->

          <tr>

            <td
              style="
                padding:20px 40px 28px;
                text-align:center;
              "
            >

              <h2
                style="
                  margin:0;
                  font-size:25px;
                  line-height:1.35;
                  font-weight:700;
                  color:#222222;
                "
              >
                Thank you,
                ${escapeHtml(customerName)},
                for your purchase!
              </h2>

              <p
                style="
                  margin:12px 0 0;
                  font-size:15px;
                  line-height:1.65;
                  color:#666666;
                "
              >
                We're getting your order ready
                to be shipped. We will notify you
                when it has been sent.
              </p>

            </td>

          </tr>


          <!-- =========================
               ORDER SUMMARY
          ========================== -->

          <tr>

            <td
              style="
                padding:26px 40px 10px;
                border-top:1px solid #eeeeee;
              "
            >

              <h3
                style="
                  margin:0;
                  font-size:16px;
                  line-height:1.4;
                  color:#222222;
                "
              >
                Order summary
              </h3>

            </td>

          </tr>


          <tr>

            <td
              style="
                padding:0 40px;
              "
            >

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
              >

                ${
                  rows ||
                  `
                    <tr>
                      <td
                        style="
                          padding:18px 0;
                          color:#777777;
                          font-size:14px;
                        "
                      >
                        No items found in this order.
                      </td>
                    </tr>
                  `
                }

              </table>

            </td>

          </tr>


          <!-- =========================
               PRICE BREAKDOWN
          ========================== -->

          <tr>

            <td
              style="
                padding:18px 40px 24px;
                border-top:1px solid #eeeeee;
              "
            >

              <table
                width="100%"
                cellpadding="4"
                cellspacing="0"
                border="0"
                style="
                  font-size:14px;
                  line-height:1.5;
                  color:#555555;
                "
              >

                <tr>

                  <td>
                    Subtotal
                  </td>

                  <td align="right">
                    ${formatRs(subtotal)}
                  </td>

                </tr>

                <tr>

                  <td>
                    Shipping
                  </td>

                  <td align="right">
                    ${formatRs(shipping)}
                  </td>

                </tr>

                <tr>

                  <td>
                    Taxes
                  </td>

                  <td align="right">
                    ${formatRs(taxes)}
                  </td>

                </tr>

                <tr>

                  <td
                    style="
                      border-top:1px solid #eeeeee;
                      padding-top:12px;
                      font-weight:700;
                      font-size:16px;
                      color:#222222;
                    "
                  >
                    Total
                  </td>

                  <td
                    align="right"
                    style="
                      border-top:1px solid #eeeeee;
                      padding-top:12px;
                      font-weight:700;
                      font-size:16px;
                      color:#222222;
                    "
                  >
                    ${formatRs(finalTotal)}
                  </td>

                </tr>

              </table>

            </td>

          </tr>


          <!-- =========================
               CUSTOMER INFORMATION
          ========================== -->

          <tr>

            <td
              style="
                padding:24px 40px;
                border-top:1px solid #eeeeee;
              "
            >

              <h3
                style="
                  margin:0 0 18px;
                  font-size:16px;
                  line-height:1.4;
                  color:#222222;
                "
              >
                Customer information
              </h3>


              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
              >

                <tr>

                  <!-- SHIPPING ADDRESS -->

                  <td
                    width="50%"
                    valign="top"
                    style="
                      padding-right:15px;
                    "
                  >

                    <p
                      style="
                        margin:0 0 7px;
                        font-size:14px;
                        font-weight:700;
                        color:#222222;
                      "
                    >
                      Shipping address
                    </p>

                    <p
                      style="
                        margin:0;
                        font-size:13px;
                        line-height:1.65;
                        color:#555555;
                      "
                    >

                      ${escapeHtml(
                        address.name ||
                        customerName
                      )}

                      ${
                        address.phone
                          ? `<br>${escapeHtml(
                              address.phone
                            )}`
                          : ""
                      }

                      ${
                        address.email
                          ? `<br>${escapeHtml(
                              address.email
                            )}`
                          : ""
                      }

                      ${
                        safeAddress
                          ? `<br>${safeAddress}`
                          : ""
                      }

                    </p>

                  </td>


                  <!-- PAYMENT -->

                  <td
                    width="50%"
                    valign="top"
                    style="
                      padding-left:15px;
                    "
                  >

                    <p
                      style="
                        margin:0 0 7px;
                        font-size:14px;
                        font-weight:700;
                        color:#222222;
                      "
                    >
                      Payment method
                    </p>

                    <p
                      style="
                        margin:0;
                        font-size:13px;
                        line-height:1.65;
                        color:#555555;
                      "
                    >

                      ${escapeHtml(
                        order.paymentMethod ||
                        "Not specified"
                      )}

                      ${
                        order.status
                          ? `
                            <br>
                            <br>
                            <strong>
                              Status:
                            </strong>
                            ${escapeHtml(
                              order.status
                            )}
                          `
                          : ""
                      }

                    </p>

                  </td>

                </tr>

              </table>

            </td>

          </tr>


          <!-- =========================
               FOOTER
          ========================== -->

          <tr>

            <td
              align="center"
              style="
                padding:26px 30px 30px;
                border-top:1px solid #eeeeee;
                background:#fafafa;
              "
            >

              <p
                style="
                  margin:0;
                  font-size:15px;
                  font-weight:700;
                  color:#222222;
                "
              >
                Kashmir Cloth Stores
              </p>

              <p
                style="
                  margin:7px 0 0;
                  font-size:12px;
                  line-height:1.5;
                  color:#888888;
                "
              >
                Main Road, Phusro • Jharkhand
              </p>

              <p
                style="
                  margin:10px 0 0;
                  font-size:12px;
                  line-height:1.5;
                  color:#888888;
                "
              >
                Questions? Reply to this email
                or contact us at

                <a
                  href="mailto:amaanhussain786pr@gmail.com"
                  style="
                    color:#222222;
                    text-decoration:none;
                    font-weight:600;
                  "
                >
                  amaanhussain786pr@gmail.com
                </a>

              </p>

            </td>

          </tr>

        </table>

      </td>

    </tr>

  </table>

</body>
</html>`;
}