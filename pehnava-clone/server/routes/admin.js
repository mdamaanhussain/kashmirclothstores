import express from "express";
import jwt from "jsonwebtoken";
import Customer from "../models/Customer.js";
import Order from "../models/Order.js";
import { requireAdmin } from "../middleware/auth.js";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { notifyOrder } from "../services/notifications.js";
import Product from "../models/Product.js";
import { buildOrderEmailHtml } from "../services/orderEmail.js";

const router = express.Router();


// ============================================================
// ADMIN LOGIN
// ============================================================

router.post("/login", (req, res) => {
  const { password } = req.body;

  if (
    !process.env.ADMIN_PASSWORD ||
    !process.env.JWT_SECRET ||
    !password ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({
      message: "Wrong password",
    });
  }

  const token = jwt.sign(
    {
      role: "admin",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "2h",
    }
  );

  res.json({
    token,
  });
});


// ============================================================
// GET CUSTOMERS
// ============================================================

router.get(
  "/customers",
  requireAdmin,
  async (req, res) => {
    try {
      const customers = await Customer.find()
        .select(
          "name phone email marketingConsent createdAt"
        )
        .sort({
          createdAt: -1,
        })
        .lean();

      res.json(customers);
    } catch (error) {
      console.error(
        "Get customers error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to load customers",
      });
    }
  }
);


// ============================================================
// GET ORDERS
// ============================================================

router.get(
  "/orders",
  requireAdmin,
  async (req, res) => {
    try {
      const orders = await Order.find()
        .populate(
          "customer",
          "name phone email"
        )
        .sort({
          createdAt: -1,
        })
        .lean();

      res.json(orders);
    } catch (error) {
      console.error(
        "Get orders error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to load orders",
      });
    }
  }
);


// ============================================================
// UPDATE ORDER STATUS / TRACKING
// ============================================================

router.patch(
  "/orders/:id",
  requireAdmin,
  async (req, res) => {
    try {
      const allowedStatuses = [
        "pending",
        "paid",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ];

      const update = {};

      if (
        allowedStatuses.includes(
          req.body.status
        )
      ) {
        update.status =
          req.body.status;
      }

      if (
        typeof req.body.trackingNumber ===
        "string"
      ) {
        update.trackingNumber =
          req.body.trackingNumber.trim();
      }

      if (
        typeof req.body.carrier ===
        "string"
      ) {
        update.carrier =
          req.body.carrier.trim();
      }

      const order =
        await Order.findByIdAndUpdate(
          req.params.id,
          update,
          {
            new: true,
          }
        ).populate(
          "customer",
          "name phone email"
        );

      if (!order) {
        return res.status(404).json({
          message:
            "Order not found",
        });
      }

      // Send notification when status
      // or tracking information changes.
      if (
        update.status ||
        update.trackingNumber
      ) {
        await notifyOrder(
          order,
          update.trackingNumber
            ? "tracking"
            : "status"
        );
      }

      res.json(order);
    } catch (error) {
      console.error(
        "Update order error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to update order",
      });
    }
  }
);


// ============================================================
// DELETE ORDER + RESTORE STOCK
// ============================================================

router.delete(
  "/orders/:id",
  requireAdmin,
  async (req, res) => {
    try {
      const order =
        await Order.findById(
          req.params.id
        );

      if (!order) {
        return res.status(404).json({
          message:
            "Order not found",
        });
      }

      for (const item of order.items) {
        // Offline/manual item
        if (
          item.productId === "offline"
        ) {
          continue;
        }

        const product =
          await Product.findById(
            item.productId
          );

        if (!product) {
          continue;
        }

        /*
         * Restore exact color + size
         * variant stock.
         */
        const variant =
          product.variantStock?.find(
            (entry) =>
              String(entry.size || "").trim() ===
                String(item.size || "").trim() &&
              String(entry.color || "").trim() ===
                String(item.color || "").trim()
          );

        if (variant) {
          await Product.updateOne(
            {
              _id: product._id,

              variantStock: {
                $elemMatch: {
                  size: item.size,
                  color: item.color,
                },
              },
            },
            {
              $inc: {
                "variantStock.$.stock":
                  item.quantity,
              },
            }
          );
        } else {
          /*
           * Backward compatibility for
           * products without variants.
           */
          await Product.updateOne(
            {
              _id: product._id,
            },
            {
              $inc: {
                stock: item.quantity,
              },
              $set: {
                soldOut: false,
              },
            }
          );
        }
      }

      await order.deleteOne();

      res.json({
        message:
          "Order deleted and stock restored",
      });
    } catch (error) {
      console.error(
        "Delete order error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to delete order",
      });
    }
  }
);


// ============================================================
// SEND STRUCTURED ORDER EMAIL
// ============================================================

