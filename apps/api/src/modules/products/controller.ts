import { Request, Response } from "express";
import { ProductsService } from "./service.js";
import { createProductSchema, updateProductSchema, toggleProductStatusSchema } from "./schema.js";
import { z } from "zod";

const productsService = new ProductsService();

export class ProductsController {
  async getProducts(req: Request, res: Response) {
    try {
      const products = await productsService.getProducts();
      res.json(products);
    } catch (error) {
      console.error("[ProductsController.getProducts]", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async createProduct(req: Request, res: Response) {
    try {
      const data = createProductSchema.parse(req.body);
      const product = await productsService.createProduct(data);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: (error as any).errors });
      }
      if (error instanceof Error && error.message.includes("Category not found")) {
        return res.status(404).json({ error: error.message });
      }
      if (error instanceof Error && error.message.includes("Cannot assign inactive category")) {
        return res.status(400).json({ error: error.message });
      }
      console.error("[ProductsController.createProduct]", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateProduct(req: Request, res: Response) {
    try {
      const data = updateProductSchema.parse(req.body);
      const product = await productsService.updateProduct(req.params.id as string, data);
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: (error as any).errors });
      }
      if (error instanceof Error && error.message.includes("Product not found")) {
        return res.status(404).json({ error: error.message });
      }
      if (error instanceof Error && error.message.includes("Category not found")) {
        return res.status(404).json({ error: error.message });
      }
      if (error instanceof Error && error.message.includes("Cannot assign inactive category")) {
        return res.status(400).json({ error: error.message });
      }
      console.error("[ProductsController.updateProduct]", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async toggleProductStatus(req: Request, res: Response) {
    try {
      const data = toggleProductStatusSchema.parse(req.body);
      const product = await productsService.toggleProductStatus(req.params.id as string, data);
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: (error as any).errors });
      }
      if (error instanceof Error && error.message === "Product not found") {
        return res.status(404).json({ error: error.message });
      }
      console.error("[ProductsController.toggleProductStatus]", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
