// Booking utility functions for PDF download and sharing

interface BookingDetails {
  bookingId: string;
  devoteeName: string;
  phoneNumber: string;
  numberOfDevotees: number;
  darshanType: string;
  timeSlot: string;
  date: string;
  queueNumber?: number;
  status: string;
}

interface TempleInfo {
  name: string;
  address: string;
  phone?: string;
}

/**
 * Generate PDF receipt for booking
 */
export async function downloadBookingPDF(booking: BookingDetails, temple: TempleInfo): Promise<void> {
  try {
    // Dynamic import to reduce bundle size
    const { jsPDF } = await import('jspdf');
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("🕉️ Darshan Booking Receipt", pageWidth / 2, 20, { align: "center" });
    
    // Temple Info
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(temple.name, pageWidth / 2, 30, { align: "center" });
    doc.setFontSize(10);
    doc.text(temple.address, pageWidth / 2, 37, { align: "center" });
    
    // Line separator
    doc.setLineWidth(0.5);
    doc.line(15, 45, pageWidth - 15, 45);
    
    // Booking Details
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Booking Details", 15, 55);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    let yPos = 65;
    
    const details = [
      { label: "Booking ID:", value: booking.bookingId },
      { label: "Devotee Name:", value: booking.devoteeName },
      { label: "Phone Number:", value: booking.phoneNumber },
      { label: "Number of Devotees:", value: booking.numberOfDevotees.toString() },
      { label: "Darshan Type:", value: booking.darshanType },
      { label: "Date:", value: booking.date },
      { label: "Time Slot:", value: booking.timeSlot },
      { label: "Queue Number:", value: booking.queueNumber?.toString() || "N/A" },
      { label: "Status:", value: booking.status },
    ];
    
    details.forEach(({ label, value }) => {
      doc.setFont("helvetica", "bold");
      doc.text(label, 15, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(value, 70, yPos);
      yPos += 8;
    });
    
    // QR Code placeholder
    yPos += 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("QR Code:", 15, yPos);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("(Scan this QR code at temple entrance)", 15, yPos + 7);
    
    // Draw QR code placeholder box
    doc.rect(15, yPos + 10, 50, 50);
    doc.setFontSize(8);
    doc.text("QR Code", 30, yPos + 38);
    
    // Important Instructions
    yPos += 70;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Important Instructions:", 15, yPos);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const instructions = [
      "• Please arrive 15 minutes before your scheduled time",
      "• Carry a valid ID proof for verification",
      "• Show this receipt or QR code at the entrance",
      "• Follow temple guidelines and dress code",
      "• For any queries, contact temple office",
    ];
    
    yPos += 7;
    instructions.forEach(instruction => {
      doc.text(instruction, 15, yPos);
      yPos += 6;
    });
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(
      `Generated on ${new Date().toLocaleString()}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 15,
      { align: "center" }
    );
    
    doc.text(
      "🙏 Thank you for choosing digital darshan booking",
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
    
    // Save PDF
    doc.save(`booking-${booking.bookingId}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Failed to generate PDF. Please try again.");
  }
}

/**
 * Share booking via WhatsApp
 */
export function shareViaWhatsApp(booking: BookingDetails, temple: TempleInfo): void {
  const message = `
🕉️ *Darshan Booking Confirmation*

📍 *Temple:* ${temple.name}
${temple.address}

📋 *Booking Details:*
• Booking ID: ${booking.bookingId}
• Name: ${booking.devoteeName}
• Devotees: ${booking.numberOfDevotees}
• Darshan Type: ${booking.darshanType}
• Date: ${booking.date}
• Time: ${booking.timeSlot}
• Queue #: ${booking.queueNumber || "N/A"}
• Status: ${booking.status}

⚠️ *Important:*
Please arrive 15 minutes before your scheduled time.
Carry a valid ID proof for verification.

🙏 Thank you for choosing digital darshan booking!
  `.trim();
  
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
  window.open(whatsappUrl, "_blank");
}

/**
 * Share booking via Email
 */
export function shareViaEmail(booking: BookingDetails, temple: TempleInfo): void {
  const subject = `Darshan Booking Confirmation - ${booking.bookingId}`;
  const body = `
Darshan Booking Confirmation

Temple: ${temple.name}
Address: ${temple.address}

Booking Details:
------------------
Booking ID: ${booking.bookingId}
Devotee Name: ${booking.devoteeName}
Phone Number: ${booking.phoneNumber}
Number of Devotees: ${booking.numberOfDevotees}
Darshan Type: ${booking.darshanType}
Date: ${booking.date}
Time Slot: ${booking.timeSlot}
Queue Number: ${booking.queueNumber || "N/A"}
Status: ${booking.status}

Important Instructions:
-----------------------
• Please arrive 15 minutes before your scheduled time
• Carry a valid ID proof for verification
• Show this confirmation at the entrance
• Follow temple guidelines and dress code

For any queries, please contact the temple office.

Thank you for choosing digital darshan booking!
  `.trim();
  
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoUrl;
}

/**
 * Copy booking details to clipboard
 */
export async function copyBookingDetails(booking: BookingDetails, temple: TempleInfo): Promise<boolean> {
  const text = `
🕉️ Darshan Booking - ${temple.name}

Booking ID: ${booking.bookingId}
Name: ${booking.devoteeName}
Devotees: ${booking.numberOfDevotees}
Darshan: ${booking.darshanType}
Date: ${booking.date}
Time: ${booking.timeSlot}
Queue: ${booking.queueNumber || "N/A"}
Status: ${booking.status}

Temple: ${temple.name}
Address: ${temple.address}
  `.trim();
  
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
}
