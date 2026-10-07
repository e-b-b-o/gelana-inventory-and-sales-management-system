import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "../../../lib/api";

export interface Product {
  id: string;
  sku: string;
  name: string;
  categoryId: string;
  categoryName: string;
  brand: string | null;
  description: string | null;
  imageUrl: string | null;
  unit: string;
  defaultSellingPrice: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  name: string;
  categoryId: string;
  brand?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  unit: string;
  defaultSellingPrice: number;
  isActive?: boolean;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {}

export const useProducts = () => {
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await fetchApi("/products");
      return response as Product[];
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateProductInput) => {
      const response = await fetchApi("/products", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProductInput }) => {
      const response = await fetchApi(`/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useUpdateProductStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await fetchApi(`/products/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
