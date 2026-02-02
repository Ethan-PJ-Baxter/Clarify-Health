"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Download, KeyRound, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createClient } from "@/lib/supabase/client";
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from "@/lib/validations/settings";
import { DeleteAccountDialog } from "./delete-account-dialog";

interface SettingsPageProps {
  email: string;
  profile: {
    name: string;
    date_of_birth: string;
    gp_surgery: string;
    conditions: string[];
  };
}

export function SettingsPage({ email, profile }: SettingsPageProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: profile.name,
      date_of_birth: profile.date_of_birth || "",
      gp_surgery: profile.gp_surgery || "",
      conditions: profile.conditions,
    },
  });

  async function onProfileSubmit(data: UpdateProfileInput) {
    setSavingProfile(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("user_profiles")
        .update({
          name: data.name || null,
          date_of_birth: data.date_of_birth || null,
          gp_surgery: data.gp_surgery || null,
          conditions: data.conditions?.length ? data.conditions : null,
        })
        .eq("id", user.id);

      if (error) throw error;
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleResetPassword() {
    setResettingPassword(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      toast.success("Password reset email sent");
    } catch {
      toast.error("Failed to send reset email");
    } finally {
      setResettingPassword(false);
    }
  }

  function handleExport(format: "json" | "csv") {
    window.open(`/api/export?format=${format}`, "_blank");
  }

  const [conditionsInput, setConditionsInput] = useState(
    profile.conditions?.join(", ") ?? ""
  );

  function handleConditionsBlur() {
    const parsed = conditionsInput
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    form.setValue("conditions", parsed);
  }

  return (
    <div className="space-y-6">
      {/* Account Section */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Manage your account settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Email</p>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
          <Separator />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={handleResetPassword}
              disabled={resettingPassword}
              className="min-h-[44px]"
            >
              <KeyRound className="mr-2 h-4 w-4" />
              {resettingPassword ? "Sending..." : "Reset Password"}
            </Button>
            <Button
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
              className="min-h-[44px]"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Your personal information for reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onProfileSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date_of_birth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gp_surgery"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GP Surgery</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Springfield Medical Centre"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Conditions</FormLabel>
                <Input
                  placeholder="e.g., Asthma, Diabetes (comma-separated)"
                  value={conditionsInput}
                  onChange={(e) => setConditionsInput(e.target.value)}
                  onBlur={handleConditionsBlur}
                />
                <p className="text-xs text-muted-foreground">
                  Separate multiple conditions with commas
                </p>
              </div>

              <Button
                type="submit"
                disabled={savingProfile}
                className="min-h-[44px]"
              >
                {savingProfile ? "Saving..." : "Save Profile"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Data Export Section */}
      <Card>
        <CardHeader>
          <CardTitle>Data Export</CardTitle>
          <CardDescription>
            Download all your data in your preferred format
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => handleExport("json")}
              className="min-h-[44px]"
            >
              <Download className="mr-2 h-4 w-4" />
              Export JSON
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport("csv")}
              className="min-h-[44px]"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About Section */}
      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Clarify Health v1.0.0</p>
          <p>
            This app is designed to help you track symptoms and generate reports
            for your GP. It is not a medical device and does not provide
            diagnoses.
          </p>
          <a
            href="https://www.nhs.uk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Visit NHS.uk
          </a>
        </CardContent>
      </Card>

      <DeleteAccountDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </div>
  );
}
