import express from "express";
import cors from "cors";
import { AppDataSource } from "./data-source";
import { Client } from "./entity/Client";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

const startServer = async () => {
    let retries = 5;
    while (retries >= 0) {
        try {
            await AppDataSource.initialize();
            console.log("Database connection established.");
            break;
        } catch (error) {
            console.error(`Database connection failed. Retries left: ${retries}`);
            retries -= 1;
            if (retries === -1) process.exit(1);
            await new Promise(res => setTimeout(res, 5000));
        }
    }

    // Repository
    const clientRepository = AppDataSource.getRepository(Client);

    // Get all clients
    app.get("/api/clientes", async (req, res) => {
        const clients = await clientRepository.find();
        res.json(clients);
    });

    // Create a new client
    app.post("/api/clientes", async (req, res) => {
        try {
            const { nombre, telefono, cedula, limite } = req.body;

            // Required validation
            if (!nombre || !telefono || !cedula || limite === undefined) {
                res.status(400).json({ message: "Todos los campos son obligatorios (nombre, telefono, cedula, limite)" });
                return;
            }

            // Phone format validation (XXX-XXX-XXXX)
            const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
            if (!phoneRegex.test(telefono)) {
                res.status(400).json({ message: "El formato del teléfono debe ser '809-555-1234'" });
                return;
            }

            // Cedula format validation (XXX-XXXXXXX-X)
            const cedulaRegex = /^\d{3}-\d{7}-\d{1}$/;
            if (!cedulaRegex.test(cedula)) {
                res.status(400).json({ message: "El formato de la cédula debe ser '001-9312809-2'" });
                return;
            }

            const client = clientRepository.create(req.body);
            const results = await clientRepository.save(client);
            res.status(201).json(results);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al crear cliente" });
        }
    });

    // Update a client
    app.put("/api/clientes/:id", async (req, res) => {
        try {
            const { nombre, telefono, cedula, limite } = req.body;

            // Field existence check for update
            if (!nombre || !telefono || !cedula || limite === undefined) {
                res.status(400).json({ message: "Todos los campos son obligatorios para actualizar" });
                return;
            }

            // Format validation again for update
            const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
            const cedulaRegex = /^\d{3}-\d{7}-\d{1}$/;

            if (!phoneRegex.test(telefono)) {
                res.status(400).json({ message: "El formato del teléfono debe ser '809-555-1234'" });
                return;
            }
            if (!cedulaRegex.test(cedula)) {
                res.status(400).json({ message: "El formato de la cédula debe ser '001-9312809-2'" });
                return;
            }

            const id = parseInt(req.params.id);
            const client = await clientRepository.findOneBy({ id });
            if (!client) {
                res.status(404).json({ message: "Cliente no encontrado" });
                return;
            }
            clientRepository.merge(client, req.body);
            const results = await clientRepository.save(client);
            res.json(results);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al actualizar cliente" });
        }
    });

    // Delete a client
    app.delete("/api/clientes/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const client = await clientRepository.findOneBy({ id });
            if (!client) {
                res.status(404).json({ message: "Cliente no encontrado" });
                return;
            }
            await clientRepository.remove(client);
            res.json({ message: "Cliente eliminado correctamente" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al eliminar cliente" });
        }
    });

    // Start server
    app.listen(PORT, () => {
        console.log(`Fiao API Data server running at http://localhost:${PORT}`);
    });

};

startServer();
