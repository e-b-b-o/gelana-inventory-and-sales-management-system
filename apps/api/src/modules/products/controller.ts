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

  // --- Product Units ---

  async getProductUnits(req: Request, res: Response) {
    try {
      const units = await productsService.getProductUnits(req.params.id as string);
      res.json(units);
    } catch (error) {
      console.error("[ProductsController.getProductUnits]", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async createProductUnit(req: Request, res: Response) {
    try {
      const { createProductUnitSchema } = await import("./schema.js");
      const data = createProductUnitSchema.parse(req.body);
      const unit = await productsService.createProductUnit(req.params.id as string, data);
      res.status(201).json(unit);
    } catch (error) {
      const { z } = await import("zod");
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: (error as any).errors });
      }
      if (error instanceof Error) {
        if (error.message.includes("not found")) return res.status(404).json({ error: error.message });
        return res.status(400).json({ error: error.message });
      }
      console.error("[ProductsController.createProductUnit]", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateProductUnit(req: Request, res: Response) {
    try {
      const { updateProductUnitSchema } = await import("./schema.js");
      const data = updateProductUnitSchema.parse(req.body);
      const unit = await productsService.updateProductUnit(req.params.id as string, req.params.unitId as string, data);
      res.json(unit);
    } catch (error) {
      const { z } = await import("zod");
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: (error as any).errors });
      }
      if (error instanceof Error) {
        if (error.message.includes("not found")) return res.status(404).json({ error: error.message });
        return res.status(400).json({ error: error.message });
      }
      console.error("[ProductsController.updateProductUnit]", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async toggleProductUnitStatus(req: Request, res: Response) {
    try {
      const { toggleProductUnitStatusSchema } = await import("./schema.js");
      const data = toggleProductUnitStatusSchema.parse(req.body);
      const unit = await productsService.toggleProductUnitStatus(req.params.id as string, req.params.unitId as string, data);
      res.json(unit);
    } catch (error) {
      const { z } = await import("zod");
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: (error as any).errors });
      }
      if (error instanceof Error) {
        if (error.message.includes("not found")) return res.status(404).json({ error: error.message });
        return res.status(400).json({ error: error.message });
      }
      console.error("[ProductsController.toggleProductUnitStatus]", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // --- Product Prices ---

  async getProductUnitPrices(req: Request, res: Response) {
    try {
      const prices = await productsService.getProductUnitPrices(req.params.id as string, req.params.unitId as string);
      res.json(prices);
    } catch (error) {
      console.error("[ProductsController.getProductUnitPrices]", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async setProductUnitPrice(req: Request, res: Response) {
    try {
      const { setProductUnitPriceSchema } = await import("./schema.js");
      const data = setProductUnitPriceSchema.parse(req.body);
      const price = await productsService.setProductUnitPrice(req.params.id as string, req.params.unitId as string, data);
      res.status(201).json(price);
    } catch (error) {
      const { z } = await import("zod");
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: (error as any).errors });
      }
      if (error instanceof Error) {
        if (error.message.includes("not found")) return res.status(404).json({ error: error.message });
        return res.status(400).json({ error: error.message });
      }
      console.error("[ProductsController.setProductUnitPrice]", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
