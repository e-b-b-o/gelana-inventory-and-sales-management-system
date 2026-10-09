import { Request, Response } from "express";
import { PaymentMethodsService } from "./service.js";
import { createPaymentMethodSchema, updatePaymentMethodSchema, togglePaymentMethodStatusSchema } from "./schema.js";
import { z } from "zod";

const paymentMethodsService = new PaymentMethodsService();

export class PaymentMethodsController {
  async getPaymentMethods(req: Request, res: Response) {
    try {
      const methods = await paymentMethodsService.getPaymentMethods();
      res.json(methods);
    } catch (error) {
      console.error("[PaymentMethodsController.getPaymentMethods]", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async createPaymentMethod(req: Request, res: Response) {
    try {
      const data = createPaymentMethodSchema.parse(req.body);
      const method = await paymentMethodsService.createPaymentMethod(data);
      res.status(201).json(method);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: (error as any).errors });
      }
      if (error instanceof Error && error.message.includes("already exists")) {
        return res.status(400).json({ error: error.message });
      }
      console.error("[PaymentMethodsController.createPaymentMethod]", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updatePaymentMethod(req: Request, res: Response) {
    try {
      const data = updatePaymentMethodSchema.parse(req.body);
      const method = await paymentMethodsService.updatePaymentMethod(req.params.id as string, data);
      res.json(method);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: (error as any).errors });
      }
      if (error instanceof Error) {
        if (error.message === "Payment method not found") {
          return res.status(404).json({ error: error.message });
        }
        if (error.message.includes("already exists")) {
          return res.status(400).json({ error: error.message });
        }
      }
      console.error("[PaymentMethodsController.updatePaymentMethod]", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async togglePaymentMethodStatus(req: Request, res: Response) {
    try {
      const data = togglePaymentMethodStatusSchema.parse(req.body);
      const method = await paymentMethodsService.togglePaymentMethodStatus(req.params.id as string, data);
      res.json(method);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: (error as any).errors });
      }
      if (error instanceof Error && error.message === "Payment method not found") {
        return res.status(404).json({ error: error.message });
      }
      console.error("[PaymentMethodsController.togglePaymentMethodStatus]", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
