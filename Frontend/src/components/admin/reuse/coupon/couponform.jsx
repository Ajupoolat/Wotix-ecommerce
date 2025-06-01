import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

const couponSchema = z
  .object({
    code: z
      .string()
      .min(3, "Coupon code must be at least 3 characters")
      .max(20, "Coupon code must be less than 20 characters")
      .regex(
        /^[A-Z0-9]+$/,
        "Coupon code must be uppercase alphanumeric with no spaces"
      )
      .trim(),
    discountType: z.enum(["flat"], {
      required_error: "Discount type is required",
    }),
    discountValue: z
      .string()
      .min(1, "Discount value is required")
      .transform((val) => Number(val))
      .refine(
        (val) => !isNaN(val) && val >= 1,
        "Discount value must be at least 1"
      )
      .refine(
        (val) => Number(val.toFixed(2)) === val,
        "Discount value must have up to two decimal places"
      ),
    minPurchaseAmount: z
      .string()
      .min(1, "Minimum purchase amount is required")
      .transform((val) => Number(val))
      .refine(
        (val) => !isNaN(val) && val >= 0,
        "Minimum purchase amount must be 0 or more"
      )
      .refine(
        (val) => Number(val.toFixed(2)) === val,
        "Minimum purchase amount must have up to two decimal places"
      ),
    startDate: z
      .string()
      .min(1, "Start date is required")
      .refine((val) => {
        const inputDate = new Date(val);
        if (isNaN(inputDate.getTime())) return false;
        const inputDateOnly = new Date(
          inputDate.getFullYear(),
          inputDate.getMonth(),
          inputDate.getDate()
        );
        const today = new Date();
        const todayDateOnly = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );
        return inputDateOnly >= todayDateOnly;
      }, "Start date must be today or in the future"),
    endDate: z
      .string()
      .min(1, "End date is required")
      .refine((val) => !isNaN(new Date(val).getTime()), {
        message: "End date must be a valid date",
      }),
    isActive: z.boolean().default(true),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      const startDateOnly = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate()
      );
      const endDateOnly = new Date(
        end.getFullYear(),
        end.getMonth(),
        end.getDate()
      );
      return endDateOnly > startDateOnly;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  )
  .refine(
    (data) => {
      if (data.discountType === "flat") {
        return data.discountValue <= data.minPurchaseAmount;
      }
      return true;
    },
    {
      message:
        "Discount value must be less than or equal to minimum purchase amount",
      path: ["discountValue"],
    }
  );

const CouponForm = ({
  mode = "add",
  initialData = {},
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const form = useForm({
    resolver: zodResolver(couponSchema),
    mode: "onChange",
    defaultValues: {
      code: "",
      discountType: "flat",
      discountValue: undefined, // Changed from ""
      minPurchaseAmount: undefined, // Changed from ""
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      isActive: true,
    },
  });

  // Reset form when initialData changes (for edit mode)
  useEffect(() => {
    if (mode === "edit" && initialData) {
      form.reset({
        code: initialData.code || "",
        discountType: initialData.discountType || "flat",
        discountValue: initialData.discountValue
          ? Number(initialData.discountValue.toFixed(2)).toString()
          : "",
        minPurchaseAmount: initialData.minPurchaseAmount
          ? Number(initialData.minPurchaseAmount.toFixed(2)).toString()
          : "",
        startDate: initialData.startDate
          ? new Date(initialData.startDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        endDate: initialData.endDate
          ? new Date(initialData.endDate).toISOString().split("T")[0]
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
        isActive: initialData.isActive ?? true,
      });
    }
  }, [initialData, mode, form]);

  const handleSubmit = (data) => {
    onSubmit({
      ...data,
      discountValue: Number(data.discountValue),
      minPurchaseAmount: Number(data.minPurchaseAmount),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Coupon Code</FormLabel>
                <FormControl>
                  <Input
                    placeholder="SUMMER20"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      form.trigger("code");
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="discountType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select discount type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="flat">Flat Amount</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="discountValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount Value</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="10.00"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      form.trigger("discountValue");
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="minPurchaseAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Purchase Amount</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="100.00"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      form.trigger("minPurchaseAmount");
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="font-normal">Active</FormLabel>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-black text-white"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? mode === "edit"
                ? "Updating..."
                : "Creating..."
              : mode === "edit"
              ? "Update Coupon"
              : "Create Coupon"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CouponForm;
