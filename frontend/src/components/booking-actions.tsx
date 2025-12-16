"use client";

import { Download, Share2, Mail, MessageCircle, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { downloadBookingPDF, shareViaWhatsApp, shareViaEmail, copyBookingDetails } from "@/lib/booking-utils";
import { useState } from "react";
import { useI18n } from "@/lib/i18n-lite";

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

interface BookingActionsProps {
  booking: BookingDetails;
  temple: TempleInfo;
  variant?: "default" | "compact";
}

export function BookingActions({ booking, temple, variant = "default" }: BookingActionsProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const handleDownloadPDF = async () => {
    await downloadBookingPDF(booking, temple);
  };

  const handleWhatsAppShare = () => {
    shareViaWhatsApp(booking, temple);
  };

  const handleEmailShare = () => {
    shareViaEmail(booking, temple);
  };

  const handleCopy = async () => {
    const success = await copyBookingDetails(booking, temple);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (variant === "compact") {
    return (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadPDF}
          className="flex-1"
        >
          <Download className="w-4 h-4 mr-2" />
          PDF
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              {t("profile", "share")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={handleWhatsAppShare}>
              <MessageCircle className="w-4 h-4 mr-2 text-green-600" />
              {t("profile", "shareViaWhatsApp")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEmailShare}>
              <Mail className="w-4 h-4 mr-2 text-blue-600" />
              {t("profile", "shareViaEmail")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleCopy}>
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Details
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Button
        onClick={handleDownloadPDF}
        className="w-full justify-start"
        variant="outline"
      >
        <Download className="w-4 h-4 mr-2" />
        {t("profile", "downloadReceipt")}
      </Button>

      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={handleWhatsAppShare}
          variant="outline"
          className="justify-start"
        >
          <MessageCircle className="w-4 h-4 mr-2 text-green-600" />
          WhatsApp
        </Button>
        <Button
          onClick={handleEmailShare}
          variant="outline"
          className="justify-start"
        >
          <Mail className="w-4 h-4 mr-2 text-blue-600" />
          Email
        </Button>
      </div>

      <Button
        onClick={handleCopy}
        variant="outline"
        className="w-full justify-start"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 mr-2 text-green-600" />
            Copied to Clipboard!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 mr-2" />
            Copy Details
          </>
        )}
      </Button>
    </div>
  );
}
