import { Router } from "express";
import { ProductsController } from "./controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorizeRole } from "../../middleware/authorize.js";

const router = Router();
const controller = new ProductsController();

// All routes require authentication
router.use(authenticate);

// List products (accessible by OWNER and EMPLOYEE)
router.get("/", controller.getProducts.bind(controller));

// Write operations (accessible by OWNER only)
router.post("/", authorizeRole(["OWNER"]), controller.createProduct.bind(controller));
router.put("/:id", authorizeRole(["OWNER"]), controller.updateProduct.bind(controller));
router.patch("/:id/status", authorizeRole(["OWNER"]), controller.toggleProductStatus.bind(controller));

export const productsRouter = router;
