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

export interface ProductQueryParams {
  search?: string;
  categoryId?: string;
  isActive?: boolean;
}

export const useProducts = (
  paramsOrOptions?: ProductQueryParams | { enabled?: boolean },
  options?: { enabled?: boolean }
) => {
  const isParams =
    paramsOrOptions &&
    ("search" in paramsOrOptions || "categoryId" in paramsOrOptions || "isActive" in paramsOrOptions);
  const params = isParams ? (paramsOrOptions as ProductQueryParams) : undefined;
  const opts = isParams ? options : (paramsOrOptions as { enabled?: boolean });

  return useQuery<Product[]>({
    queryKey: ["products", params?.search, params?.categoryId, params?.isActive],
    queryFn: async ({ signal }) => {
      const searchParams = new URLSearchParams();
      if (params?.search?.trim()) searchParams.append("search", params.search.trim());
      if (params?.categoryId) searchParams.append("categoryId", params.categoryId);
      if (params?.isActive !== undefined) searchParams.append("isActive", String(params.isActive));

      const qs = searchParams.toString();
      const endpoint = qs ? `/products?${qs}` : "/products";
      const response = await fetchApi(endpoint, { signal });
      return response as Product[];
    },
    staleTime: 3 * 60 * 1000,
    enabled: opts?.enabled,
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

export interface ProductUnit {
  id: string;
  productId: string;
  name: string;
  isBase: boolean;
  isActive: boolean;
  conversionQuantity: string;
  sellingPrice?: string;
}

export interface CreateProductUnitInput {
  name: string;
  conversionQuantity: number;
  sellingPrice?: number;
  isActive?: boolean;
}

export interface UpdateProductUnitInput {
  name?: string;
  conversionQuantity?: number;
  sellingPrice?: number;
}

export const useProductUnits = (productId: string) => {
  return useQuery<ProductUnit[]>({
    queryKey: ["products", productId, "units"],
    queryFn: async () => {
      if (!productId) return [];
      const response = await fetchApi(`/products/${productId}/units`);
      return response as ProductUnit[];
    },
    enabled: !!productId,
  });
};

export const useCreateProductUnit = (productId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateProductUnitInput) => {
      // First create unit
      const response = await fetchApi(`/products/${productId}/units`, {
        method: "POST",
        body: JSON.stringify({
          name: data.name,
          conversionQuantity: data.conversionQuantity,
          isActive: data.isActive
        }),
      });
      
      // Then if price provided, set price
      if (data.sellingPrice !== undefined) {
        await fetchApi(`/products/${productId}/units/${(response as any).id}/prices`, {
          method: "POST",
          body: JSON.stringify({ sellingPrice: data.sellingPrice }),
        });
      }
      
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", productId, "units"] });
    },
  });
};

export const useUpdateProductUnit = (productId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ unitId, data }: { unitId: string; data: UpdateProductUnitInput }) => {
      // Update unit
      const promises: Promise<any>[] = [];
      
      if (data.name !== undefined || data.conversionQuantity !== undefined) {
        promises.push(fetchApi(`/products/${productId}/units/${unitId}`, {
          method: "PUT",
          body: JSON.stringify({
            name: data.name,
            conversionQuantity: data.conversionQuantity
          }),
        }));
      }

      // Update price if provided
      if (data.sellingPrice !== undefined) {
        promises.push(fetchApi(`/products/${productId}/units/${unitId}/prices`, {
          method: "POST",
          body: JSON.stringify({ sellingPrice: data.sellingPrice }),
        }));
      }

      const results = await Promise.all(promises);
      return results[0]; // Return the unit response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", productId, "units"] });
      // Refetch products list in case base unit price changed
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useUpdateProductUnitStatus = (productId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ unitId, isActive }: { unitId: string; isActive: boolean }) => {
      const response = await fetchApi(`/products/${productId}/units/${unitId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", productId, "units"] });
    },
  });
};

export interface ProductUnitPrice {
  id: string;
  productUnitId: string;
  sellingPrice: string;
  effectiveFrom: string;
  effectiveUntil: string | null;
}

export const useProductUnitPrices = (productId: string, unitId: string) => {
  return useQuery<ProductUnitPrice[]>({
    queryKey: ["products", productId, "units", unitId, "prices"],
    queryFn: async () => {
      if (!productId || !unitId) return [];
      const response = await fetchApi(`/products/${productId}/units/${unitId}/prices`);
      return response as ProductUnitPrice[];
    },
    enabled: !!productId && !!unitId,
  });
};
