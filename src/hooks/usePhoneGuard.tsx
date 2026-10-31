import { useState, useCallback, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { validatePhone, isLnrPhone } from "@/utils/phone";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function usePhoneGuard(): {
  guard: (phone: string, action: () => void, optional?: boolean) => void;
  dialog: ReactNode;
} {
  const { toast } = useToast();
  const [pending, setPending] = useState<(() => void) | null>(null);

  const guard = useCallback(
    (phone: string, action: () => void, optional = false) => {
      const error = validatePhone(phone, optional);
      if (error) {
        toast({ title: "Неверный номер телефона", description: error, variant: "destructive" });
        return;
      }
      if (phone.trim() && !isLnrPhone(phone.trim())) {
        setPending(() => action);
        return;
      }
      action();
    },
    [toast],
  );

  const dialog = (
    <AlertDialog open={!!pending} onOpenChange={(v) => { if (!v) setPending(null); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Внимание</AlertDialogTitle>
          <AlertDialogDescription>
            Номер не является оператором Луганской Народной Республики и могут быть проблемы с доставкой кода.
            Продолжить?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => setPending(null)}>Нет</Button>
          <Button
            onClick={() => {
              const action = pending;
              setPending(null);
              action?.();
            }}
          >
            Да, продолжить
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { guard, dialog };
}
