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
