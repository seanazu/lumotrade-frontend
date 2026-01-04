"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Key,
  Shield,
  AlertCircle,
  Link2,
  Check,
  Info,
  ChevronDown,
  BookOpen,
  ExternalLink,
} from "lucide-react";

import { Button } from "@/components/design-system/atoms/Button";
import { Input } from "@/components/design-system/atoms/Input";
import { Label } from "@/components/design-system/atoms/Label";
import { Card } from "@/components/design-system/atoms/Card";
import { useAlpaca } from "@/hooks/useAlpaca";
import { useUser } from "@/contexts/UserContext";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  apiKey: z.string().min(1, "API Key is required"),
  secretKey: z.string().min(1, "Secret Key is required"),
  isPaper: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface ModeButtonProps {
  isActive: boolean;
  isPaper: boolean;
  onClick: () => void;
}

/**
 * ModeButton Component
 * Button for selecting Paper or Live trading mode
 */
function ModeButton({ isActive, isPaper, onClick }: ModeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 py-2.5 px-4 text-sm font-medium transition-all rounded-lg",
        isActive
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {isPaper ? "Paper" : "Live"}
    </button>
  );
}

ModeButton.displayName = "ModeButton";

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

/**
 * FormSection Component
 * Wrapper for form sections with consistent spacing
 */
function FormSection({ title, children }: FormSectionProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{title}</Label>
      {children}
    </div>
  );
}

FormSection.displayName = "FormSection";

interface InputWithIconProps {
  icon: React.ElementType;
  error?: string;
  children: React.ReactNode;
}

/**
 * InputWithIcon Component
 * Input field with left-aligned icon
 */
function InputWithIcon({ icon: Icon, error, children }: InputWithIconProps) {
  return (
    <div className="space-y-1.5">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        {children}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-destructive flex items-center gap-1.5"
        >
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          {error}
        </motion.p>
      )}
    </div>
  );
}

InputWithIcon.displayName = "InputWithIcon";

interface HelpStepProps {
  number: number;
  children: React.ReactNode;
}

/**
 * HelpStep Component
 * Numbered step in help section
 */
function HelpStep({ number, children }: HelpStepProps) {
  return (
    <div className="flex gap-3">
      <span className="flex-shrink-0 flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary font-semibold text-[10px]">
        {number}
      </span>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {children}
      </p>
    </div>
  );
}

HelpStep.displayName = "HelpStep";

/**
 * AlpacaConnectionForm Component
 * Form to connect Alpaca broker with API credentials
 */
export function AlpacaConnectionForm() {
  const { user } = useUser();
  const { connect, isConnecting } = useAlpaca(user?.id || "");
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isPaper: true,
    },
  });

  const isPaper = watch("isPaper");

  const onSubmit = async (data: FormData) => {
    if (!user?.id) return;
    setError(null);

    try {
      await connect({
        userId: user.id,
        apiKey: data.apiKey,
        secretKey: data.secretKey,
        isPaper: data.isPaper,
      });
    } catch (err: any) {
      setError(err.message || "Failed to connect to Alpaca");
    }
  };

  return (
    <Card className="overflow-hidden max-w-lg mx-auto">
      <div className="p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center mb-8"
        >
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl" />
            <div className="relative h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
              <Link2 className="h-7 w-7 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">
            Connect Alpaca Broker
          </h2>
          <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
            Link your trading account for automated execution and real-time
            portfolio monitoring
          </p>
        </motion.div>

        {/* Mode Selector */}
        <div className="mb-6">
          <Label className="text-sm font-medium mb-3 block">Trading Mode</Label>
          <div className="inline-flex p-1 bg-muted rounded-lg gap-1 w-full max-w-xs">
            <ModeButton
              isActive={isPaper}
              isPaper={true}
              onClick={() => setValue("isPaper", true)}
            />
            <ModeButton
              isActive={!isPaper}
              isPaper={false}
              onClick={() => setValue("isPaper", false)}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {isPaper
              ? "Test strategies with simulated funds"
              : "⚠️ Real money will be at risk with live trading"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormSection title={`${isPaper ? "Paper" : "Live"} API Key`}>
            <InputWithIcon icon={Key} error={errors.apiKey?.message}>
              <Input
                placeholder={isPaper ? "PK..." : "AK..."}
                className="pl-10 font-mono text-sm"
                {...register("apiKey")}
              />
            </InputWithIcon>
          </FormSection>

          <FormSection title={`${isPaper ? "Paper" : "Live"} Secret Key`}>
            <InputWithIcon icon={Shield} error={errors.secretKey?.message}>
              <Input
                type="password"
                placeholder="••••••••••••••••••••"
                className="pl-10 font-mono text-sm"
                {...register("secretKey")}
              />
            </InputWithIcon>
          </FormSection>

          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
              >
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full shadow-lg shadow-primary/20"
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Connect Account
              </>
            )}
          </Button>

          {/* Security Notice */}
          <p className="text-[10px] text-center text-muted-foreground pt-2">
            🔒 Credentials are encrypted and stored securely
          </p>
        </form>

        {/* Help Section */}
        <div className="mt-6 pt-6 border-t border-border">
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="flex items-center justify-between w-full text-sm font-medium hover:text-foreground transition-colors group"
          >
            <span className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground">
              <BookOpen className="h-4 w-4" />
              How to get API keys
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                showHelp && "rotate-180"
              )}
            />
          </button>

          <AnimatePresence>
            {showHelp && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-3">
                  <HelpStep number={1}>
                    Log in to your{" "}
                    <a
                      href="https://app.alpaca.markets/login"
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                    >
                      Alpaca Dashboard
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </HelpStep>
                  <HelpStep number={2}>
                    Select <strong>{isPaper ? "Paper" : "Live"} Trading</strong>{" "}
                    from the sidebar
                  </HelpStep>
                  <HelpStep number={3}>
                    Navigate to the <strong>API Keys</strong> section in
                    Overview
                  </HelpStep>
                  <HelpStep number={4}>
                    Click <strong>Generate New Keys</strong> or{" "}
                    <strong>View</strong> existing keys
                  </HelpStep>
                  <div className="flex items-start gap-2 p-3 mt-2 bg-primary/5 rounded-lg border border-primary/10">
                    <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-primary/90 leading-relaxed">
                      Save your Secret Key immediately - it won&apos;t be shown
                      again!
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Card>
  );
}

AlpacaConnectionForm.displayName = "AlpacaConnectionForm";
