"use client";

import { Button } from "@/src/elements/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/elements/ui/dialog";
import CurrencyValue from "@/src/shared/CurrencyValue";
import { SubscriptionModalProps } from "@/src/types/subscription";
import { CheckCircle2, MessageCircle, ShieldCheck } from "lucide-react";
import React from "react";

const WHATSAPP_NUMBER = "97460007544";

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  selectedPlan,
  mode = "none",
}) => {
  if (!selectedPlan) return null;

  const rawCurrencyCode =
    selectedPlan.currency?.code || selectedPlan.currency || "USD";
  const currencyCode =
    typeof rawCurrencyCode === "string" && /^[a-z]{3}$/i.test(rawCurrencyCode)
      ? rawCurrencyCode.toUpperCase()
      : "USD";
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    currencyDisplay: "code",
  }).format(selectedPlan.price || 0);
  const requestType =
    mode === "upgrade"
      ? "upgrade my subscription"
      : mode === "downgrade"
        ? "change my subscription"
        : "subscribe";
  const billingCycle = selectedPlan.billing_cycle.replace(/^./, (letter) =>
    letter.toUpperCase(),
  );
  const whatsappMessage = [
    "Hello Wazely team,",
    "",
    `I would like to ${requestType} to the ${selectedPlan.name}.`,
    `Plan: ${selectedPlan.name}`,
    `Price: ${formattedPrice}`,
    `Billing: ${billingCycle}`,
    "",
    "Please send me the payment instructions. I will share the payment receipt here for verification and plan activation.",
  ].join("\n");
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

  const handleWhatsAppRedirect = () => {
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl! max-w-[calc(100%-2rem)]! gap-0! border-none shadow-2xl overflow-hidden p-0! bg-white dark:bg-(--card-color) rounded-lg">
        <div className="bg-emerald-50/60 dark:bg-(--card-color) px-5 py-6 border-b border-emerald-100 dark:border-(--card-border-color)">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl text-left font-black text-slate-900 dark:text-white tracking-tight">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-primary dark:bg-emerald-500/10">
                <MessageCircle className="h-6 w-6" />
              </span>
              Request this plan on WhatsApp
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-5 sm:p-6">
          <div className="relative overflow-hidden rounded-lg border border-emerald-100 bg-emerald-50/40 p-5 dark:border-(--card-border-color) dark:bg-(--page-body-bg)">
            <ShieldCheck className="absolute -right-3 -top-3 h-24 w-24 text-emerald-500/10" />
            <p className="text-sm font-bold text-primary">Selected plan</p>
            <h4 className="mt-1 text-xl font-black capitalize text-slate-900 dark:text-white">
              {selectedPlan.name}
            </h4>
            <div className="mt-4 flex items-baseline gap-2">
              <CurrencyValue
                amount={selectedPlan.price || 0}
                fromCode={selectedPlan.currency?.code}
                fallbackSymbol={selectedPlan.currency?.symbol}
                className="text-3xl font-black text-slate-900 dark:text-white"
              />
              <span className="text-sm font-semibold capitalize text-slate-400">
                / {selectedPlan.billing_cycle}
              </span>
            </div>
          </div>

          <div className="my-5 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p>WhatsApp will open with your selected plan details.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p>Send your payment receipt in the WhatsApp conversation.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p>The super admin will verify the payment and activate your plan.</p>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <Button
              variant="ghost"
              className="h-12 flex-1 rounded-lg bg-slate-100 font-semibold text-slate-600 hover:bg-slate-200/70 dark:bg-(--page-body-bg) dark:text-slate-300"
              onClick={onClose}
            >
              Go back
            </Button>
            <Button
              className="h-12 flex-1 gap-2 rounded-lg bg-[#25D366] font-bold text-white hover:bg-[#20bd5a]"
              onClick={handleWhatsAppRedirect}
            >
              <MessageCircle className="h-5 w-5" />
              Contact on WhatsApp
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionModal;
