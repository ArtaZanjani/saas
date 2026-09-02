"use client";
import { useMemo, useTransition } from "react";
import { motion } from "motion/react";
import { useFormik } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { settingsSchema } from "@/validation/settings.schema";
import { updateUserSettings } from "@/actions/settings";
import { toPersianDigits, toEnglishDigits } from "@/utils/function";
import { removeSpaces, formatCardNumber, formatIban, formatPhone } from "@/utils/format";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const formFields = [
  { label: "نام فروشگاه", name: "shopName", type: "text", placeholder: "مثلاً فروشگاه علی" },
  { label: "شماره موبایل", name: "phoneNumber", type: "tel", placeholder: "", disabled: true, inputMode: "numeric" as const },
  { label: "شماره کارت", name: "cardNumber", type: "text", placeholder: "۱۲۳۴ ۵۶۷۸ ۹۰۱۲ ۳۴۵۶", inputMode: "numeric" as const },
  { label: "نام صاحب کارت", name: "cardOwnerName", type: "text", placeholder: "مثلاً علی رضایی" },
  { label: "شماره شبا", name: "iban", type: "text", placeholder: "۰۰۰۰ ۰۰۰۰ ۰۰۰۰ ۰۰۰۰ ۰۰۰۰ ۰۰۰۰", inputMode: "numeric" as const },
] satisfies Array<{ label: string; name: string; type: string; placeholder: string; disabled?: boolean; inputMode?: "numeric" | "text" | "search" | "none" | "url" | "tel" | "email" | "decimal" }>;

const helpers: Record<string, string> = {
  phoneNumber: "شماره موبایل قابل تغییر نیست",
};

type UserSettings = {
  phoneNumber: string;
  cardNumber: string | null;
  cardOwnerName: string | null;
  iban: string | null;
  shopName: string;
};

const SettingsForm = ({ user }: { user: UserSettings | null }) => {
  const [isLoading, startTransition] = useTransition();

  const formik = useFormik({
    initialValues: {
      shopName: user?.shopName ?? "",
      phoneNumber: user?.phoneNumber ?? "",
      cardNumber: removeSpaces(user?.cardNumber ?? ""),
      cardOwnerName: user?.cardOwnerName ?? "",
      iban: removeSpaces(user?.iban ?? ""),
    },
    validationSchema: useMemo(() => toFormikValidationSchema(settingsSchema), []),
    validateOnMount: false,
    onSubmit: async (values) => {
      startTransition(async () => {
        const cleanCardNumber = removeSpaces(formatCardNumber(toEnglishDigits(values.cardNumber)));
        const cleanIban = removeSpaces(toEnglishDigits(values.iban)).replace(/\D/g, "");

        const res = await updateUserSettings({
          shopName: values.shopName.trim() || undefined,
          cardNumber: cleanCardNumber || undefined,
          cardOwnerName: values.cardOwnerName.trim() || undefined,
          iban: cleanIban || undefined,
        });

        if (res.status === 200) {
          toast.success(res.message);
          formik.resetForm({
            values: {
              shopName: values.shopName.trim(),
              phoneNumber: values.phoneNumber,
              cardNumber: cleanCardNumber,
              cardOwnerName: values.cardOwnerName.trim(),
              iban: cleanIban,
            },
          });
        } else {
          toast.error(res.message);
        }
      });
    },
  });

  const normalizedCard = removeSpaces(toEnglishDigits(formik.values.cardNumber));
  const normalizedInitialCard = removeSpaces(toEnglishDigits(formik.initialValues.cardNumber));

  const normalizedIban = removeSpaces(toEnglishDigits(formik.values.iban)).replace(/\D/g, "");
  const normalizedInitialIban = removeSpaces(toEnglishDigits(formik.initialValues.iban)).replace(/\D/g, "");

  const hasChanges = formik.values.shopName.trim() !== formik.initialValues.shopName.trim() || normalizedCard !== normalizedInitialCard || formik.values.cardOwnerName.trim() !== formik.initialValues.cardOwnerName.trim() || normalizedIban !== normalizedInitialIban;

  return (
    <form onSubmit={formik.handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 w-full gap-6">
      {formFields.map((f) => {
        const raw = formik.values[f.name as keyof typeof formik.values];
        const error = formik.errors[f.name as keyof typeof formik.errors];
        let display = raw;
        if (f.name === "phoneNumber") display = formatPhone(raw);
        else if (f.name === "cardNumber") display = formatCardNumber(toEnglishDigits(raw));
        else if (f.name === "iban") display = formatIban(toEnglishDigits(raw));
        display = toPersianDigits(display);
        const ltr = f.name === "phoneNumber" || f.name === "cardNumber" || f.name === "iban";
        const hasError = raw.length > 0 && !!error?.length;
        return (
          <div key={f.name} className="flex flex-col relative">
            <label className="text-xs font-semibold text-muted-foreground ms-0.5 mt-1.5" htmlFor={f.name}>
              {f.label}
            </label>
            <div className="my-1.5 relative flex items-center">
              {f.name === "iban" && (
                <span className="absolute inset-s-3 text-muted-foreground font-mono text-sm select-none pointer-events-none" dir="ltr">
                  IR
                </span>
              )}
              <Input
                {...f}
                id={f.name}
                dir={ltr ? "ltr" : "rtl"}
                value={display}
                aria-invalid={hasError}
                className={`h-11 ${f.name === "iban" ? "ps-9" : ""} ${f.disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                autoComplete="off"
                onChange={(e) => {
                  let t = e.target.value;
                  if (f.name === "cardNumber") {
                    t = removeSpaces(t);
                    if (!/^\d*$/.test(toEnglishDigits(t))) return;
                    t = t.slice(0, 16);
                  } else if (f.name === "iban") {
                    t = toEnglishDigits(t).replace(/\D/g, "").slice(0, 24);
                  } else if (f.name === "phoneNumber") {
                    return;
                  }
                  formik.setFieldValue(f.name, t);
                }}
                onBlur={formik.handleBlur}
              />
            </div>
            {helpers[f.name] && <p className="text-[11px] text-muted-foreground ms-0.5">{helpers[f.name]}</p>}
            {hasError && <span className="text-[11px] text-destructive ms-0.5">{error}</span>}
          </div>
        );
      })}
      <Button type="submit" className="w-full h-11 mt-2 sm:mt-6.75" size="lg" disabled={!hasChanges || isLoading}>
        {isLoading ? (
          <motion.svg initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.6, ease: "linear" }} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </motion.svg>
        ) : (
          "ذخیره تغییرات"
        )}
      </Button>
    </form>
  );
};

export default SettingsForm;
