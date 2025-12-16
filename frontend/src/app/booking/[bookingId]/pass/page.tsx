'use client';

import { useQuery } from "@tanstack/react-query";
import { createTempleApiService } from "@/lib/api-enhanced";
import { useTempleConfig } from "@/config/hooks";
import { useParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookingActions } from "@/components/booking-actions";
import React from "react";
import { trackTempleEvent } from "@/lib/ga";
import { Printer } from "lucide-react";

export default function BookingPassPage() {
  const params = useParams();
  const { bookingId } = params;
  const { config: templeConfig } = useTempleConfig();
  const apiService = templeConfig
    ? createTempleApiService(templeConfig.basic.slug)
    : null;

  const trackedRef = React.useRef(false);

  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => apiService?.getBooking(bookingId as string),
    enabled: !!apiService && !!bookingId,
  });

  React.useEffect(() => {
    if (trackedRef.current) return;
    if (!templeConfig) return;
    if (!booking) return;
    trackedRef.current = true;

    trackTempleEvent("booking_pass_view", {
      temple_id: templeConfig.basic.id,
      temple_name: templeConfig.basic.name,
      temple_location: `${templeConfig.basic.address.city}, ${templeConfig.basic.address.state}`,
      source_page: "booking_pass",
      booking_id: booking.bookingId,
      time_slot: booking.timeSlot,
    });
  }, [booking, templeConfig]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!booking) {
    return <div>Booking not found.</div>;
  }

  const handlePrint = () => {
    if (templeConfig) {
      trackTempleEvent("booking_pass_print_click", {
        temple_id: templeConfig.basic.id,
        temple_name: templeConfig.basic.name,
        source_page: "booking_pass",
        booking_id: booking.bookingId,
      });
    }
    window.print();
  };

  const templeInfo = templeConfig ? {
    name: templeConfig.basic.name,
    address: `${templeConfig.basic.address.city}, ${templeConfig.basic.address.state}`,
    phone: templeConfig.basic.contact?.phone?.[0],
  } : {
    name: "Temple",
    address: "Address",
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <Card className="printable-pass">
        <CardHeader className="text-center">
          <CardTitle>🕉️ Darshan Pass</CardTitle>
          <p className="text-sm text-muted-foreground">{templeInfo.name}</p>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <QRCodeSVG value={booking.bookingId} size={128} className="mx-auto" />
            <p className="text-xs text-muted-foreground mt-2">Scan at temple entrance</p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-semibold">Booking ID:</span>
              <span>{booking.bookingId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Name:</span>
              <span>{booking.devoteeName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Date:</span>
              <span>{booking.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Time Slot:</span>
              <span>{booking.timeSlot}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Devotees:</span>
              <span>{booking.numberOfDevotees}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Darshan Type:</span>
              <span>{booking.darshanType}</span>
            </div>
            {booking.queueNumber && (
              <div className="flex justify-between">
                <span className="font-semibold">Queue #:</span>
                <span>{booking.queueNumber}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={handlePrint} variant="outline" className="w-full">
            <Printer className="w-4 h-4 mr-2" />
            Print Pass
          </Button>
          
          <BookingActions
            booking={{
              bookingId: booking.bookingId,
              devoteeName: booking.devoteeName,
              phoneNumber: booking.phone || "",
              numberOfDevotees: booking.numberOfDevotees,
              darshanType: booking.darshanType,
              timeSlot: booking.timeSlot,
              date: booking.date,
              queueNumber: booking.queueNumber,
              status: booking.status || "Confirmed",
            }}
            temple={templeInfo}
            variant="compact"
          />
        </CardContent>
      </Card>

      {/* Important Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Important Instructions</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>✓ Arrive 15 minutes before your scheduled time</p>
          <p>✓ Carry a valid ID proof for verification</p>
          <p>✓ Show this pass or QR code at the entrance</p>
          <p>✓ Follow temple guidelines and dress code</p>
        </CardContent>
      </Card>
    </div>
  );
}
