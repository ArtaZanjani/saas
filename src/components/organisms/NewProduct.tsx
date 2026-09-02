"use client";
import { useState, useMemo, useCallback, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useFormik } from "formik";
import { toPersianDigits, toEnglishDigits } from "@/utils/function";
import { addCommas, removeCommas, trimObject } from "@/utils/format";
import { toFormikValidationSchema } from "zod-formik-adapter";
import newProductSchema from "@/validation/newProduct.schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AnimatedPopup from "@/components/organisms/AnimatedPopup";
import { createProduct } from "@/actions/product";

const spring = { type: "spring" as const, stiffness: 500, damping: 32, mass: 0.45 };
const fieldVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 420, damping: 36, mass: 0.55, delay: i * 0.03 } }),
};

const formFields = [
  { label: "نام محصول", name: "productName", type: "text", placeholder: "مثلا کفش اسپرت...", autoComplete: "off" },
  { label: "قیمت (تومان)", name: "price", type: "text", placeholder: "۲۵۰,۰۰۰", inputMode: "numeric" },
] as const;

const NewProduct = ({ id, productName, price }: { id?: string; productName?: string; price?: string }) => {
  const [isLtr, setIsLtr] = useState<Record<string, boolean>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, startTransition] = useTransition();
  const isEditMode = id?.length && productName?.length && price?.length;

  const formik = useFormik({
    initialValues: { productName: productName || "", price: price || "" },
    validationSchema: useMemo(() => toFormikValidationSchema(newProductSchema), []),
    validateOnMount: true,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setServerError(null);
      startTransition(async () => {
        const res = await createProduct({
          ...(isEditMode ? { id } : {}),
          ...trimObject(values),
        });

        if ("message" in res) {
          setServerError(res.message);
        }
      });
    },
  });
  const handleBlur = useCallback((field: string, value: string) => {
    const raw = field === "price" ? removeCommas(value) : value;
    const isEng = /^[A-Za-z]+$/.test(raw.replace(/[\d\s۰-۹]/g, ""));
    setIsLtr((p) => (p[field] === isEng ? p : { ...p, [field]: isEng }));
  }, []);
  const handleDirCheck = useCallback((field: string, text: string) => {
    if (!text) {
      setIsLtr((p) => (p[field] === false ? p : { ...p, [field]: false }));
      return;
    }
    const isEng = /^[A-Za-z]$/.test(text.charAt(0));
    setIsLtr((p) => (p[field] === isEng ? p : { ...p, [field]: isEng }));
  }, []);

  return (
    <AnimatedPopup triggerKey={isEditMode ? "editProduct" : "newProduct"} title={isEditMode ? "ویرایش محصول" : "ثبت محصول جدید"}>
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        {formFields.map((f, i) => {
          const raw = formik.values[f.name as keyof typeof formik.values];
          const error = formik.errors[f.name];
          let display = f.name === "price" ? addCommas(raw) : raw;
          display = toPersianDigits(display);
          const ltr = f.name === "price" || isLtr[f.name] || false;
          const hasError = raw.length > 0 && !!error?.length;
          return (
            <motion.div key={f.name} custom={i} variants={fieldVariants} initial="hidden" animate="visible" className="flex flex-col relative">
              <label className="text-xs font-semibold text-muted-foreground ms-0.5 mt-1.5" htmlFor={f.name}>
                {f.label}
              </label>
              <motion.div className="my-1.5" whileFocus={{ scale: 1.002 }} transition={spring}>
                <Input
                  id={f.name}
                  autoFocus={f.name === "productName"}
                  {...f}
                  dir={ltr ? "ltr" : "rtl"}
                  value={display}
                  aria-invalid={hasError}
                  className="h-11"
                  autoComplete="off"
                  onChange={(e) => {
                    let t = e.target.value;
                    if (f.name === "price") {
                      t = removeCommas(t);
                      if (!/^\d*$/.test(toEnglishDigits(t))) return;
                    }
                    const eng = toEnglishDigits(t);
                    formik.setFieldValue(f.name, eng);
                    handleDirCheck(f.name, eng);
                  }}
                  onBlur={(e) => {
                    formik.handleBlur(e);
                    handleBlur(f.name, e.target.value);
                  }}
                />
              </motion.div>
              <AnimatePresence mode="wait">
                {hasError && (
                  <motion.span initial={{ opacity: 0, y: -2, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, y: -2, height: 0 }} transition={spring} className="text-[11px] text-destructive ms-0.5 overflow-hidden block">
                    {error}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14, type: "spring", stiffness: 400, damping: 32 }}>
          <Button type="submit" className="w-full mt-2" size="lg" disabled={!formik.isValid || isLoading}>
            {isLoading ? (
              <motion.svg initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.6, ease: "linear" }} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </motion.svg>
            ) : (
              "ذخیره و ثبت"
            )}
          </Button>
        </motion.div>
        {serverError && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-xs text-destructive">
            {serverError}
          </motion.div>
        )}
      </form>
    </AnimatedPopup>
  );
};

export default NewProduct;
