import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/Alert";

type FormGlobalErrorProps = {
  message?: string;
};

export function FormGlobalError({ message }: FormGlobalErrorProps) {
  if (!message) return null;

  return (
    <Alert variant="error" className="flex gap-3">
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div>
        <AlertTitle>Unable to generate plan</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </div>
    </Alert>
  );
}
