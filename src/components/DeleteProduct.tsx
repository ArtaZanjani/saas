"use client";
import { deleteProduct } from "@/actions/product";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash } from "iconsax-reactjs";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import Spinner from "./ui/spinner";

const DeleteProduct = ({ id, ariaLabel }: { id: string; ariaLabel: string }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, startTransition] = useTransition();

  const deleteFunc = () => {
    if (isLoading) return;
    startTransition(async () => {
      const res = await deleteProduct({ id });

      if (res?.status === 200) {
        toast.success(res.message);
        setOpen(false);
      } else {
        toast.error(res?.message);
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button size="icon-sm" variant="destructive" aria-label={ariaLabel}>
            <Trash />
          </Button>
        }
      />
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash />
          </AlertDialogMedia>
          <AlertDialogTitle>حذف محصول</AlertDialogTitle>
          <AlertDialogDescription>این محصول برای همیشه حذف می‌شود.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline" disabled={isLoading}>
            انصراف
          </AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={isLoading} onClick={deleteFunc}>
            {isLoading ? <Spinner /> : "حذف محصول"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteProduct;
