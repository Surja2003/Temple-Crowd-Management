"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { useI18n } from "@/lib/i18n-lite";
import { User, Mail, Phone, Save, Bell, Globe } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import LanguageSwitcher from "@/components/language-switcher";
import { Switch } from "@/components/ui/switch";

export default function ProfileManagement() {
  const { auth } = useAuth();
  const { t } = useI18n();
  const [isEditing, setIsEditing] = React.useState(false);
  const [name, setName] = React.useState(auth.user?.name || "");
  const [email, setEmail] = React.useState(auth.user?.email || "");
  const [phone, setPhone] = React.useState(auth.user?.phone || "");
  const [notifications, setNotifications] = React.useState(true);

  React.useEffect(() => {
    if (auth.user) {
      setName(auth.user.name || "");
      setEmail(auth.user.email || "");
      setPhone(auth.user.phone || "");
    }
  }, [auth.user]);

  const handleSave = () => {
    // Save user data (integrate with your API)
    console.log("Saving profile:", { name, email, phone });
    setIsEditing(false);
    // Show success message
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">{t("profile", "title")}</h1>
        <p className="text-muted-foreground">{t("profile", "subtitle")}</p>
      </div>

      <div className="grid gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {t("profile", "personalInfo")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("profile", "name")}</Label>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("profile", "email")}</Label>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isEditing}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t("profile", "phone")}</Label>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!isEditing}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    {t("profile", "saveChanges")}
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} className="w-full">
                  {t("profile", "editProfile")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>{t("profile", "preferences")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label>{t("profile", "language")}</Label>
                  <p className="text-sm text-muted-foreground">Choose your preferred language</p>
                </div>
              </div>
              <LanguageSwitcher />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label>{t("profile", "darkMode")}</Label>
                  <p className="text-sm text-muted-foreground">Toggle dark mode theme</p>
                </div>
              </div>
              <ThemeToggle />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label>{t("profile", "notifications")}</Label>
                  <p className="text-sm text-muted-foreground">Receive booking and alert notifications</p>
                </div>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>{t("profile", "bookingHistory")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => window.location.href = "/profile/bookings"}>
              View All Bookings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Moon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );
}
