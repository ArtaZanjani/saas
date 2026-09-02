"use client";
import { useState, useMemo, useCallback, useTransition, Fragment } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useFormik } from "formik";
import { createOrder } from "@/actions/order";
import { toPersianDigits, toEnglishDigits } from "@/utils/function";
import { removeSpaces, formatPhone, trimObject } from "@/utils/format";
import { toFormikValidationSchema } from "zod-formik-adapter";
import newOrderSchema from "@/validation/newOrder.schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AnimatedPopup from "@/components/organisms/AnimatedPopup";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { Textarea } from "@/components/ui/textarea";

const spring = {
  type: "spring" as const,
  stiffness: 500,
  damping: 32,
  mass: 0.45,
};
const fieldVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 420,
      damping: 36,
      mass: 0.55,
      delay: i * 0.03,
    },
  }),
};

const formFields = [
  {
    label: "نام مشتری",
    name: "userName",
    type: "text",
    placeholder: "مثلاً علی رضایی",
    autoComplete: "name",
  },
  {
    label: "شماره موبایل",
    name: "phoneNumber",
    type: "tel",
    placeholder: "۰۹۱۲...",
    autoComplete: "tel",
  },
  {
    label: "آدرس",
    name: "address",
    placeholder: "مثلاً تهران، خیابان ولیعصر، کوچه مهر",
  },
] as const;

const NewOrder = ({
  products,
}: {
  products: { productId: string; productName: string }[];
}) => {
  const [isLtr, setIsLtr] = useState<Record<string, boolean>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, startTransition] = useTransition();
  const formik = useFormik({
    initialValues: {
      userName: "",
      phoneNumber: "",
      productIds: [] as string[],
      address:""
    },
    validationSchema: useMemo(
      () => toFormikValidationSchema(newOrderSchema),
      [],
    ),
    validateOnMount: true,
    onSubmit: async (values) => {
      setServerError(null);
      startTransition(async () => {
        const res = await createOrder(trimObject(values));

        if ("message" in res) {
          setServerError(res.message);
        }
      });
    },
  });
  const handleBlur = useCallback((field: string, value: string) => {
    const raw = removeSpaces(value);
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

  const anchor = useComboboxAnchor();

  const productNameById = useMemo(
    () => new Map(products.map((p) => [p.productId, p.productName])),
    [products],
  );

  const productIdsError = formik.errors.productIds;
  const productIdsHasError =
    formik.touched.productIds &&
    typeof productIdsError === "string" &&
    productIdsError.length > 0;

  return (
    <AnimatedPopup
      triggerKey="new"
      title="ثبت سفارش جدید"
      onClose={() => formik.resetForm({})}
    >
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        {formFields.map((f, i) => {
          const raw = formik.values[f.name];
          const error = formik.errors[f.name];
          let display = f.name === "phoneNumber" ? formatPhone(raw) : raw;
          display = toPersianDigits(display);
          const ltr = f.name === "phoneNumber" || isLtr[f.name] || false;
          const hasError = raw.length > 0 && !!error?.length;
          return (
            <motion.div
              key={f.name}
              custom={i}
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col"
            >
              <label
                className="text-xs font-semibold text-muted-foreground ms-0.5 mt-1.5"
                htmlFor={f.name}
              >
                {f.label}
              </label>
              <motion.div
                className="my-1.5"
                whileFocus={{ scale: 1.002 }}
                transition={spring}
              >
                {f.name === "address" ? (
                  <Textarea
                    id={f.name}
                    {...f}
                    dir={ltr ? "ltr" : "rtl"}
                    value={display}
                    aria-invalid={hasError}
                    autoComplete="off"
                    rows={4}
                    onChange={(e) => {
                      const eng = toEnglishDigits(e.target.value);
                      formik.setFieldValue(f.name, eng);
                      handleDirCheck(f.name, eng);
                    }}
                    onBlur={(e) => {
                      formik.handleBlur(e);
                      handleBlur(f.name, e.target.value);
                    }}
                  />
                ) : (
                  <Input
                    id={f.name}
                    autoFocus={f.name === "userName"}
                    {...f}
                    dir={ltr ? "ltr" : "rtl"}
                    value={display}
                    aria-invalid={hasError}
                    className="h-11"
                    autoComplete="off"
                    onChange={(e) => {
                      let t = e.target.value;

                      if (f.name === "phoneNumber") {
                        t = removeSpaces(t);
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
                )}
              </motion.div>
              <AnimatePresence mode="wait">
                {hasError && (
                  <motion.span
                    initial={{ opacity: 0, y: -2, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -2, height: 0 }}
                    transition={spring}
                    className="text-[11px] text-destructive ms-0.5 overflow-hidden block"
                  >
                    {error}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        <div className="flex flex-col relative">
          <label
            id="product-label"
            className="text-xs font-semibold text-muted-foreground ms-0.5 mt-1.5"
          >
            محصول
          </label>

          <Combobox
            multiple
            autoHighlight
            items={products.map((p) => p.productId)}
            value={formik.values.productIds ?? []}
            onValueChange={(value: string[]) =>
              formik.setFieldValue("productIds", value)
            }
          >
            <ComboboxChips
              ref={anchor}
              className="w-full min-h-11 my-1.5"
              onBlur={() => formik.setFieldTouched("productIds", true)}
            >
              <ComboboxValue>
                {(values) => (
                  <Fragment>
                    {values.map((value: string) => (
                      <ComboboxChip key={value}>
                        {productNameById.get(value) ?? value}
                      </ComboboxChip>
                    ))}
                    <ComboboxChipsInput aria-labelledby="product-label" />
                  </Fragment>
                )}
              </ComboboxValue>
            </ComboboxChips>
            <ComboboxContent anchor={anchor}>
              <ComboboxEmpty>محصولی ثبت نشده</ComboboxEmpty>
              <ComboboxList>
                {(item) => (
                  <ComboboxItem key={item} value={item}>
                    {productNameById.get(item) ?? item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          <AnimatePresence mode="wait">
            {productIdsHasError && (
              <motion.span
                initial={{ opacity: 0, y: -2, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -2, height: 0 }}
                transition={spring}
                className="text-[11px] text-destructive ms-0.5 overflow-hidden block"
              >
                {productIdsError}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.14,
            type: "spring",
            stiffness: 400,
            damping: 32,
          }}
        >
          <Button
            type="submit"
            className="w-full mt-2"
            size="lg"
            disabled={!formik.isValid || isLoading}
          >
            {isLoading ? (
              <motion.svg
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.6, ease: "linear" }}
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </motion.svg>
            ) : (
              "ذخیره و ثبت"
            )}
          </Button>
        </motion.div>
        {serverError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-xs text-destructive"
          >
            {serverError}
          </motion.div>
        )}
      </form>
    </AnimatedPopup>
  );
};

export default NewOrder;
