"use client";

import { useEffect, useState, useTransition } from "react";
import { Upload, Check, X } from "lucide-react";
import { Button, buttonVariants } from "../ui/button";
import { ArrowRight, Copy } from "iconsax-reactjs";
import { toPersianDigits } from "@/utils/function";
import { discountPercent, plans } from "@/lib/pricing";
import { BillingInterval } from "@/generated/prisma/enums";
import { useFormik } from "formik";
import { acceptedFileTypes, paymentSchema } from "@/validation/payment.schema";
import Link from "next/link";
import { sendPayment, generateReceiptUploadUrl } from "@/actions/payment";
import { toast } from "sonner";
import { redirect, RedirectType } from "next/navigation";
import Spinner from "../ui/spinner";
import { removeImage } from "@/lib/s3";
import useCopyToClipboard from "@/hooks/useCopyToClipboard";
import * as z from "zod";

const CARD_NUMBER = "1234567899876543";
const CARD_OWNER = "تست";

type UploadResult = { src: string; previewUrl: string | null };

const PaymentForm = ({ interval }: { interval: BillingInterval }) => {
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPaying, startPayTransition] = useTransition();
  const [isUploading, startUploadTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const formattedCardNumber = CARD_NUMBER.match(/.{1,4}/g)?.join(" ") ?? CARD_NUMBER;

  const { copy, copied } = useCopyToClipboard();

  const calculatedPrice = interval === "YEARLY" && plans[1].price > 0 ? Math.round(plans[1].price * (1 - discountPercent / 100)) : plans[1].price;
  const totalPrice = interval === "YEARLY" ? calculatedPrice * 12 : calculatedPrice;

  const { values, errors, touched, isSubmitting, setFieldValue, setFieldTouched, handleBlur, handleSubmit } = useFormik({
    initialValues: { receipt: undefined as unknown as File },
    validate: (values) => {
      const result = paymentSchema.safeParse(values);
      if (result.success) return {};
      const tree = z.treeifyError(result.error);
      return { receipt: tree.properties?.receipt?.errors[0] };
    },
    onSubmit: (values) => {
      if (isPaying || isUploading) return;

      if (!uploadResult) {
        toast.error("لطفا منتظر پایان آپلود فیش واریز بمانید");
        return;
      }

      startPayTransition(async () => {
        const res = await sendPayment({ ...values, interval, src: uploadResult.src });

        if (res.status === 200) {
          toast.success(res.message);
          redirect("/dashboard", RedirectType.replace);
        } else {
          toast.error(res.message);
        }
      });
    },
  });

  const receiptError = errors.receipt as string | undefined;
  const receiptFile = values.receipt as File | undefined;
  const isValidReceipt = !!receiptFile && !receiptError;

  useEffect(
    () => () =>
      setUploadResult((prev) => {
        if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
        return prev;
      }),
    [],
  );

  const formatFileSize = (bytes: number) => (bytes < 1024 ? `${bytes} بایت` : bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} کیلوبایت` : `${(bytes / (1024 * 1024)).toFixed(1)} مگابایت`);

  const setReceipt = (file: File | undefined) => {
    setFieldTouched("receipt", !!file, false);
    setFieldValue("receipt", file);
  };

  const uploadWithProgress = (file: File, url: string, src: string) =>
    new Promise<UploadResult | null>((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setUploadProgress(Math.min(99, Math.round((e.loaded / e.total) * 100)));
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setUploadProgress(100);
          resolve({ src, previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : null });
        } else {
          toast.error("خطا در آپلود فیش واریز");
          resolve(null);
        }
      };
      xhr.onerror = () => {
        toast.error("خطا در آپلود فیش واریز");
        resolve(null);
      };
      xhr.send(file);
    });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = paymentSchema.safeParse({ receipt: file });

    setReceipt(file);

    if (!result.success) return;

    setUploadProgress(0);

    startUploadTransition(async () => {
      const res = await generateReceiptUploadUrl({ contentType: file.type });

      if (res.status !== 200 || !("url" in res) || !("src" in res)) {
        toast.error(res.message);
        setUploadResult(null);
        return;
      }

      const result = await uploadWithProgress(file, res.url, res.src);
      setUploadResult(result);
    });
  };

  const handleRemoveFile = () => {
    startDeleteTransition(async () => {
      if (uploadResult) {
        const res = await removeImage(uploadResult.src);

        if (res.status !== 200) {
          toast.error(res.message);
          return;
        }
      }

      setReceipt(undefined);
      setUploadProgress(0);
      setUploadResult((prev) => {
        if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
        return null;
      });
    });
  };

  const summaryRows = [
    {
      label:
        interval === "MONTHLY" ? (
          "اشتراک ماهانه"
        ) : (
          <>
            اشتراک سالانه <span className="text-[11px] font-medium">محاسبه به صورت ماهیانه</span>
          </>
        ),
      value: calculatedPrice,
    },
    { label: "مالیات", value: 0 },
    { label: "مبلغ قابل پرداخت", value: totalPrice },
  ];

  return (
    <div className="paddingBody max-w-265 py-4 lg:py-10 flex flex-col gap-y-4 sm:gap-6">
      <Link className={buttonVariants({ size: "icon", variant: "ghost" })} href="/dashboard/plan" aria-label="بازگشت">
        <ArrowRight className="size-6" />
      </Link>

      <form onSubmit={handleSubmit} className="flex gap-4 sm:gap-6 max-md:flex-col w-full">
        <div className="flex flex-col gap-6 md:max-w-108 bg-card rounded-4xl border p-4 flex-1">
          <p className="mb-3 text-[28px] leading-8.5 font-medium">پلن پرو</p>

          <div className="flex flex-col mb-3 gap-y-5">
            {plans[1].features.map((feature, index) => (
              <div className="flex items-center gap-x-3.5" key={index}>
                <feature.icon className="size-5 shrink-0" variant="Bold" />
                <p className="flex-1 text-sm">{feature.text}</p>
              </div>
            ))}
          </div>

          <hr />

          <div className="w-full pt-3 flex flex-col gap-y-3">
            {summaryRows.map((row, index) => (
              <div className="w-full flex items-center justify-between last:**:font-semibold" key={index}>
                <div>{row.label}</div>
                <p>
                  {row.value.toLocaleString("fa-IR")} <span className="text-xs">تومان</span>
                </p>
              </div>
            ))}
          </div>

          <Button type="submit" disabled={!values.receipt || !!receiptError || !uploadResult || isSubmitting || isPaying || isUploading} className="h-12">
            {isPaying ? <Spinner /> : "پرداخت کردم"}
          </Button>
        </div>

        <div className="flex flex-col bg-card p-4 h-fit rounded-4xl border gap-y-5 flex-1">
          <div className="flex justify-between w-full">
            <div className="flex flex-col gap-1">
              <p className="text-sm w-fit" dir="ltr">
                {toPersianDigits(formattedCardNumber)}
              </p>
              <p className="text-sm font-medium">{CARD_OWNER}</p>
            </div>

            <Button onClick={() => copy(CARD_NUMBER)} aria-label="کپی شماره کارت" className="active:translate-y-0! active:scale-90" size="icon" variant="ghost" type="button">
              {copied ? <Check /> : <Copy />}
            </Button>
          </div>

          {isValidReceipt ? (
            <div className="flex items-center gap-3 rounded-3xl bg-muted dark:bg-background p-3">
              {uploadResult?.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={uploadResult.previewUrl} alt={receiptFile.name} className="size-14 shrink-0 rounded-xl object-cover" />
              ) : (
                <div className="size-14 shrink-0 rounded-xl bg-background dark:bg-muted flex items-center justify-center">
                  <Spinner />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{receiptFile.name}</p>
                <p className="text-xs mt-0.5">{isUploading ? `${toPersianDigits(uploadProgress)}%` : formatFileSize(receiptFile.size)}</p>
              </div>

              <Button type="button" onClick={handleRemoveFile} aria-label="حذف فایل" size="icon" variant="destructive" className="shrink-0" disabled={isUploading || isDeleting}>
                {isDeleting ? <Spinner /> : <X className="size-4" />}
              </Button>
            </div>
          ) : (
            <label htmlFor="inputFile" className="group cursor-pointer relative overflow-hidden rounded-2xl border-2 border-dashed border-border bg-muted/50 transition-colors duration-200 hover:border-primary/50 hover:bg-primary/5">
              <div className="flex flex-col items-center justify-center gap-y-2 py-7">
                <div className="flex size-10 items-center justify-center rounded-xl bg-muted transition-colors duration-200 group-hover:bg-primary/10">
                  <Upload className="size-5 transition-colors duration-200 group-hover:text-primary" />
                </div>
                <p className="text-sm font-medium transition-colors duration-200 group-hover:text-primary">فیش واریز</p>
                <p className="text-xs">فقط فرمت های PNG, JPG, JPEG, WEBP</p>
              </div>
              <input type="file" name="inputFile" id="inputFile" className="hidden" accept={acceptedFileTypes.join(",")} onChange={handleFileChange} onBlur={handleBlur} />
            </label>
          )}

          {touched.receipt && receiptError && <p className="text-xs text-destructive">{receiptError}</p>}
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;
