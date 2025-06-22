const PDFDocument = require("pdfkit");
const orderSchema = require("../models/orderSchema");

const generateInvoice = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId  = req.params.userId
    const order = await orderSchema.findById(orderId);

    if(order.userId.toString() !== userId){
       return res
        .status(403)
        .json({
          message:
            "This order does not exist or you don’t have permission to view it.",
        });

    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Create a PDF document
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice_${order.orderNumber}.pdf`
    );

    // Pipe the PDF to the response
    doc.pipe(res);

    // Add invoice header
    doc.fontSize(20).text("INVOICE", { align: "center" });
    doc.moveDown();

    // Company information
    doc
      .fontSize(10)
      .text("Wotix Watches", { align: "right" })
      .text("123 Watch Street", { align: "right" })
      .text("City, State 10001", { align: "right" })
      .text("Phone: +91 8888430047", { align: "right" })
      .text("Email: wotix@gmail.com", { align: "right" })
      .moveDown();

    // Invoice details
    doc
      .fontSize(14)
      .text(`Invoice Number: ${order.orderNumber}`, { continued: true })
      .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, {
        align: "right",
      })
      .moveDown();

    // Customer information
    doc
      .fontSize(12)
      .text("Bill To:", { underline: true })
      .text(order.shippingAddress.fullName)
      .text(order.shippingAddress.streetAddress)
      .text(
        `${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}`
      )
      .text(`Phone: ${order.shippingAddress.phone}`)
      .moveDown();

    // Items table header
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Description", 50, doc.y)
      .text("Qty", 250, doc.y)
      .text("Price", 300, doc.y, { width: 100, align: "right" })
      .text("Amount", 400, doc.y, { width: 100, align: "right" })
      .moveDown();

    // Items table rows
    let total = 0;
    doc.font("Helvetica");
    order.products.forEach((item) => {
      const itemTotal = item.discountedPrice * item.quantity;
      total += itemTotal;

      doc
        .text(item.name, 50, doc.y)
        .text(item.quantity.toString(), 250, doc.y)
        .text(`₹${item.price.toLocaleString()}`, 300, doc.y, {
          width: 100,
          align: "right",
        })
        .text(`₹${itemTotal.toLocaleString()}`, 400, doc.y, {
          width: 100,
          align: "right",
        })
        .moveDown();
    });

    // Total
    doc
      .moveDown()
      .font("Helvetica-Bold")
      .text(`Subtotal: ₹${total.toLocaleString()}`, { align: "right" })
      .text(`Shipping: ₹50`, { align: "right" })
      .text(`Total: ₹${order.finalAmount.toLocaleString()}`, { align: "right" })
      .moveDown();

    // Payment method
    doc
      .font("Helvetica")
      .text(`Payment Method: ${order.paymentMethod.toUpperCase()}`, {
        align: "right",
      })
      .text(`Status: ${order.paymentStatus ? "Paid" : "Pending"}`, {
        align: "right",
      })
      .moveDown();

    // Thank you message
    doc.fontSize(10).text("Thank you for your purchase!", { align: "center" });

    // Finalize the PDF
    doc.end();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error generating invoice",
    });
  }
};

module.exports = { generateInvoice };