router.post(
  "/orders/:id/email",
  requireAdmin,
  async (req, res) => {
    try {
      const order =
        await Order.findById(
          req.params.id
        ).populate(
          "customer",
          "name phone email"
        );

      if (!order) {
        return res.status(404).json({
          message:
            "Order not found",
        });
      }

      const email =
        order.shippingAddress?.email ||
        order.customer?.email;

      if (!email) {
        return res.status(400).json({
          message:
            "This order has no customer email address",
        });
      }

      if (
        !process.env.RESEND_API_KEY
      ) {
        return res.status(503).json({
          message:
            "Email provider is not configured",
        });
      }

      const orderId =
        order._id
          .toString()
          .slice(-8)
          .toUpperCase();

      /*
       * IMPORTANT:
       * The same shared email builder is
       * used for admin + automatic emails.
       */
      const html =
        buildOrderEmailHtml(order);

      const response =
        await fetch(
          "https://api.resend.com/emails",
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${process.env.RESEND_API_KEY}`,

              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              from:
                process.env.MAIL_FROM ||
                "orders@kashmirclothstores.example",

              to: [email],

              subject:
                `Kashmir Cloth Stores order #${orderId} update`,

              html,
            }),
          }
        );

      if (!response.ok) {
        const providerError =
          await response.text().catch(
            () => ""
          );

        console.error(
          "Resend error:",
          providerError
        );

        return res.status(502).json({
          message:
            "Email provider could not send the message",
        });
      }

      res.json({
        message:
          "Structured order email sent",
      });
    } catch (error) {
      console.error(
        "Send order email error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to send order email",
      });
    }
  }
);


// ============================================================
// CREATE ADMIN / OFFLINE ORDER
// ============================================================

