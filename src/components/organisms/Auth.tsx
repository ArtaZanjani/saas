"use client";
import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import { z } from "zod";
import { motion, AnimatePresence } from "motion/react";
import useMeasure from "react-use-measure";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldGroup,
  FieldError,
} from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toEnglishDigits, toPersianDigits } from "@/utils/function";
import { phoneNumberSchema } from "@/validation/global.schema";
import AnimatedPopup from "@/components/organisms/AnimatedPopup";
import { requestOtpAction, verifyOtp } from "@/actions/auth";
import { toast } from "sonner";
import Spinner from "@/components/ui/spinner";
import { Edit2 } from "iconsax-reactjs";

const OTP_LEN = 6;
const PHONE_LEN = 11;
const TIMER_SEC = 120;
const SLOT_CLS = "flex-1 aspect-square h-auto text-lg";
const SLOTS = Array.from({ length: OTP_LEN }, (_, i) => i);
const SPRING = { type: "spring", stiffness: 450, damping: 45 } as const;
const H_SPRING = { type: "spring", stiffness: 400, damping: 40 } as const;
const FADE = { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] } as const;
const FADE_IN = { opacity: 0, filter: "blur(4px)", scale: 0.96 } as const;

const stripDigits = (v: string) => toEnglishDigits(v).replace(/\D/g, "");

const normalizePhone = (raw: string) => {
  let d = stripDigits(raw);
  if (d.startsWith("0098")) d = "0" + d.slice(4);
  else if (d.startsWith("98") && d.length >= 12) d = "0" + d.slice(2);
  return (d.length > 0 && d[0] !== "0" ? "0" + d : d).slice(0, PHONE_LEN);
};

const formatDisplay = (d: string) =>
  toPersianDigits(d.replace(/(\d{4})(\d{0,3})(\d{0,4})/, "$1 $2 $3").trim());
const formatTimer = (s: number) =>
  toPersianDigits(
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`,
  );

type Step = "phone" | "otp";

const Auth = () => {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, startTransition] = useTransition();
  const [pRef, pBounds] = useMeasure();
  const [oRef, oBounds] = useMeasure();
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current!);
    setTimer(TIMER_SEC);
    timerRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, []);

  const valid = useMemo(
    () => phoneNumberSchema.safeParse(phone).success,
    [phone],
  );
  const display = useMemo(() => formatDisplay(phone), [phone]);
  const persianOtp = useMemo(() => toPersianDigits(otp), [otp]);
  const timerText = useMemo(() => formatTimer(timer), [timer]);

  const goOtp = useCallback(() => {
    try {
      phoneNumberSchema.parse(phone);
      startTransition(async () => {
        const res = await requestOtpAction({ phoneNumber: phone });

        if (res.status === 200) {
          alert(res.message);
          setError(null);
          setStep("otp");
          setOtp("");
          startTimer();
        } else {
          toast.error(res.message);
        }
      });
    } catch (err) {
      setError(
        err instanceof z.ZodError ? err.issues[0].message : "خطایی رخ داد",
      );
    }
  }, [phone, startTimer]);

  const verify = useCallback(() => {
    startTransition(async () => {
      const res = await verifyOtp({ phoneNumber: phone, otp });
      if ("status" in res) toast.error(res.message);
    });
  }, [phone, otp]);

  return (
    <AnimatedPopup title="ورود" triggerKey="login">
      <motion.div
        className="w-full overflow-hidden"
        animate={{
          height: (step === "otp" ? oBounds.height : pBounds.height) || "auto",
        }}
        transition={H_SPRING}
      >
        <motion.div
          className="flex w-[200%] items-start"
          animate={{ x: step === "otp" ? "50%" : "0%" }}
          transition={SPRING}
        >
          <div
            ref={pRef}
            className="w-1/2 px-5 flex flex-col justify-center shrink-0"
          >
            <FieldGroup>
              <Field data-invalid={!!error}>
                <FieldLabel htmlFor="phone">شماره موبایل</FieldLabel>
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="numeric"
                  placeholder="۰۹۱۲ ۰۰۰ ۰۰۰۰"
                  value={display}
                  onChange={(e) => {
                    setPhone(normalizePhone(e.target.value));
                    setError(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && goOtp()}
                  aria-invalid={!!error}
                />
                <AnimatePresence mode="wait">
                  {error ? (
                    <motion.div
                      key="e"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                    >
                      <FieldError>{error}</FieldError>
                    </motion.div>
                  ) : (
                    <FieldDescription>
                      کد تایید به این شماره ارسال می‌شود.
                    </FieldDescription>
                  )}
                </AnimatePresence>
              </Field>
              <Button
                onClick={goOtp}
                className="w-full"
                size="lg"
                disabled={!valid || loading}
              >
                {loading ? <Spinner /> : "ادامه"}
              </Button>
            </FieldGroup>
          </div>

          <div
            ref={oRef}
            className="w-1/2 px-5 flex flex-col justify-center items-center shrink-0"
          >
            <FieldGroup className="items-center">
              <Field>
                <FieldLabel htmlFor="otp" className="text-center">
                  کد تایید
                </FieldLabel>
                <div className="flex items-center gap-x-1">
                  <FieldDescription className="h-fit">
                    کد ارسال‌شده به <span dir="ltr">{display}</span> را وارد
                    کنید.
                  </FieldDescription>
                  <Button
                    className="-translate-y-1 active:-translate-y-1!"
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => setStep("phone")}
                  >
                    <Edit2 variant="Bold" />
                  </Button>
                </div>
                <div className="w-full" dir="ltr">
                  <InputOTP
                    id="otp"
                    maxLength={OTP_LEN}
                    inputMode="numeric"
                    value={persianOtp}
                    onChange={(v) => setOtp(stripDigits(v).slice(0, OTP_LEN))}
                    onComplete={verify}
                    containerClassName="w-full"
                  >
                    <InputOTPGroup className="w-full">
                      {SLOTS.map((i) => (
                        <InputOTPSlot key={i} index={i} className={SLOT_CLS} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </Field>
              <div className="w-full space-y-1">
                <Button
                  onClick={verify}
                  className="w-full"
                  size="lg"
                  disabled={!otp.length || loading}
                >
                  {loading ? <Spinner /> : "تایید"}
                </Button>
                <AnimatePresence mode="wait">
                  {timer > 0 ? (
                    <motion.div
                      key="timer"
                      initial={FADE_IN}
                      animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                      exit={FADE_IN}
                      transition={FADE}
                      className="flex items-center justify-center gap-1.5 py-2"
                    >
                      <span className="text-sm text-muted-foreground">
                        ارسال مجدد تا {timerText}
                      </span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="resend"
                      initial={FADE_IN}
                      animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                      exit={FADE_IN}
                      transition={FADE}
                    >
                      <Button
                        variant="ghost"
                        onClick={goOtp}
                        className="w-full"
                        disabled={loading}
                      >
                        ارسال مجدد
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FieldGroup>
          </div>
        </motion.div>
      </motion.div>
    </AnimatedPopup>
  );
};

export default Auth;
