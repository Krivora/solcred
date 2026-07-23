import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Seeding SolCred...");

    const hash = await bcrypt.hash("password123", 10);

    // ── Programa de crédito de prueba ──
    const programa = await prisma.programa.create({
        data: {
            nombre: "Crédito PyME Impulso",
            descripcion: "Programa de financiamiento para pequeñas y medianas empresas",
            objetivo: "Impulsar el crecimiento de PyMEs mediante acceso a capital",
            permitePersonaFisica: true,
            permitePersonaMoral: true,
            montoMinimo: 50000,
            montoMaximo: 2000000,
            tasaOrdinaria: 12.5,
            tasaMoratoria: 24,
            tasaAnual: 15,
            plazoMinimoMeses: 6,
            plazoMaximoMeses: 60,
            aval: "OPCIONAL",
            garantia: "OBLIGATORIO",
            datosFinancierosCompletos: true,
        },
    });

    // ── Tipos de documento ──
    const [identificacion, comprobanteDomicilio, actaConstitutiva] =
        await Promise.all([
            prisma.tipoDocumento.create({
                data: { nombre: "Identificación oficial", descripcion: "INE o pasaporte vigente" },
            }),
            prisma.tipoDocumento.create({
                data: { nombre: "Comprobante de domicilio", descripcion: "No mayor a 3 meses" },
            }),
            prisma.tipoDocumento.create({
                data: { nombre: "Acta constitutiva", descripcion: "Solo persona moral" },
            }),
        ]);

    await prisma.programaDocumento.createMany({
        data: [
            { programaId: programa.id, tipoDocumentoId: identificacion.id, esObligatorio: true, aplicaA: "AMBOS" },
            { programaId: programa.id, tipoDocumentoId: comprobanteDomicilio.id, esObligatorio: true, aplicaA: "AMBOS" },
            { programaId: programa.id, tipoDocumentoId: actaConstitutiva.id, esObligatorio: true, aplicaA: "MORAL" },
        ],
    });

    // ── Usuario ADMIN ──
    const admin = await prisma.usuario.create({
        data: {
            correo: "admin@solcred.com",
            contrasena: hash,
            tipoUsuario: "PERSONAL",
            tipoPersona: "FISICA",
            nombre: "Admin",
            apellidoPaterno: "Sistema",
            apellidoMaterno: "SolCred",
            personal: {
                create: {
                    rol: "ADMIN",
                    departamento: "Dirección",
                    extension: "1000",
                },
            },
        },
    });

    // ── Usuario SUPERVISOR ──
    const supervisor = await prisma.usuario.create({
        data: {
            correo: "supervisor@solcred.com",
            contrasena: hash,
            tipoUsuario: "PERSONAL",
            tipoPersona: "FISICA",
            nombre: "Laura",
            apellidoPaterno: "Martínez",
            apellidoMaterno: "Ruiz",
            personal: {
                create: {
                    rol: "SUPERVISOR",
                    departamento: "Operaciones",
                    extension: "1001",
                },
            },
        },
        include: { personal: true },
    });
    // ── Usuario GESTOR (con supervisor asignado) ──
    const gestor = await prisma.usuario.create({
    data: {
        correo: "gestor@solcred.com",
        contrasena: hash,
        tipoUsuario: "PERSONAL",
        tipoPersona: "FISICA",
        nombre: "Carlos",
        apellidoPaterno: "López",
        apellidoMaterno: "Hernández",
        personal: {
        create: {
            rol: "GESTOR",
            departamento: "Promoción",
            extension: "1002",
            supervisorId: supervisor.personal!.id,
        },
        },
    },
    include: { personal: true },
    });

    // ── Usuario ANALISTA ──
    const analista = await prisma.usuario.create({
        data: {
            correo: "analista@solcred.com",
            contrasena: hash,
            tipoUsuario: "PERSONAL",
            tipoPersona: "FISICA",
            nombre: "Mónica",
            apellidoPaterno: "Torres",
            apellidoMaterno: "Vega",
            personal: {
                create: {
                    rol: "ANALISTA",
                    departamento: "Riesgo",
                    extension: "1003",
                    supervisorId: supervisor.personal!.id,
                },
            },
        },
    });

    // ── Usuario CLIENTE ──
    const cliente = await prisma.usuario.create({
        data: {
            correo: "cliente@solcred.com",
            contrasena: hash,
            tipoUsuario: "CLIENTE",
            tipoPersona: "FISICA",
            nombre: "Jorge",
            apellidoPaterno: "Ramírez",
            apellidoMaterno: "Ortiz",
        },
    });

    // ── Grupo de gestión + regla + asignación del gestor ──
    const grupo = await prisma.grupoGestion.create({
        data: {
            nombre: "Grupo General PyME",
            descripcion: "Atiende solicitudes de persona física y moral sin regla especial",
            activo: true,
            prioridad: 1,
            reglas: {
                create: [
                    { campo: "PROGRAMA_ID", operador: "IGUAL", valor: programa.id },
                ],
            },
            gestores: {
                create: [{ gestorId: gestor.personal!.id }],
            },
        },
    });

    console.log({
        admin: admin.correo,
        supervisor: supervisor.correo,
        gestor: gestor.correo,
        analista: analista.correo,
        cliente: cliente.correo,
        programa: programa.nombre,
        grupo: grupo.nombre,
    });

    console.log("Seed completado. Password para todos: password123");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });