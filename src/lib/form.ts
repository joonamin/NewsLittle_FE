import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  type FieldValues,
  type UseFormProps,
  type UseFormReturn,
} from "react-hook-form";
import type { z } from "zod";

/**
 * Client-side field constraints for text, select, and multi-select inputs.
 * A failed parse sets field errors and does not call the mutation.
 * Server refusals stay on the mutation (isError / setError), not in the schema.
 */
export function parseFormValues<T>(schema: z.ZodType<T>, values: unknown) {
  return schema.safeParse(values);
}

export function useValidatedForm<TFieldValues extends FieldValues>(
  schema: z.ZodType<TFieldValues, TFieldValues>,
  options?: Omit<UseFormProps<TFieldValues>, "resolver">,
) {
  return useForm<TFieldValues>({
    ...options,
    resolver: zodResolver(schema),
  });
}

export function submitValidated<TFieldValues extends FieldValues, TResult>(
  form: UseFormReturn<TFieldValues>,
  mutateAsync: (values: TFieldValues) => Promise<TResult>,
) {
  return form.handleSubmit((values) => mutateAsync(values));
}
