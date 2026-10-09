import { useMutation } from "@tanstack/react-query";
import { fetchApi } from "../../../lib/api";

export type SaleItemPayload = {
  productId: string;
  unitId: string;
  quantity: number;
  unitPrice: number;
};

export type SalePaymentPayload = {
  paymentMethodId: string;
  amount: number;
};

export type CreateSalePayload = {
  idempotencyKey?: string;
  branchId: string;
  soldAt?: string;
  items: SaleItemPayload[];
  payments: SalePaymentPayload[];
};

export const useCreateSale = () => {
  return useMutation({
    mutationFn: async (payload: CreateSalePayload) => {
      const res = await fetchApi("/sales", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      return res;
    },
    onSuccess: () => {
      alert("Sale completed successfully");
    },
    onError: (err: any) => {
      alert(err?.message || "Failed to create sale");
    },
  });
};
