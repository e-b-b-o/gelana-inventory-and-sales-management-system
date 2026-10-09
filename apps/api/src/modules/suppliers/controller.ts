import { Request, Response } from "express";
import { SuppliersService } from "./service.js";
import { createSupplierSchema, updateSupplierSchema, toggleSupplierStatusSchema } from "./schema.js";
import { z } from "zod";

const suppliersService = new SuppliersService();

export class SuppliersController {
  async getSuppliers(req: Request, res: Response) {
    try {
      const suppliers = await suppliersService.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      console.error("[SuppliersController.getSuppliers]", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async createSupplier(req: Request, res: Response) {
    try {
      const data = createSupplierSchema.parse(req.body);
      const supplier = await suppliersService.createSupplier(data);
      res.status(201).json(supplier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: (error as any).errors });
      }
      if (error instanceof Error && error.message.includes("already exists")) {
        return res.status(400).json({ error: error.message });
      }
      console.error("[SuppliersController.createSupplier]", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateSupplier(req: Request, res: Response) {
    try {
      const data = updateSupplierSchema.parse(req.body);
      const supplier = await suppliersService.updateSupplier(req.params.id as string, data);
      res.json(supplier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: (error as any).errors });
      }
      if (error instanceof Error) {
        if (error.message === "Supplier not found") {
          return res.status(404).json({ error: error.message });
        }
        if (error.message.includes("already exists")) {
          return res.status(400).json({ error: error.message });
        }
      }
      console.error("[SuppliersController.updateSupplier]", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async toggleSupplierStatus(req: Request, res: Response) {
    try {
      const data = toggleSupplierStatusSchema.parse(req.body);
      const supplier = await suppliersService.toggleSupplierStatus(req.params.id as string, data);
      res.json(supplier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: (error as any).errors });
      }
      if (error instanceof Error && error.message === "Supplier not found") {
        return res.status(404).json({ error: error.message });
      }
      console.error("[SuppliersController.toggleSupplierStatus]", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
