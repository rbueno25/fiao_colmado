import express from "express";
import cors from "cors";
import { AppDataSource } from "./data-source";
import { Cliente } from "./entity/Cliente";
import { Producto } from "./entity/Producto";
import { Venta } from "./entity/Venta";
import { VentaDetalle } from "./entity/VentaDetalle";
import { Pago } from "./entity/Pago";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

const startServer = async () => {
    let retries = 5;
    while (retries >= 0) {
        try {
            await AppDataSource.initialize();
            console.log("Database initialized successfully!");
            break;
        } catch (err) {
            console.error("Error during Data Source initialization:", err);
            retries -= 1;
            if (retries === -1) process.exit(1);
            await new Promise(res => setTimeout(res, 5000));
        }
    }

    // Repositories
    const clientRepository = AppDataSource.getRepository(Cliente);
    const productRepository = AppDataSource.getRepository(Producto);
    const saleRepository = AppDataSource.getRepository(Venta);
    const paymentRepository = AppDataSource.getRepository(Pago);

    // --- PRODUCTOS ---
    app.get("/api/productos", async (req, res) => {
        const products = await productRepository.find();
        res.json(products);
    });

    // --- VENTAS ---
    app.get("/api/ventas", async (req, res) => {
        const sales = await saleRepository.find({
            relations: ["cliente", "detalles", "detalles.producto"],
            order: { fecha: "DESC" }
        });
        res.json(sales);
    });

    app.post("/api/ventas", async (req, res) => {
        try {
            const { clienteId, items, tipo, montoTotal } = req.body; // items: [{id, cantidad, subtotal}]
            
            const venta = new Venta();
            if (clienteId) {
                const client = await clientRepository.findOneBy({ id: clienteId });
                if (client) {
                    venta.cliente = client;
                    if (tipo === 'credito') {
                        client.deuda = Number(client.deuda) + Number(montoTotal);
                        await clientRepository.save(client);
                    }
                }
            }
            
            venta.montoTotal = montoTotal;
            venta.tipo = tipo;
            venta.detalles = [];

            for (const item of items) {
                const product = await productRepository.findOneBy({ id: item.id });
                if (product) {
                    const detail = new VentaDetalle();
                    detail.producto = product;
                    detail.cantidad = item.cantidad;
                    detail.subtotal = item.subtotal;
                    venta.detalles.push(detail);

                    // Update stock
                    product.stock -= item.cantidad;
                    await productRepository.save(product);
                }
            }

            const savedSale = await saleRepository.save(venta);
            res.status(201).json(savedSale);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al registrar la venta" });
        }
    });

    // --- PAGOS ---
    app.get("/api/pagos", async (req, res) => {
        const payments = await paymentRepository.find({
            relations: ["cliente"],
            order: { fecha: "DESC" },
            take: 50
        });
        const result = payments.map(p => ({
            id: p.id,
            monto: p.monto,
            fecha: p.fecha,
            nota: p.nota,
            clienteId: p.cliente?.id,
            clienteNombre: p.cliente?.nombre
        }));
        res.json(result);
    });

    app.post("/api/pagos", async (req, res) => {
        try {
            const { clienteId, monto, nota } = req.body;
            if (!clienteId || !monto || Number(monto) <= 0) {
                return res.status(400).json({ message: "clienteId y monto son requeridos." });
            }
            const client = await clientRepository.findOneBy({ id: clienteId });
            if (!client) return res.status(404).json({ message: "Cliente no encontrado" });

            const payment = new Pago();
            payment.cliente = client;
            payment.monto = Number(monto);
            payment.nota = nota || '';

            // Reduce client debt
            client.deuda = Math.max(0, Number(client.deuda) - Number(monto));
            await clientRepository.save(client);
            const savedPayment = await paymentRepository.save(payment);

            res.status(201).json({ ...savedPayment, clienteNombre: client.nombre });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al registrar el pago" });
        }
    });

    // --- REPORTES ---
    app.get("/api/reportes/auditoria-diaria", async (req, res) => {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const { Between } = require("typeorm");

            const salesToday = await saleRepository.find({
                where: { fecha: Between(today, tomorrow) }
            });

            const paymentsToday = await paymentRepository.find({
                where: { fecha: Between(today, tomorrow) }
            });

            const lowStockProducts = await productRepository.find({
                where: { stock: Between(-999, 10) } // Menos de 10 unidades
            });

            const summary = {
                totalVentas: salesToday.reduce((acc, s) => acc + Number(s.montoTotal), 0),
                ventasContado: salesToday.filter(s => s.tipo === 'contado').reduce((acc, s) => acc + Number(s.montoTotal), 0),
                ventasCredito: salesToday.filter(s => s.tipo === 'credito').reduce((acc, s) => acc + Number(s.montoTotal), 0),
                cobrosRealizados: paymentsToday.reduce((acc, p) => acc + Number(p.monto), 0),
                productosBajoStock: lowStockProducts.length,
                detalleBajoStock: lowStockProducts.map(p => ({ nombre: p.nombre, stock: p.stock }))
            };

            res.json(summary);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al generar reporte" });
        }
    });

    // --- CLIENTES ---
    app.get("/api/clientes", async (req, res) => {
        const clients = await clientRepository.find();
        res.json(clients);
    });

    // Start server
    app.listen(PORT, () => {
        console.log(`Fiao API Data server running at http://localhost:${PORT}`);
    });

};

startServer();