router.post(
  "/orders",
  requireAdmin,
  async (req, res) => {
    try {
      const {
        customer,
        items,
        paymentMethod = "Whatsapp",
        source = "admin",
        status = "paid",
      } = req.body;


      // --------------------------------------------------------
      // BASIC VALIDATION
      // --------------------------------------------------------

      if (
        !customer?.name ||
        !customer?.phone ||
        !customer?.address ||
        !customer?.city ||
        !customer?.state ||
        !customer?.pinCode ||
        !Array.isArray(items) ||
        !items.length
      ) {
        return res.status(400).json({
          message:
            "Customer billing details and at least one item are required",
        });
      }


      // --------------------------------------------------------
      // NORMALIZE CUSTOMER DATA
      // --------------------------------------------------------

      const phone =
        String(customer.phone)
          .trim()
          .replace(/[\s-]/g, "");

      const email =
        customer.email
          ?.trim()
          .toLowerCase() || "";


      // --------------------------------------------------------
      // FIND OR CREATE CUSTOMER
      // --------------------------------------------------------

      let savedCustomer =
        await Customer.findOne({
          $or: [
            {
              phone,
            },

            ...(email
              ? [
                  {
                    email,
                  },
                ]
              : []),
          ],
        });


      if (!savedCustomer) {
        savedCustomer =
          await Customer.create({
            name:
              customer.name.trim(),

            phone,

            email:
              email || undefined,

            passwordHash:
              await bcrypt.hash(
                crypto.randomUUID(),
                12
              ),

            marketingConsent:
              Boolean(
                customer.marketingConsent
              ),
          });
      }


      // --------------------------------------------------------
      // BUILD TRUSTED ORDER ITEMS
      // --------------------------------------------------------

      const trustedItems = [];


      for (const item of items) {
        const quantity =
          Math.max(
            1,
            Number(item.quantity) || 1
          );


        // ======================================================
        // OFFLINE / MANUAL PRODUCT
        // ======================================================

        if (!item.productId) {
          trustedItems.push({
            productId:
              "offline",

            title:
              String(
                item.title ||
                  "Offline order item"
              ),

            image:
              String(
                item.image || ""
              ),

            quantity,

            price:
              Math.max(
                0,
                Number(item.price) || 0
              ),

            size:
              item.size || "",

            color:
              item.color || "",
          });

          continue;
        }


        // ======================================================
        // LOAD PRODUCT
        // ======================================================

        const product =
          await Product.findById(
            item.productId
          ).select(
            "title images price stock soldOut discount variantStock"
          );


        if (!product) {
          return res.status(404).json({
            message:
              "Product not found",
          });
        }


        // ======================================================
        // PRODUCT SOLD OUT
        // ======================================================

        if (product.soldOut) {
          return res.status(409).json({
            message:
              `${product.title} is currently sold out`,
          });
        }


        const selectedSize =
          String(
            item.size || ""
          ).trim();

        const selectedColor =
          String(
            item.color || ""
          ).trim();


        // ======================================================
        // VARIANT PRODUCT
        // ======================================================

        if (
          Array.isArray(
            product.variantStock
          ) &&
          product.variantStock.length > 0
        ) {


          // ----------------------------------------------------
          // SIZE + COLOR ARE REQUIRED
          // ----------------------------------------------------

          if (
            !selectedSize ||
            !selectedColor
          ) {
            return res.status(400).json({
              message:
                `Please select both color and size for ${product.title}`,
            });
          }


          // ----------------------------------------------------
          // FIND EXACT COLOR + SIZE
          // ----------------------------------------------------

          const variantIndex =
            product.variantStock.findIndex(
              (variant) =>
                String(
                  variant.size || ""
                ).trim() ===
                  selectedSize &&
                String(
                  variant.color || ""
                ).trim() ===
                  selectedColor
            );


          if (variantIndex === -1) {
            return res.status(409).json({
              message:
                `${product.title} does not have ${selectedColor} / ${selectedSize} available`,
            });
          }


          const variant =
            product.variantStock[
              variantIndex
            ];


          // ----------------------------------------------------
          // CHECK EXACT VARIANT STOCK
          // ----------------------------------------------------

          if (
            Number(
              variant.stock || 0
            ) < quantity
          ) {
            return res.status(409).json({
              message:
                `Only ${Number(
                  variant.stock || 0
                )} item(s) available for ${selectedColor} / ${selectedSize}`,
            });
          }


          // ----------------------------------------------------
          // ATOMICALLY DECREMENT EXACT VARIANT
          // ----------------------------------------------------

          const updated =
            await Product.updateOne(
              {
                _id: product._id,

                variantStock: {
                  $elemMatch: {
                    size:
                      selectedSize,

                    color:
                      selectedColor,

                    stock: {
                      $gte:
                        quantity,
                    },
                  },
                },
              },

              {
                $inc: {
                  "variantStock.$.stock":
                    -quantity,
                },
              }
            );


          if (
            !updated.modifiedCount
          ) {
            return res.status(409).json({
              message:
                `Selected ${selectedColor} / ${selectedSize} variant just went out of stock`,
            });
          }

        } else {


          // ====================================================
          // OLD PRODUCT-LEVEL STOCK SYSTEM
          // ====================================================

          if (
            Number(
              product.stock || 0
            ) < quantity
          ) {
            return res.status(409).json({
              message:
                `${product.title} does not have enough stock`,
            });
          }


          const updated =
            await Product.updateOne(
              {
                _id:
                  product._id,

                stock: {
                  $gte:
                    quantity,
                },
              },

              {
                $inc: {
                  stock:
                    -quantity,
                },
              }
            );


          if (
            !updated.modifiedCount
          ) {
            return res.status(409).json({
              message:
                `${product.title} just went out of stock`,
            });
          }
        }


        // --------------------------------------------------------
        // CALCULATE DISCOUNTED PRICE
        // --------------------------------------------------------

        const discountedPrice =
          Number(
            product.price || 0
          ) *
          (
            1 -
            Math.min(
              99,
              Number(
                product.discount || 0
              )
            ) / 100
          );


        // --------------------------------------------------------
        // SAVE TRUSTED ITEM
        // --------------------------------------------------------

        trustedItems.push({
          productId:
            product._id.toString(),

          title:
            product.title,

          image:
            product.images?.[0] || "",

          quantity,

          price:
            discountedPrice,

          size:
            selectedSize,

          color:
            selectedColor,
        });
      }


      // ========================================================
      // CALCULATE ORDER TOTAL
      // ========================================================

      const total =
        trustedItems.reduce(
          (sum, item) =>
            sum +
            Number(
              item.price || 0
            ) *
              Number(
                item.quantity || 0
              ),

          0
        );


      // ========================================================
      // CREATE ORDER
      // ========================================================

      const order =
        await Order.create({
          customer:
            savedCustomer._id,

          items:
            trustedItems,

          total,

          paymentMethod,

          source,

          status,

          shippingAddress: {
            name:
              customer.name.trim(),

            phone,

            email:
              email || undefined,

            address:
              customer.address.trim(),

            city:
              customer.city.trim(),

            state:
              customer.state.trim(),

            pinCode:
              String(
                customer.pinCode
              ).trim(),
          },
        });


      // ========================================================
      // SEND ORDER NOTIFICATION
      // ========================================================

      await notifyOrder(
        order,
        "created"
      );


      // ========================================================
      // RESPONSE
      // ========================================================

      res.status(201).json(
        await order.populate(
          "customer",
          "name phone email"
        )
      );

    } catch (error) {
      console.error(
        "Admin order creation error:",
        error
      );

      res.status(400).json({
        message:
          error.message,
      });
    }
  }
);


// ============================================================
// EXPORT
// ============================================================

export default router;